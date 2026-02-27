package com.curelex.backend.service;

import com.curelex.backend.dto.PatientDTO;
import com.curelex.backend.model.Patient;
import com.curelex.backend.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private OtpService otpService;

    public Patient registerPatient(PatientDTO patientDTO,
            org.springframework.web.multipart.MultipartFile profileImage) {
        // Validate OTP
        if (!otpService.validateOtp(patientDTO.getEmail(), patientDTO.getOtp())) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        if (patientRepository.existsByEmail(patientDTO.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (patientRepository.existsByMobile(patientDTO.getMobile())) {
            throw new RuntimeException("Mobile number already exists");
        }

        String profileImageUrl = null;
        if (profileImage != null && !profileImage.isEmpty()) {
            profileImageUrl = fileStorageService.saveFile(profileImage, "patients/profile");
        }

        Patient patient = new Patient();
        patient.setFullName(patientDTO.getFullName());
        patient.setAge(patientDTO.getAge());
        patient.setGender(patientDTO.getGender());
        patient.setMobile(patientDTO.getMobile());
        patient.setEmail(patientDTO.getEmail());
        patient.setAddress(patientDTO.getAddress());
        patient.setEmergencyContact(patientDTO.getEmergencyContact());
        patient.setAadhaarNumber(patientDTO.getAadhaarNumber()); // Should encrypt this in real app
        patient.setPassword(passwordEncoder.encode(patientDTO.getPassword()));

        if (profileImageUrl != null) {
            patient.setProfileImageUrl(profileImageUrl);
        }

        Patient savedPatient = patientRepository.save(patient);

        // Trigger Email (Async ideally, but sync for now)
        try {
            emailService.sendPatientRegistrationEmail(
                    savedPatient.getFullName(),
                    savedPatient.getEmail(),
                    savedPatient.getMobile(),
                    savedPatient.getAadhaarNumber());
        } catch (Exception e) {
            System.err.println("Email failed but registration continued: " + e.getMessage());
        }

        return savedPatient;
    }

    public com.curelex.backend.dto.PatientProfileDTO getPatientProfileByEmail(String email) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return convertToProfileDTO(patient);
    }

    public com.curelex.backend.dto.PatientProfileDTO getPatientProfile(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return convertToProfileDTO(patient);
    }

    private com.curelex.backend.dto.PatientProfileDTO convertToProfileDTO(Patient patient) {
        com.curelex.backend.dto.PatientProfileDTO dto = new com.curelex.backend.dto.PatientProfileDTO();
        dto.setId(patient.getId());
        dto.setFullName(patient.getFullName());
        dto.setAge(patient.getAge());
        dto.setGender(patient.getGender());
        dto.setMobile(patient.getMobile());
        dto.setEmail(patient.getEmail());
        dto.setAddress(patient.getAddress());
        dto.setEmergencyContact(patient.getEmergencyContact());
        dto.setAadhaarNumber(patient.getAadhaarNumber());
        dto.setProfileImageUrl(patient.getProfileImageUrl());
        return dto;
    }
}
