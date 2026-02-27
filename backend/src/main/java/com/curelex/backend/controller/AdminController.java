package com.curelex.backend.controller;

import com.curelex.backend.dto.LoginRequest;
import com.curelex.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    private Long extractAdminId(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return io.jsonwebtoken.Jwts.parserBuilder()
                .setSigningKey(io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                        "MySuperSecretKeyForCurelexProjectThatIsVeryLongAndSecure123456".getBytes()))
                .build()
                .parseClaimsJws(token.startsWith("Bearer ") ? token.substring(7) : token)
                .getBody()
                .get("id", Long.class);
    }

    // --- Admin Login ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(adminService.adminLogin(request.getEmail(), request.getPassword()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Overview Stats ---
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        try {
            return ResponseEntity.ok(adminService.getOverviewStats());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- Pending Doctors ---
    @GetMapping("/doctors/pending")
    public ResponseEntity<?> getPendingDoctors() {
        try {
            return ResponseEntity.ok(adminService.getPendingDoctors());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- Approve Doctor ---
    @PutMapping("/doctors/{id}/approve")
    public ResponseEntity<?> approveDoctor(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        try {
            Long adminId = extractAdminId(token);
            adminService.approveDoctor(id, adminId);
            return ResponseEntity.ok(Map.of("message", "Doctor approved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Reject Doctor ---
    @PutMapping("/doctors/{id}/reject")
    public ResponseEntity<?> rejectDoctor(@PathVariable Long id) {
        try {
            adminService.rejectDoctor(id);
            return ResponseEntity.ok(Map.of("message", "Doctor rejected and removed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- All Doctors ---
    @GetMapping("/doctors")
    public ResponseEntity<?> getAllDoctors() {
        try {
            return ResponseEntity.ok(adminService.getAllDoctors());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- Disable Doctor ---
    @PutMapping("/doctors/{id}/disable")
    public ResponseEntity<?> disableDoctor(@PathVariable Long id) {
        try {
            adminService.disableDoctor(id);
            return ResponseEntity.ok(Map.of("message", "Doctor disabled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Remove Doctor (Permanent Delete) ---
    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<?> removeDoctor(@PathVariable Long id) {
        try {
            adminService.removeDoctor(id);
            return ResponseEntity.ok(Map.of("message", "Doctor permanently removed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- All Patients ---
    @GetMapping("/patients")
    public ResponseEntity<?> getAllPatients() {
        try {
            return ResponseEntity.ok(adminService.getAllPatients());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- Contact Messages ---
    @GetMapping("/messages")
    public ResponseEntity<?> getMessages() {
        try {
            return ResponseEntity.ok(adminService.getContactMessages());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- Activity Logs ---
    @GetMapping("/activity")
    public ResponseEntity<?> getActivityLogs() {
        try {
            return ResponseEntity.ok(adminService.getActivityLogs());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ═══ NOTIFICATION SYSTEM ═══════════════════════════════════

    @Autowired
    private com.curelex.backend.service.AdminNotificationService adminNotificationService;

    // --- Get Unseen Counts ---
    @GetMapping("/notifications/count")
    public ResponseEntity<?> getNotificationCounts() {
        try {
            return ResponseEntity.ok(adminNotificationService.getUnseenCounts());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Mark Section As Seen ---
    @PutMapping("/notifications/seen/{type}")
    public ResponseEntity<?> markSeen(@PathVariable String type) {
        try {
            adminNotificationService.markSeen(type);
            return ResponseEntity.ok(Map.of("message", "Marked as seen"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
