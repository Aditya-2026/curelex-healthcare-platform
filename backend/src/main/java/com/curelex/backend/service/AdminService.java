package com.curelex.backend.service;

import com.curelex.backend.dto.AuthResponse;
import com.curelex.backend.model.*;
import com.curelex.backend.repository.*;
import com.curelex.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private ContactRepository contactRepository;
    @Autowired
    private ConsultationRepository consultationRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    // --- Admin Login ---
    public AuthResponse adminLogin(String email, String password) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(admin.getEmail(), "admin", admin.getId());
        return new AuthResponse(token, "admin", admin.getName(), admin.getId(), null);
    }

    // --- Overview Stats ---
    public Map<String, Object> getOverviewStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalPatients", patientRepository.count());
        stats.put("totalDoctors", doctorRepository.count());
        stats.put("pendingApprovals", doctorRepository.findByIsApproved(false).size());
        stats.put("totalConsultations", consultationRepository.count());
        return stats;
    }

    // --- Pending Doctors ---
    public List<Map<String, Object>> getPendingDoctors() {
        return doctorRepository.findByIsApproved(false).stream().map(d -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", d.getId());
            item.put("fullName", d.getFullName());
            item.put("email", d.getEmail());
            item.put("specialization", d.getSpecialization());
            item.put("registrationNumber", d.getRegistrationNumber());
            item.put("currentHospital", d.getCurrentHospital());
            item.put("experienceYears", d.getExperienceYears());
            item.put("certificateUrl", d.getCertificateUrl());
            item.put("photoUrl", d.getPhotoUrl());
            item.put("createdAt", d.getCreatedAt() != null ? d.getCreatedAt().toString() : "");
            return item;
        }).collect(Collectors.toList());
    }

    // --- Approve Doctor ---
    public void approveDoctor(Long doctorId, Long adminId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setIsApproved(true);
        doctor.setIsActive(true);
        doctor.setAccountStatus("ACTIVE");
        doctor.setApprovedBy(adminId);
        doctor.setApprovalDate(LocalDateTime.now());
        doctorRepository.save(doctor);
    }

    // --- Reject Doctor (from pending queue) ---
    public void rejectDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctorRepository.delete(doctor);
    }

    // --- Disable Doctor (soft — moves back to approval queue) ---
    public void disableDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setIsApproved(false);
        doctor.setIsActive(false);
        doctor.setAccountStatus("DISABLED");
        doctor.setApprovalDate(null);
        doctor.setApprovedBy(null);
        doctor.setAdminSeen(false); // ← triggers unseen notification badge
        doctorRepository.save(doctor);
    }

    // --- Remove Doctor (permanent delete from database) ---
    public void removeDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctorRepository.delete(doctor);
    }

    // --- All Doctors ---
    public List<Map<String, Object>> getAllDoctors() {
        return doctorRepository.findAll().stream().map(d -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", d.getId());
            item.put("fullName", d.getFullName());
            item.put("email", d.getEmail());
            item.put("specialization", d.getSpecialization());
            item.put("currentHospital", d.getCurrentHospital());
            item.put("experienceYears", d.getExperienceYears());
            item.put("isApproved", d.getIsApproved());
            item.put("isActive", d.getIsActive());
            item.put("accountStatus", d.getAccountStatus());
            item.put("certificateUrl", d.getCertificateUrl());
            item.put("photoUrl", d.getPhotoUrl());
            item.put("createdAt", d.getCreatedAt() != null ? d.getCreatedAt().toString() : "");
            return item;
        }).collect(Collectors.toList());
    }

    // --- All Patients ---
    public List<Map<String, Object>> getAllPatients() {
        return patientRepository.findAll().stream().map(p -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", p.getId());
            item.put("fullName", p.getFullName());
            item.put("email", p.getEmail());
            item.put("age", p.getAge());
            item.put("gender", p.getGender());
            item.put("mobile", p.getMobile());
            item.put("profileImageUrl", p.getProfileImageUrl());
            item.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : "");
            return item;
        }).collect(Collectors.toList());
    }

    // --- Contact Messages ---
    public List<Contact> getContactMessages() {
        return contactRepository.findAll();
    }

    // --- Activity Logs ---
    public List<Map<String, Object>> getActivityLogs() {
        List<Map<String, Object>> logs = new ArrayList<>();

        // Recent doctor approvals
        doctorRepository.findByIsApproved(true).stream()
                .filter(d -> d.getApprovalDate() != null)
                .sorted(Comparator.comparing(Doctor::getApprovalDate).reversed())
                .limit(10)
                .forEach(d -> {
                    Map<String, Object> log = new LinkedHashMap<>();
                    log.put("type", "DOCTOR_APPROVED");
                    log.put("description", "Dr. " + d.getFullName() + " approved");
                    log.put("date", d.getApprovalDate().toString());
                    logs.add(log);
                });

        // Recent consultations
        consultationRepository.findAll().stream()
                .sorted(Comparator.comparing(Consultation::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(10)
                .forEach(c -> {
                    Map<String, Object> log = new LinkedHashMap<>();
                    log.put("type", "CONSULTATION_CREATED");
                    log.put("description", "Consultation #" + c.getId() + " — " + c.getStatus());
                    log.put("date", c.getCreatedAt() != null ? c.getCreatedAt().toString() : "");
                    logs.add(log);
                });

        // Sort all by date descending
        logs.sort((a, b) -> {
            String da = (String) a.getOrDefault("date", "");
            String db = (String) b.getOrDefault("date", "");
            return db.compareTo(da);
        });

        return logs.stream().limit(15).collect(Collectors.toList());
    }
}
