package com.curelex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FollowUpDTO {
    private Long id;
    private String doctorName;
    private String nextVisitDate;
    private String status;
    private String remarks;
    private String consultationMode;
    private long daysRemaining;
}
