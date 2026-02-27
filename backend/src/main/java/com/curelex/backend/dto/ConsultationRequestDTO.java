package com.curelex.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class ConsultationRequestDTO {
    private Long patientId;
    private String mode; // In-Person, Telemedicine
    private String diagnosis;

    // Prescription
    private String prescriptionNotes;
    private List<MedicineItem> medicines;

    // Follow-up
    private String nextVisitDate; // yyyy-MM-dd
    private String followUpMode; // Online, Clinic
    private String followUpRemarks;

    @Data
    public static class MedicineItem {
        private String medicineName;
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;
    }
}
