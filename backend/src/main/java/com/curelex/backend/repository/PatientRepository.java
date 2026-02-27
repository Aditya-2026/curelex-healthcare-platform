package com.curelex.backend.repository;

import com.curelex.backend.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByEmail(String email);

    Optional<Patient> findByMobile(String mobile);

    boolean existsByEmail(String email);

    boolean existsByMobile(String mobile);

    long countByAdminSeenFalse();

    @Modifying
    @Query("UPDATE Patient p SET p.adminSeen = true WHERE p.adminSeen = false")
    void markAllAsAdminSeen();
}
