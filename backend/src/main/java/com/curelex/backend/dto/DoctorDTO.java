package com.curelex.backend.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class DoctorDTO {
    private String fullName;
    private Integer age;
    private String gender;
    private String specialization;
    private String registrationNumber;
    private String registrationState;
    private String currentHospital;
    private Integer experienceYears;
    private Integer patientsTreated;
    private String email;
    private String mobile;
    private String password;
    private String otp;

    // Files are handled separately in Controller, but DTO can hold text fields
}
