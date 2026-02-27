package com.curelex.backend.controller;

import com.curelex.backend.dto.ProfileUpdateDTO;
import com.curelex.backend.service.ProfileService;
import com.curelex.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private JwtUtil jwtUtil;

    private String cleanToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return token;
    }

    // ─── GET PROFILE ───────────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String token) {
        try {
            String jwt = cleanToken(token);
            String email = jwtUtil.extractEmail(jwt);
            String role = jwtUtil.extractRole(jwt);
            return ResponseEntity.ok(profileService.getProfile(email, role));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─── UPDATE PROFILE (Direct save, no OTP) ──────────────────
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("Authorization") String token,
            @RequestBody ProfileUpdateDTO dto) {
        try {
            String jwt = cleanToken(token);
            String email = jwtUtil.extractEmail(jwt);
            String role = jwtUtil.extractRole(jwt);
            Map<String, Object> updated = profileService.updateProfile(email, role, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
