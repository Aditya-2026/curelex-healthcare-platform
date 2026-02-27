package com.curelex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDetailDTO {
    private Long id;
    private String doctorName;
    private String notes;
    private String date;
    private List<MedicineDTO> medicines;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicineDTO {
        private Long id;
        private String medicineName;
        private String dosage;
        private String frequency;
        private String duration;
    }
}
