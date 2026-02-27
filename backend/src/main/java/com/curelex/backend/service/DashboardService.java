package com.curelex.backend.service;

import com.curelex.backend.dto.*;
import com.curelex.backend.model.*;
import com.curelex.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

        @Autowired
        private PatientRepository patientRepository;
        @Autowired
        private SymptomRepository symptomRepository;
        @Autowired
        private ConsultationRepository consultationRepository;
        @Autowired
        private PrescriptionRepository prescriptionRepository;
        @Autowired
        private FollowUpRepository followUpRepository;
        @Autowired
        private DoctorRepository doctorRepository;

        private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("MMM dd, hh:mm a");

        // --- Prescriptions ---
        public List<PrescriptionDetailDTO> getPrescriptions(String email) {
                Patient patient = findPatient(email);
                List<Prescription> scripts = prescriptionRepository
                                .findByPatientIdOrderByCreatedAtDesc(patient.getId());

                return scripts.stream().map(p -> {
                        String doctorName = doctorRepository.findById(p.getDoctorId())
                                        .map(Doctor::getFullName).orElse("Unknown Doctor");

                        List<PrescriptionDetailDTO.MedicineDTO> meds = p.getMedicines() != null
                                        ? p.getMedicines().stream()
                                                        .map(m -> new PrescriptionDetailDTO.MedicineDTO(
                                                                        m.getId(), m.getMedicineName(), m.getDosage(),
                                                                        m.getFrequency(), m.getDuration()))
                                                        .collect(Collectors.toList())
                                        : new ArrayList<>();

                        return new PrescriptionDetailDTO(
                                        p.getId(), doctorName, p.getNotes(),
                                        p.getCreatedAt() != null ? p.getCreatedAt().format(DATE_FMT) : "",
                                        meds);
                }).collect(Collectors.toList());
        }

        // --- Follow-Ups ---
        public List<FollowUpDTO> getFollowUps(String email) {
                Patient patient = findPatient(email);
                List<FollowUp> followUps = followUpRepository.findByPatientIdOrderByNextVisitDateDesc(patient.getId());

                return followUps.stream().map(f -> {
                        String doctorName = doctorRepository.findById(f.getDoctorId())
                                        .map(Doctor::getFullName).orElse("Unknown Doctor");

                        String mode = "In-Person";
                        if (f.getConsultationId() != null) {
                                mode = consultationRepository.findById(f.getConsultationId())
                                                .map(Consultation::getMode).orElse("In-Person");
                        }

                        long daysRemaining = 0;
                        if (f.getNextVisitDate() != null) {
                                daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), f.getNextVisitDate());
                                if (daysRemaining < 0)
                                        daysRemaining = 0;
                        }

                        return new FollowUpDTO(
                                        f.getId(), doctorName,
                                        f.getNextVisitDate() != null ? f.getNextVisitDate().format(DATE_FMT) : "",
                                        f.getStatus(), f.getRemarks(), mode, daysRemaining);
                }).collect(Collectors.toList());
        }

        // --- Unified Timeline ---
        public List<TimelineEventDTO> getTimeline(String email) {
                Patient patient = findPatient(email);
                Long pid = patient.getId();
                List<TimelineEventDTO> events = new ArrayList<>();

                // Symptoms
                symptomRepository.findByPatientIdOrderByCreatedAtDesc(pid).forEach(s -> {
                        events.add(new TimelineEventDTO(
                                        s.getId(), "SYMPTOM", "Symptoms Submitted",
                                        s.getSymptomName() + " (" + s.getSeverity() + ")",
                                        s.getCreatedAt() != null ? s.getCreatedAt().format(DATETIME_FMT) : "",
                                        s.getCreatedAt() != null ? s.getCreatedAt().toString() : ""));
                });

                // Consultations
                consultationRepository.findByPatientIdOrderByConsultationDateDesc(pid).forEach(c -> {
                        String doctorName = doctorRepository.findById(c.getDoctorId())
                                        .map(Doctor::getFullName).orElse("Doctor");
                        events.add(new TimelineEventDTO(
                                        c.getId(), "CONSULTATION", "Doctor Consultation",
                                        doctorName + " (" + c.getMode() + ")",
                                        c.getConsultationDate() != null ? c.getConsultationDate().format(DATETIME_FMT)
                                                        : "",
                                        c.getConsultationDate() != null ? c.getConsultationDate().toString() : ""));
                });

                // Prescriptions
                prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(pid).forEach(p -> {
                        String doctorName = doctorRepository.findById(p.getDoctorId())
                                        .map(Doctor::getFullName).orElse("Doctor");
                        events.add(new TimelineEventDTO(
                                        p.getId(), "PRESCRIPTION", "Prescription Added",
                                        doctorName + " — " + (p.getNotes() != null ? p.getNotes() : ""),
                                        p.getCreatedAt() != null ? p.getCreatedAt().format(DATETIME_FMT) : "",
                                        p.getCreatedAt() != null ? p.getCreatedAt().toString() : ""));
                });

                // Follow-ups
                followUpRepository.findByPatientIdOrderByNextVisitDateDesc(pid).forEach(f -> {
                        String doctorName = doctorRepository.findById(f.getDoctorId())
                                        .map(Doctor::getFullName).orElse("Doctor");
                        events.add(new TimelineEventDTO(
                                        f.getId(), "FOLLOWUP", "Follow-up Scheduled",
                                        doctorName + " — "
                                                        + (f.getNextVisitDate() != null
                                                                        ? f.getNextVisitDate().format(DATE_FMT)
                                                                        : ""),
                                        f.getCreatedAt() != null ? f.getCreatedAt().format(DATETIME_FMT) : "",
                                        f.getCreatedAt() != null ? f.getCreatedAt().toString() : ""));
                });

                // Sort by timestamp descending (newest first)
                events.sort(Comparator.comparing(TimelineEventDTO::getTimestamp).reversed());
                return events;
        }

        // --- Emergency Contacts (Consulted Doctors) ---
        public List<java.util.Map<String, Object>> getEmergencyContacts(String email) {
                Patient patient = findPatient(email);
                List<Consultation> consultations = consultationRepository
                                .findByPatientIdOrderByConsultationDateDesc(patient.getId());

                // Get distinct doctor IDs from consultations
                java.util.Set<Long> seenDoctorIds = new java.util.LinkedHashSet<>();
                for (Consultation c : consultations) {
                        seenDoctorIds.add(c.getDoctorId());
                }

                List<java.util.Map<String, Object>> contacts = new ArrayList<>();
                for (Long doctorId : seenDoctorIds) {
                        doctorRepository.findById(doctorId).ifPresent(doc -> {
                                if (doc.getIsApproved() != null && doc.getIsApproved()) {
                                        java.util.Map<String, Object> contact = new java.util.LinkedHashMap<>();
                                        contact.put("id", doc.getId());
                                        contact.put("name", "Dr. " + doc.getFullName());
                                        contact.put("specialization", doc.getSpecialization());
                                        contact.put("hospital", doc.getCurrentHospital());
                                        contact.put("mobile", doc.getMobile());
                                        contact.put("email", doc.getEmail());
                                        contacts.add(contact);
                                }
                        });
                }
                return contacts;
        }

        private Patient findPatient(String email) {
                return patientRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Patient not found"));
        }
}
