package com.curelex.backend.controller;

import com.curelex.backend.model.Contact;
import com.curelex.backend.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ContactController {

    @Autowired
    private ContactService contactService;

    @PostMapping
    public ResponseEntity<?> submitContactForm(@RequestBody Contact contact) {
        try {
            contactService.saveMessage(contact);
            return ResponseEntity.ok()
                    .body(java.util.Collections.singletonMap("message", "Message sent successfully!"));
        } catch (Exception e) {
            e.printStackTrace(); // Log error on server
            return ResponseEntity.internalServerError()
                    .body(java.util.Collections.singletonMap("error", "Failed to send message: " + e.getMessage()));
        }
    }
}
