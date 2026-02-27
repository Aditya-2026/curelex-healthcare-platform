package com.curelex.backend.repository;

import com.curelex.backend.model.Consultation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    // Existing
    List<Consultation> findByPatientIdOrderByConsultationDateDesc(Long patientId);

    List<Consultation> findByDoctorIdOrderByConsultationDateDesc(Long doctorId);

    List<Consultation> findByDoctorIdAndStatus(Long doctorId, String status);

    // Unassigned pending pool
    List<Consultation> findByStatusAndDoctorIdIsNullOrderByCreatedAtAsc(String status);

    // Doctor's own consultations by statuses
    List<Consultation> findByDoctorIdAndStatusInOrderByUpdatedAtDesc(Long doctorId, List<String> statuses);

    // Patient view
    List<Consultation> findByPatientIdAndStatusInOrderByUpdatedAtDesc(Long patientId, List<String> statuses);

    // Pessimistic lock for accept race condition
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Consultation c WHERE c.id = :id")
    Optional<Consultation> findByIdForUpdate(@Param("id") Long id);

    // Check if patient already has a pending/active consultation
    boolean existsByPatientIdAndStatusIn(Long patientId, List<String> statuses);
}
