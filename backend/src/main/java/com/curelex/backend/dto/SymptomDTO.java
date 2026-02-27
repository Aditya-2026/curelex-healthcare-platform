package com.curelex.backend.dto;

import lombok.Data;

@Data
public class SymptomDTO {
    private String symptomName;
    private String duration;
    private String severity;
    private String notes;
    private String status;
}
