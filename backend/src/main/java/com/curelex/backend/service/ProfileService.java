package com.curelex.backend.service;

import com.curelex.backend.dto.ProfileUpdateDTO;
import com.curelex.backend.model.Doctor;
import com.curelex.backend.model.Patient;
import com.curelex.backend.repository.DoctorRepository;
import com.curelex.backend.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class ProfileService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    // ─── GET PROFILE ───────────────────────────────────────────
    public Map<String, Object> getProfile(String email, String role) {
        Map<String, Object> profile = new LinkedHashMap<>();

        if ("patient".equalsIgnoreCase(role)) {
            Patient p = patientRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));
            profile.put("role", "patient");
            profile.put("fullName", p.getFullName());
            profile.put("email", p.getEmail());
            profile.put("mobile", p.getMobile());
            profile.put("age", p.getAge());
            profile.put("gender", p.getGender());
            profile.put("address", p.getAddress());
            profile.put("aadhaarNumber", p.getAadhaarNumber());
            profile.put("emergencyContact", p.getEmergencyContact());
            profile.put("profileImageUrl", p.getProfileImageUrl());

        } else if ("doctor".equalsIgnoreCase(role)) {
            Doctor d = doctorRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));
            profile.put("role", "doctor");
            profile.put("fullName", d.getFullName());
            profile.put("email", d.getEmail());
            profile.put("mobile", d.getMobile());
            profile.put("age", d.getAge());
            profile.put("gender", d.getGender());
            profile.put("specialization", d.getSpecialization());
            profile.put("registrationNumber", d.getRegistrationNumber());
            profile.put("currentHospital", d.getCurrentHospital());
            profile.put("experienceYears", d.getExperienceYears());
            profile.put("photoUrl", d.getPhotoUrl());
        } else {
            throw new RuntimeException("Unsupported role: " + role);
        }

        return profile;
    }

    // ─── UPDATE PROFILE (No OTP, No email/aadhaar/regNumber change) ──
    public Map<String, Object> updateProfile(String currentEmail, String role, ProfileUpdateDTO dto) {

        if ("patient".equalsIgnoreCase(role)) {
            Patient p = patientRepository.findByEmail(currentEmail)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            if (dto.getFullName() != null)
                p.setFullName(dto.getFullName());
            if (dto.getMobile() != null)
                p.setMobile(dto.getMobile());
            if (dto.getAddress() != null)
                p.setAddress(dto.getAddress());
            if (dto.getGender() != null)
                p.setGender(dto.getGender());
            if (dto.getAge() != null)
                p.setAge(dto.getAge());
            // Email and Aadhaar are NEVER updated

            patientRepository.save(p);

        } else if ("doctor".equalsIgnoreCase(role)) {
            Doctor d = doctorRepository.findByEmail(currentEmail)
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));

            if (dto.getFullName() != null)
                d.setFullName(dto.getFullName());
            if (dto.getMobile() != null)
                d.setMobile(dto.getMobile());
            if (dto.getGender() != null)
                d.setGender(dto.getGender());
            if (dto.getAge() != null)
                d.setAge(dto.getAge());
            // Email and Registration Number are NEVER updated

            doctorRepository.save(d);
        } else {
            throw new RuntimeException("Unsupported role: " + role);
        }

        return getProfile(currentEmail, role);
    }
}
