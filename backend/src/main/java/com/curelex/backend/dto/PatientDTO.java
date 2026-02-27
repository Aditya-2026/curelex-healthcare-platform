package com.curelex.backend.dto;

import lombok.Data;

@Data
public class PatientDTO {
    private String fullName;
    private Integer age;
    private String gender;
    private String mobile;
    private String email;
    private String address;
    private String emergencyContact;
    private String aadhaarNumber;
    private String password;
    private String otp;
}
