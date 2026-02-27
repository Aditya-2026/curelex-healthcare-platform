package com.curelex.backend.repository;

import com.curelex.backend.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByPrescriptionId(Long prescriptionId);
}
