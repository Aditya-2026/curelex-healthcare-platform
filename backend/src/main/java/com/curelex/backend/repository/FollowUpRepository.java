package com.curelex.backend.repository;

import com.curelex.backend.model.FollowUp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {
    List<FollowUp> findByPatientIdOrderByNextVisitDateDesc(Long patientId);

    Optional<FollowUp> findFirstByPatientIdAndStatusOrderByNextVisitDateAsc(Long patientId, String status);

    List<FollowUp> findByDoctorIdOrderByNextVisitDateDesc(Long doctorId);
}
