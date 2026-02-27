package com.curelex.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private Integer age;
    private String gender;

    @Column(nullable = false)
    private String specialization;

    @Column(name = "registration_number", unique = true, nullable = false)
    private String registrationNumber;

    @Column(name = "registration_state")
    private String registrationState;

    @Column(name = "current_hospital")
    private String currentHospital;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "patients_treated")
    private Integer patientsTreated;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "certificate_url")
    private String certificateUrl;

    @Column(name = "is_approved")
    private Boolean isApproved = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "account_status")
    private String accountStatus = "PENDING";

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approval_date")
    private LocalDateTime approvalDate;

    @Column(name = "admin_seen")
    private Boolean adminSeen = false;

    @Column(unique = true)
    private String email;

    private String mobile;

    private String password;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
