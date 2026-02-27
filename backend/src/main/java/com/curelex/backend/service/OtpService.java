package com.curelex.backend.service;

import com.curelex.backend.model.Otp;
import com.curelex.backend.repository.OtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    public void generateAndSendOtp(String email, boolean isForgotPassword) {
        // Generate 6 digit OTP
        String otpCode = String.valueOf(new Random().nextInt(900000) + 100000);

        // Delete existing OTP for this email if any
        Optional<Otp> existingOtp = otpRepository.findByEmail(email);
        existingOtp.ifPresent(otp -> otpRepository.delete(otp));

        // Save new OTP
        Otp otp = new Otp();
        otp.setEmail(email);
        otp.setOtpCode(otpCode);
        otp.setExpiryDate(LocalDateTime.now().plusMinutes(10));
        otpRepository.save(otp);

        // Send Email
        if (isForgotPassword) {
            emailService.sendForgotPasswordOtpEmail(email, otpCode);
        } else {
            emailService.sendOtpEmail(email, otpCode);
        }
    }

    public boolean validateOtp(String email, String otpCode) {
        Optional<Otp> otpOptional = otpRepository.findByEmail(email);
        if (otpOptional.isPresent()) {
            Otp otp = otpOptional.get();
            if (otp.getOtpCode().equals(otpCode) && otp.getExpiryDate().isAfter(LocalDateTime.now())) {
                otpRepository.delete(otp); // OTP used once
                return true;
            }
        }
        return false;
    }
}
