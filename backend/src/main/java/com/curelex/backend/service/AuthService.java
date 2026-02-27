package com.curelex.backend.service;

import com.curelex.backend.dto.AuthResponse;
import com.curelex.backend.dto.LoginRequest;
import com.curelex.backend.model.Doctor;
import com.curelex.backend.model.Patient;
import com.curelex.backend.repository.DoctorRepository;
import com.curelex.backend.repository.PatientRepository;
import com.curelex.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OtpService otpService;

    public AuthResponse login(LoginRequest request) {
        String role = request.getRole().toLowerCase();

        if ("patient".equals(role)) {
            Patient patient = patientRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            if (!passwordEncoder.matches(request.getPassword(), patient.getPassword())) {
                throw new RuntimeException("Invalid credentials");
            }

            String token = jwtUtil.generateToken(patient.getEmail(), "patient", patient.getId());
            return new AuthResponse(token, "patient", patient.getFullName(), patient.getId(),
                    patient.getProfileImageUrl());

        } else if ("doctor".equals(role)) {
            // For doctor, check by email (need to add email to doctor repo lookup if not
            // searching by reg number for login)
            // Assuming email logic for now, or we can use registration number as
            // identifier.
            // Let's assume frontend sends email in the 'email' field.

            Doctor doctor = doctorRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));

            if (!passwordEncoder.matches(request.getPassword(), doctor.getPassword())) {
                throw new RuntimeException("Invalid credentials");
            }

            // Account status checks
            String status = doctor.getAccountStatus() != null ? doctor.getAccountStatus() : "PENDING";
            if ("DISABLED".equals(status)) {
                throw new RuntimeException(
                        "Your account has been temporarily disabled by Admin. Please contact Curelex support.");
            }
            if (!"ACTIVE".equals(status)) {
                throw new RuntimeException("Account pending admin approval");
            }

            String token = jwtUtil.generateToken(doctor.getEmail(), "doctor", doctor.getId());
            return new AuthResponse(token, "doctor", doctor.getFullName(), doctor.getId(), doctor.getPhotoUrl());
        } else {
            throw new RuntimeException("Invalid role");
        }
    }

    public void sendOtp(String email, String type) {
        boolean isForgotPassword = "forgot-password".equals(type);
        // If forgot password, ensure user exists
        if (isForgotPassword) {
            boolean exists = patientRepository.findByEmail(email).isPresent() ||
                    doctorRepository.findByEmail(email).isPresent();
            if (!exists) {
                throw new RuntimeException("User not found with this email");
            }
        }
        otpService.generateAndSendOtp(email, isForgotPassword);
    }

    public void resetPassword(com.curelex.backend.dto.ResetPasswordRequest request) {
        // Validate OTP
        if (!otpService.validateOtp(request.getEmail(), request.getOtp())) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        String encodedPassword = passwordEncoder.encode(request.getNewPassword());

        // Try to find in Patient
        java.util.Optional<com.curelex.backend.model.Patient> patientOpt = patientRepository
                .findByEmail(request.getEmail());
        if (patientOpt.isPresent()) {
            com.curelex.backend.model.Patient patient = patientOpt.get();
            patient.setPassword(encodedPassword);
            patientRepository.save(patient);
            return;
        }

        // Try to find in Doctor
        java.util.Optional<com.curelex.backend.model.Doctor> doctorOpt = doctorRepository
                .findByEmail(request.getEmail());
        if (doctorOpt.isPresent()) {
            com.curelex.backend.model.Doctor doctor = doctorOpt.get();
            doctor.setPassword(encodedPassword);
            doctorRepository.save(doctor);
            return;
        }

        throw new RuntimeException("User not found");
    }
}
