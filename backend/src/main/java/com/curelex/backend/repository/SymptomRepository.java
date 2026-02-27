package com.curelex.backend.repository;

import com.curelex.backend.model.Symptom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SymptomRepository extends JpaRepository<Symptom, Long> {
    List<Symptom> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<Symptom> findByPatientIdAndStatusOrderByCreatedAtDesc(Long patientId, String status);

    List<Symptom> findByStatusOrderByCreatedAtDesc(String status);
}
