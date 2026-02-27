package com.curelex.backend.service;

import com.curelex.backend.repository.ContactRepository;
import com.curelex.backend.repository.DoctorRepository;
import com.curelex.backend.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AdminNotificationService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ContactRepository contactRepository;

    /**
     * Returns unseen counts for each admin dashboard section.
     */
    public Map<String, Long> getUnseenCounts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("doctorApprovals", doctorRepository.countByIsApprovedFalseAndAdminSeenFalse());
        counts.put("patients", patientRepository.countByAdminSeenFalse());
        counts.put("messages", contactRepository.countByAdminSeenFalse());
        return counts;
    }

    /**
     * Marks a section as seen by the admin.
     */
    @Transactional
    public void markSeen(String type) {
        switch (type.toLowerCase()) {
            case "doctor":
            case "approvals":
                doctorRepository.markPendingApprovalsAsSeen();
                break;
            case "patient":
            case "patients":
                patientRepository.markAllAsAdminSeen();
                break;
            case "message":
            case "messages":
                contactRepository.markAllAsAdminSeen();
                break;
            default:
                // Activity has no model — no-op
                break;
        }
    }
}
