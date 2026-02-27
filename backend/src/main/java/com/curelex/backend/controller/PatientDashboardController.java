package com.curelex.backend.controller;

import com.curelex.backend.dto.*;
import com.curelex.backend.model.Symptom;
import com.curelex.backend.service.DashboardService;
import com.curelex.backend.service.PrescriptionService;
import com.curelex.backend.service.SymptomService;
import com.curelex.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient")
public class PatientDashboardController {

    @Autowired
    private SymptomService symptomService;
    @Autowired
    private DashboardService dashboardService;
    @Autowired
    private PrescriptionService prescriptionService;
    @Autowired
    private JwtUtil jwtUtil;

    // ---- Helper ----
    private String extractEmail(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtUtil.extractEmail(token);
    }

    // ---- Symptoms ----
    @PostMapping("/symptoms")
    public ResponseEntity<?> addSymptom(
            @RequestHeader("Authorization") String token,
            @RequestBody SymptomDTO dto) {
        try {
            Symptom symptom = symptomService.addSymptom(extractEmail(token), dto);
            return ResponseEntity.ok(symptom);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/symptoms")
    public ResponseEntity<?> getSymptoms(@RequestHeader("Authorization") String token) {
        try {
            List<Symptom> symptoms = symptomService.getSymptoms(extractEmail(token));
            return ResponseEntity.ok(symptoms);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/symptoms/{id}")
    public ResponseEntity<?> updateSymptom(
            @PathVariable Long id,
            @RequestBody SymptomDTO dto) {
        try {
            Symptom symptom = symptomService.updateSymptom(id, dto);
            return ResponseEntity.ok(symptom);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---- Prescriptions (All) ----
    @GetMapping("/prescriptions")
    public ResponseEntity<?> getPrescriptions(@RequestHeader("Authorization") String token) {
        try {
            List<PrescriptionDetailDTO> list = dashboardService.getPrescriptions(extractEmail(token));
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---- Latest Prescription ----
    @GetMapping("/prescriptions/latest")
    public ResponseEntity<?> getLatestPrescription(@RequestHeader("Authorization") String token) {
        try {
            PrescriptionDetailDTO latest = prescriptionService.getLatestPrescription(extractEmail(token));
            if (latest == null) {
                return ResponseEntity.ok(Map.of("message", "No prescriptions found"));
            }
            return ResponseEntity.ok(latest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---- Download Prescription PDF ----
    @GetMapping("/prescriptions/{id}/download")
    public ResponseEntity<byte[]> downloadPrescription(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            byte[] pdf = prescriptionService.generatePdf(id, extractEmail(token));
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=prescription_" + id + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // ---- Follow-Ups ----
    @GetMapping("/followups")
    public ResponseEntity<?> getFollowUps(@RequestHeader("Authorization") String token) {
        try {
            List<FollowUpDTO> list = dashboardService.getFollowUps(extractEmail(token));
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---- Timeline ----
    @GetMapping("/timeline")
    public ResponseEntity<?> getTimeline(@RequestHeader("Authorization") String token) {
        try {
            List<TimelineEventDTO> events = dashboardService.getTimeline(extractEmail(token));
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---- Emergency Contacts ----
    @GetMapping("/emergency-contacts")
    public ResponseEntity<?> getEmergencyContacts(@RequestHeader("Authorization") String token) {
        try {
            return ResponseEntity.ok(dashboardService.getEmergencyContacts(extractEmail(token)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
