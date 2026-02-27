package com.curelex.backend.dto;

import lombok.Data;

@Data
public class PatientProfileDTO {
    private Long id;
    private String fullName;
    private int age;
    private String gender;
    private String mobile;
    private String email;
    private String address;
    private String emergencyContact;
    private String aadhaarNumber;
    private String profileImageUrl;
    // Add medical history summary or other fields later
}
