package com.curelex.backend.service;

import com.curelex.backend.dto.ConsultationRequestDTO;
import com.curelex.backend.model.*;
import com.curelex.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DoctorDashboardService {

        @Autowired
        private DoctorRepository doctorRepository;
        @Autowired
        private PatientRepository patientRepository;
        @Autowired
        private SymptomRepository symptomRepository;
        @Autowired
        private ConsultationRepository consultationRepository;
        @Autowired
        private PrescriptionRepository prescriptionRepository;
        @Autowired
        private MedicineRepository medicineRepository;
        @Autowired
        private FollowUpRepository followUpRepository;

        // --- Doctor identity ---
        private Doctor findDoctor(String email) {
                return doctorRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        }

        // ═══════════════════════════════════════════════════════════════
        // STATS
        // ═══════════════════════════════════════════════════════════════
        public Map<String, Object> getDoctorStats(String email) {
                Doctor doctor = findDoctor(email);
                Long docId = doctor.getId();

                long todayConsultations = consultationRepository.findByDoctorIdOrderByConsultationDateDesc(docId)
                                .stream()
                                .filter(c -> c.getConsultationDate() != null
                                                && c.getConsultationDate().toLocalDate().equals(LocalDate.now()))
                                .count();

                // Pending = unassigned consultations in the pool
                long pendingPool = consultationRepository
                                .findByStatusAndDoctorIdIsNullOrderByCreatedAtAsc("PENDING").size();

                // Doctor's active consultations
                long activeConsultations = consultationRepository
                                .findByDoctorIdAndStatus(docId, "ACTIVE").size();

                long followUpsDueToday = followUpRepository.findByDoctorIdOrderByNextVisitDateDesc(docId)
                                .stream()
                                .filter(f -> f.getNextVisitDate() != null
                                                && f.getNextVisitDate().equals(LocalDate.now()))
                                .count();

                long totalPatients = consultationRepository.findByDoctorIdOrderByConsultationDateDesc(docId)
                                .stream()
                                .map(Consultation::getPatientId)
                                .distinct()
                                .count();

                Map<String, Object> stats = new HashMap<>();
                stats.put("todayPatients", todayConsultations);
                stats.put("pendingConsultations", pendingPool);
                stats.put("activeConsultations", activeConsultations);
                stats.put("followUpsDueToday", followUpsDueToday);
                stats.put("totalActivePatients", totalPatients);
                return stats;
        }

        // ═══════════════════════════════════════════════════════════════
        // PATIENT QUEUE — shows pending pool + doctor's active patients
        // ═══════════════════════════════════════════════════════════════
        public List<Map<String, Object>> getPatientQueue(String email) {
                Doctor doctor = findDoctor(email);
                Long docId = doctor.getId();
                List<Map<String, Object>> queue = new ArrayList<>();

                // A) Unassigned PENDING consultations (the pool)
                List<Consultation> pendingConsultations = consultationRepository
                                .findByStatusAndDoctorIdIsNullOrderByCreatedAtAsc("PENDING");

                for (Consultation c : pendingConsultations) {
                        Patient patient = patientRepository.findById(c.getPatientId()).orElse(null);
                        if (patient == null)
                                continue;

                        List<Symptom> activeSymptoms = symptomRepository
                                        .findByPatientIdAndStatusOrderByCreatedAtDesc(c.getPatientId(), "ACTIVE");

                        Map<String, Object> item = buildQueueItem(patient, activeSymptoms);
                        item.put("consultationId", c.getId());
                        item.put("consultationStatus", "PENDING");
                        item.put("canAccept", true);
                        queue.add(item);
                }

                // B) Doctor's own ACTIVE consultations
                List<Consultation> activeConsultations = consultationRepository
                                .findByDoctorIdAndStatus(docId, "ACTIVE");

                for (Consultation c : activeConsultations) {
                        Patient patient = patientRepository.findById(c.getPatientId()).orElse(null);
                        if (patient == null)
                                continue;

                        List<Symptom> activeSymptoms = symptomRepository
                                        .findByPatientIdAndStatusOrderByCreatedAtDesc(c.getPatientId(), "ACTIVE");

                        Map<String, Object> item = buildQueueItem(patient, activeSymptoms);
                        item.put("consultationId", c.getId());
                        item.put("consultationStatus", "ACTIVE");
                        item.put("canAccept", false);
                        queue.add(item);
                }

                return queue;
        }

        private Map<String, Object> buildQueueItem(Patient patient, List<Symptom> symptoms) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("patientId", patient.getId());
                item.put("patientName", patient.getFullName());
                item.put("age", patient.getAge());
                item.put("gender", patient.getGender());
                item.put("profileImageUrl", patient.getProfileImageUrl());
                item.put("symptoms", symptoms.stream()
                                .map(s -> s.getSymptomName() + " (" + s.getSeverity() + ")")
                                .collect(Collectors.toList()));
                item.put("symptomCount", symptoms.size());
                item.put("earliestSymptomDate", symptoms.stream()
                                .map(Symptom::getCreatedAt)
                                .filter(Objects::nonNull)
                                .min(Comparator.naturalOrder())
                                .map(Object::toString)
                                .orElse(""));
                return item;
        }

        // ═══════════════════════════════════════════════════════════════
        // ACCEPT CONSULTATION — race-safe with pessimistic lock
        // ═══════════════════════════════════════════════════════════════
        @Transactional
        public Map<String, Object> acceptConsultation(String doctorEmail, Long consultationId) {
                Doctor doctor = findDoctor(doctorEmail);

                // Pessimistic lock — prevents two doctors accepting simultaneously
                Consultation consultation = consultationRepository.findByIdForUpdate(consultationId)
                                .orElseThrow(() -> new RuntimeException("Consultation not found"));

                if (consultation.getDoctorId() != null) {
                        throw new RuntimeException("Consultation already assigned to another doctor");
                }
                if (!"PENDING".equals(consultation.getStatus())) {
                        throw new RuntimeException("Consultation is not in PENDING state");
                }

                consultation.setDoctorId(doctor.getId());
                consultation.setStatus("ACTIVE");
                consultationRepository.save(consultation);

                Map<String, Object> result = new LinkedHashMap<>();
                result.put("consultationId", consultation.getId());
                result.put("patientId", consultation.getPatientId());
                result.put("status", "ACTIVE");
                result.put("message", "Consultation accepted successfully");
                return result;
        }

        // ═══════════════════════════════════════════════════════════════
        // COMPLETE CONSULTATION — only assigned doctor can complete
        // ═══════════════════════════════════════════════════════════════
        @Transactional
        public Map<String, Object> completeConsultation(String doctorEmail, Long consultationId) {
                Doctor doctor = findDoctor(doctorEmail);

                Consultation consultation = consultationRepository.findById(consultationId)
                                .orElseThrow(() -> new RuntimeException("Consultation not found"));

                if (!doctor.getId().equals(consultation.getDoctorId())) {
                        throw new RuntimeException("Access denied: You are not assigned to this consultation");
                }
                if (!"ACTIVE".equals(consultation.getStatus())) {
                        throw new RuntimeException("Only ACTIVE consultations can be completed");
                }

                consultation.setStatus("COMPLETED");
                consultationRepository.save(consultation);

                // Mark patient symptoms as RESOLVED
                List<Symptom> activeSymptoms = symptomRepository
                                .findByPatientIdAndStatusOrderByCreatedAtDesc(consultation.getPatientId(), "ACTIVE");
                for (Symptom s : activeSymptoms) {
                        s.setStatus("RESOLVED");
                }
                symptomRepository.saveAll(activeSymptoms);

                Map<String, Object> result = new LinkedHashMap<>();
                result.put("consultationId", consultation.getId());
                result.put("status", "COMPLETED");
                result.put("message", "Consultation completed successfully");
                return result;
        }

        // ═══════════════════════════════════════════════════════════════
        // PATIENT HISTORY — with ownership check
        // ═══════════════════════════════════════════════════════════════
        public Map<String, Object> getPatientHistory(Long patientId, String doctorEmail) {
                Doctor doctor = findDoctor(doctorEmail);

                // Ownership check: doctor must have an ACTIVE consultation with this patient
                boolean hasAccess = consultationRepository
                                .findByDoctorIdAndStatus(doctor.getId(), "ACTIVE")
                                .stream()
                                .anyMatch(c -> c.getPatientId().equals(patientId));

                // Also allow if there's a COMPLETED consultation
                if (!hasAccess) {
                        hasAccess = consultationRepository
                                        .findByDoctorIdAndStatusInOrderByUpdatedAtDesc(doctor.getId(),
                                                        List.of("ACTIVE", "COMPLETED"))
                                        .stream()
                                        .anyMatch(c -> c.getPatientId().equals(patientId));
                }

                if (!hasAccess) {
                        throw new RuntimeException("Access denied: No active consultation with this patient");
                }

                Patient patient = patientRepository.findById(patientId)
                                .orElseThrow(() -> new RuntimeException("Patient not found"));

                Map<String, Object> history = new LinkedHashMap<>();
                history.put("patientId", patient.getId());
                history.put("patientName", patient.getFullName());
                history.put("age", patient.getAge());
                history.put("gender", patient.getGender());

                history.put("activeSymptoms", symptomRepository
                                .findByPatientIdAndStatusOrderByCreatedAtDesc(patientId, "ACTIVE"));
                history.put("allSymptoms", symptomRepository
                                .findByPatientIdOrderByCreatedAtDesc(patientId));

                List<Prescription> prescriptions = prescriptionRepository
                                .findByPatientIdOrderByCreatedAtDesc(patientId);
                List<Map<String, Object>> prescriptionList = new ArrayList<>();
                for (Prescription p : prescriptions) {
                        Map<String, Object> pMap = new LinkedHashMap<>();
                        pMap.put("id", p.getId());
                        pMap.put("doctorName", doctorRepository.findById(p.getDoctorId())
                                        .map(Doctor::getFullName).orElse("Unknown"));
                        pMap.put("notes", p.getNotes());
                        pMap.put("date", p.getCreatedAt() != null ? p.getCreatedAt().toString() : "");
                        pMap.put("medicines", p.getMedicines());
                        prescriptionList.add(pMap);
                }
                history.put("prescriptions", prescriptionList);

                history.put("followUps", followUpRepository
                                .findByPatientIdOrderByNextVisitDateDesc(patientId));

                return history;
        }

        // Backward-compat wrapper (no auth)
        public Map<String, Object> getPatientHistory(Long patientId) {
                Patient patient = patientRepository.findById(patientId)
                                .orElseThrow(() -> new RuntimeException("Patient not found"));

                Map<String, Object> history = new LinkedHashMap<>();
                history.put("patientId", patient.getId());
                history.put("patientName", patient.getFullName());
                history.put("age", patient.getAge());
                history.put("gender", patient.getGender());
                history.put("activeSymptoms", symptomRepository
                                .findByPatientIdAndStatusOrderByCreatedAtDesc(patientId, "ACTIVE"));
                history.put("allSymptoms", symptomRepository
                                .findByPatientIdOrderByCreatedAtDesc(patientId));

                List<Prescription> prescriptions = prescriptionRepository
                                .findByPatientIdOrderByCreatedAtDesc(patientId);
                List<Map<String, Object>> prescriptionList = new ArrayList<>();
                for (Prescription p : prescriptions) {
                        Map<String, Object> pMap = new LinkedHashMap<>();
                        pMap.put("id", p.getId());
                        pMap.put("doctorName", doctorRepository.findById(p.getDoctorId())
                                        .map(Doctor::getFullName).orElse("Unknown"));
                        pMap.put("notes", p.getNotes());
                        pMap.put("date", p.getCreatedAt() != null ? p.getCreatedAt().toString() : "");
                        pMap.put("medicines", p.getMedicines());
                        prescriptionList.add(pMap);
                }
                history.put("prescriptions", prescriptionList);
                history.put("followUps", followUpRepository
                                .findByPatientIdOrderByNextVisitDateDesc(patientId));

                return history;
        }

        // ═══════════════════════════════════════════════════════════════
        // CREATE CONSULTATION — with ownership validation
        // ═══════════════════════════════════════════════════════════════
        @Transactional
        public Map<String, Object> createConsultation(String doctorEmail, ConsultationRequestDTO dto) {
                Doctor doctor = findDoctor(doctorEmail);

                // Ownership check: doctor must have an ACTIVE consultation with this patient
                Consultation activeConsultation = consultationRepository
                                .findByDoctorIdAndStatus(doctor.getId(), "ACTIVE")
                                .stream()
                                .filter(c -> c.getPatientId().equals(dto.getPatientId()))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException(
                                                "Access denied: You must accept the consultation before treating this patient"));

                // Update the existing consultation with diagnosis
                activeConsultation.setDiagnosis(dto.getDiagnosis());
                activeConsultation.setMode(dto.getMode());
                activeConsultation.setConsultationDate(LocalDateTime.now());
                activeConsultation.setStatus("COMPLETED");
                consultationRepository.save(activeConsultation);

                Map<String, Object> result = new LinkedHashMap<>();
                result.put("consultationId", activeConsultation.getId());

                // Create Prescription + Medicines
                if (dto.getMedicines() != null && !dto.getMedicines().isEmpty()) {
                        Prescription prescription = new Prescription();
                        prescription.setConsultationId(activeConsultation.getId());
                        prescription.setPatientId(dto.getPatientId());
                        prescription.setDoctorId(doctor.getId());
                        prescription.setNotes(dto.getPrescriptionNotes());
                        prescription = prescriptionRepository.save(prescription);

                        for (ConsultationRequestDTO.MedicineItem mi : dto.getMedicines()) {
                                Medicine med = new Medicine();
                                med.setPrescriptionId(prescription.getId());
                                med.setMedicineName(mi.getMedicineName());
                                med.setDosage(mi.getDosage());
                                med.setFrequency(mi.getFrequency());
                                med.setDuration(mi.getDuration());
                                med.setInstructions(mi.getInstructions());
                                medicineRepository.save(med);
                        }
                        result.put("prescriptionId", prescription.getId());
                }

                // Create Follow-Up
                if (dto.getNextVisitDate() != null && !dto.getNextVisitDate().isEmpty()) {
                        FollowUp followUp = new FollowUp();
                        followUp.setConsultationId(activeConsultation.getId());
                        followUp.setPatientId(dto.getPatientId());
                        followUp.setDoctorId(doctor.getId());
                        followUp.setNextVisitDate(LocalDate.parse(dto.getNextVisitDate()));
                        followUp.setMode(dto.getFollowUpMode());
                        followUp.setStatus("PENDING");
                        followUp.setRemarks(dto.getFollowUpRemarks());
                        followUpRepository.save(followUp);
                        result.put("followUpCreated", true);
                }

                // Mark symptoms as RESOLVED
                List<Symptom> activeSymptoms = symptomRepository
                                .findByPatientIdAndStatusOrderByCreatedAtDesc(dto.getPatientId(), "ACTIVE");
                for (Symptom s : activeSymptoms) {
                        s.setStatus("RESOLVED");
                }
                symptomRepository.saveAll(activeSymptoms);

                result.put("status", "SUCCESS");
                return result;
        }

        // ═══════════════════════════════════════════════════════════════
        // RECENT ACTIVITY
        // ═══════════════════════════════════════════════════════════════
        public List<Map<String, Object>> getRecentActivity(String email) {
                Doctor doctor = findDoctor(email);
                Long docId = doctor.getId();
                List<Map<String, Object>> activity = new ArrayList<>();

                consultationRepository.findByDoctorIdOrderByConsultationDateDesc(docId)
                                .stream().limit(10).forEach(c -> {
                                        Map<String, Object> item = new LinkedHashMap<>();
                                        item.put("type", "CONSULTATION");
                                        String patientName = patientRepository.findById(c.getPatientId())
                                                        .map(Patient::getFullName).orElse("Patient");
                                        item.put("description", "Consultation with " + patientName);
                                        item.put("date", c.getConsultationDate() != null
                                                        ? c.getConsultationDate().toString()
                                                        : "");
                                        item.put("status", c.getStatus());
                                        activity.add(item);
                                });

                prescriptionRepository.findByDoctorIdOrderByCreatedAtDesc(docId)
                                .stream().limit(5).forEach(p -> {
                                        Map<String, Object> item = new LinkedHashMap<>();
                                        item.put("type", "PRESCRIPTION");
                                        String patientName = patientRepository.findById(p.getPatientId())
                                                        .map(Patient::getFullName).orElse("Patient");
                                        item.put("description", "Prescription for " + patientName);
                                        item.put("date", p.getCreatedAt() != null ? p.getCreatedAt().toString() : "");
                                        activity.add(item);
                                });

                activity.sort((a, b) -> {
                        String da = (String) a.getOrDefault("date", "");
                        String db = (String) b.getOrDefault("date", "");
                        return db.compareTo(da);
                });

                return activity.stream().limit(10).collect(Collectors.toList());
        }
}
