package com.curelex.backend.dto;

import lombok.Data;

@Data
public class ProfileUpdateDTO {
    private String fullName;
    private String mobile;
    private String address;
    private String gender;
    private Integer age;
    // Email, Aadhaar, and Registration Number are NOT updatable
}
