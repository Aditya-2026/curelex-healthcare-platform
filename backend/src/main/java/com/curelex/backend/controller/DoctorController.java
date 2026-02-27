package com.curelex.backend.controller;

import com.curelex.backend.dto.DoctorDTO;
import com.curelex.backend.model.Doctor;
import com.curelex.backend.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registerDoctor(
            @ModelAttribute DoctorDTO doctorDTO,
            @RequestParam("photo") MultipartFile photo,
            @RequestParam("certificate") MultipartFile certificate) {
        try {
            Doctor registeredDoctor = doctorService.registerDoctor(doctorDTO, photo, certificate);
            return ResponseEntity
                    .ok("Doctor registration submitted! Pending approval. ID: " + registeredDoctor.getId());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("An error occurred during registration: " + e.getMessage());
        }
    }
}
