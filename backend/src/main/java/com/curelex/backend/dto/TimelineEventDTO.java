package com.curelex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimelineEventDTO {
    private Long id;
    private String type; // SYMPTOM, CONSULTATION, PRESCRIPTION, FOLLOWUP
    private String title;
    private String description;
    private String date; // Formatted date string
    private String timestamp; // ISO timestamp for sorting
}
