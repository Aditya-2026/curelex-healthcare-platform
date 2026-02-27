package com.curelex.backend.repository;

import com.curelex.backend.model.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    long countByAdminSeenFalse();

    @Modifying
    @Query("UPDATE Contact c SET c.adminSeen = true WHERE c.adminSeen = false")
    void markAllAsAdminSeen();
}
