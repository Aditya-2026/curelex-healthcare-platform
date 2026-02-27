package com.curelex.backend.controller;

import com.curelex.backend.dto.PatientDTO;
import com.curelex.backend.model.Patient;
import com.curelex.backend.repository.PatientRepository;
import com.curelex.backend.service.FileStorageService;
import com.curelex.backend.service.PatientService;
import com.curelex.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public ResponseEntity<?> registerPatient(@ModelAttribute PatientDTO patientDTO,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage) {
        try {
            patientService.registerPatient(patientDTO, profileImage);
            return ResponseEntity.ok("Patient registered successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            String email = jwtUtil.extractEmail(token);
            return ResponseEntity.ok(patientService.getPatientProfileByEmail(email));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
    }

    // ─── Upload Profile Image (for existing patients) ────────────
    @PostMapping("/upload-profile")
    public ResponseEntity<?> uploadProfileImage(
            @RequestHeader("Authorization") String token,
            @RequestParam("image") MultipartFile image) {
        try {
            String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;
            String email = jwtUtil.extractEmail(jwt);

            Patient patient = patientRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            String imageUrl = fileStorageService.saveFile(image, "patients/profile");
            patient.setProfileImageUrl(imageUrl);
            patientRepository.save(patient);

            return ResponseEntity.ok(Map.of(
                    "message", "Profile image uploaded successfully",
                    "profileImageUrl", imageUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
