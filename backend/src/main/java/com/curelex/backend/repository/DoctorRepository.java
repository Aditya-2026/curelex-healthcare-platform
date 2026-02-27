package com.curelex.backend.repository;

import com.curelex.backend.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByRegistrationNumber(String registrationNumber);

    Optional<Doctor> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Doctor> findByIsApproved(Boolean isApproved);

    long countByIsApprovedFalseAndAdminSeenFalse();

    @Modifying
    @Query("UPDATE Doctor d SET d.adminSeen = true WHERE d.isApproved = false AND d.adminSeen = false")
    void markPendingApprovalsAsSeen();
}
