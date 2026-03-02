package com.curelex.backend.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    private final String COMPANY_EMAIL = "info.curelex@gamil.com";

    public void sendPatientRegistrationEmail(String patientName, String patientEmail, String patientMobile,
            String aadhaar) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(senderEmail);
            helper.setTo(COMPANY_EMAIL);
            helper.setSubject("New Patient Registration: " + patientName);

            String content = "<h3>New Patient Registration Details</h3>" +
                    "<p><b>Name:</b> " + patientName + "</p>" +
                    "<p><b>Email:</b> " + patientEmail + "</p>" +
                    "<p><b>Mobile:</b> " + patientMobile + "</p>" +
                    "<p><b>Aadhaar (Masked):</b> " + maskAadhaar(aadhaar) + "</p>";

            helper.setText(content, true);

            mailSender.send(message);
            System.out.println("Patient registration email sent to admin.");

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error sending patient registration email: " + e.getMessage());
        }
    }

    public void sendDoctorRegistrationEmail(String doctorName, String doctorEmail, String specialization,
            String regNumber, String state,
            String hospital, Integer experience, Integer patientsTreated) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(senderEmail);
            helper.setTo(COMPANY_EMAIL);
            helper.setSubject("New Doctor Application: " + doctorName);

            String content = "<h3>New Doctor Registration Application</h3>" +
                    "<p><b>Name:</b> " + doctorName + "</p>" +
                    "<p><b>Email:</b> " + doctorEmail + "</p>" +
                    "<p><b>Specialization:</b> " + specialization + "</p>" +
                    "<p><b>Reg Number:</b> " + regNumber + "</p>" +
                    "<p><b>State:</b> " + state + "</p>" +
                    "<p><b>Hospital:</b> " + hospital + "</p>" +
                    "<p><b>Experience:</b> " + experience + " years</p>" +
                    "<p><b>Patients Treated:</b> " + patientsTreated + "</p>" +
                    "<p><i>Please check the admin dashboard/files to verify documents.</i></p>";

            helper.setText(content, true);

            mailSender.send(message);
            System.out.println("Doctor registration email sent to admin.");

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error sending doctor registration email: " + e.getMessage());
        }
    }

    private String maskAadhaar(String aadhaar) {
        if (aadhaar == null || aadhaar.length() < 4)
            return "XXXX";
        return "XXXX-XXXX-" + aadhaar.substring(aadhaar.length() - 4);
    }

    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(senderEmail);
            helper.setTo(toEmail);
            helper.setSubject("Curelex - Email Verification OTP");

            String content = "<h3>Email Verification</h3>" +
                    "<p>Your OTP for email verification is: <b>" + otpCode + "</b></p>" +
                    "<p>This OTP is valid for 10 minutes.</p>";

            helper.setText(content, true);

            mailSender.send(message);
            System.out.println("OTP email sent to " + toEmail);

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error sending OTP email: " + e.getMessage());
        }
    }

    public void sendForgotPasswordOtpEmail(String toEmail, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(senderEmail);
            helper.setTo(toEmail);
            helper.setSubject("Curelex - Reset Password OTP");

            String content = "<h3>Reset Password</h3>" +
                    "<p>Your OTP to reset your password is: <b>" + otpCode + "</b></p>" +
                    "<p>This OTP is valid for 10 minutes.</p>";

            helper.setText(content, true);

            mailSender.send(message);
            System.out.println("Forgot password OTP email sent to " + toEmail);

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error sending forgot password OTP email: " + e.getMessage());
        }
    }

    public void sendContactMessage(String fullName, String email, String phone, String inquiryType,
            String messageContent) throws Exception {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(senderEmail);
            helper.setTo("dd8783257@gmail.com");
            helper.setSubject("New Contact Inquiry: " + inquiryType);

            String content = "<h3>New Contact Form Submission</h3>" +
                    "<p><b>Name:</b> " + fullName + "</p>" +
                    "<p><b>Email:</b> " + email + "</p>" +
                    "<p><b>Phone:</b> " + phone + "</p>" +
                    "<p><b>Inquiry Type:</b> " + inquiryType + "</p>" +
                    "<p><b>Message:</b><br/>" + messageContent + "</p>";

            helper.setText(content, true);

            mailSender.send(message);
            System.out.println("Contact form email sent successfully.");

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error sending contact form email: " + e.getMessage());
            throw e;
        }
    }
}
