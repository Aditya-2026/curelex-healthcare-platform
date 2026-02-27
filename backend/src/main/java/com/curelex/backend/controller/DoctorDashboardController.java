package com.curelex.backend.controller;

import com.curelex.backend.dto.ConsultationRequestDTO;
import com.curelex.backend.service.DoctorDashboardService;
import com.curelex.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/doctor")
public class DoctorDashboardController {

    @Autowired
    private DoctorDashboardService dashboardService;
    @Autowired
    private JwtUtil jwtUtil;

    private String extractEmail(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtUtil.extractEmail(token);
    }

    // --- Stats ---
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestHeader("Authorization") String token) {
        try {
            return ResponseEntity.ok(dashboardService.getDoctorStats(extractEmail(token)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- Patient Queue (pending pool + own active) ---
    @GetMapping("/patients")
    public ResponseEntity<?> getPatientQueue(@RequestHeader("Authorization") String token) {
        try {
            return ResponseEntity.ok(dashboardService.getPatientQueue(extractEmail(token)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- Patient History (with ownership check) ---
    @GetMapping("/patients/{id}/history")
    public ResponseEntity<?> getPatientHistory(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            return ResponseEntity.ok(dashboardService.getPatientHistory(id, extractEmail(token)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Accept Consultation (race-safe) ---
    @PostMapping("/consultations/{id}/accept")
    public ResponseEntity<?> acceptConsultation(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            return ResponseEntity.ok(dashboardService.acceptConsultation(extractEmail(token), id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Complete Consultation ---
    @PutMapping("/consultations/{id}/complete")
    public ResponseEntity<?> completeConsultation(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            return ResponseEntity.ok(dashboardService.completeConsultation(extractEmail(token), id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Create Consultation (submit diagnosis + prescription) ---
    @PostMapping("/consultation")
    public ResponseEntity<?> createConsultation(
            @RequestHeader("Authorization") String token,
            @RequestBody ConsultationRequestDTO dto) {
        try {
            Map<String, Object> result = dashboardService.createConsultation(extractEmail(token), dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Recent Activity ---
    @GetMapping("/activity")
    public ResponseEntity<?> getRecentActivity(@RequestHeader("Authorization") String token) {
        try {
            return ResponseEntity.ok(dashboardService.getRecentActivity(extractEmail(token)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
