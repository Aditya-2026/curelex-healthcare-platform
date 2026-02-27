package com.curelex.backend.config;

import com.curelex.backend.model.Admin;
import com.curelex.backend.repository.AdminRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminDataInitializer {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void initSuperAdmin() {
        String adminEmail = "admin@curelex.com";

        if (adminRepository.findByEmail(adminEmail).isPresent()) {
            System.out.println("ℹ️ Admin already exists.");
            return;
        }

        Admin admin = new Admin();
        admin.setName("Admin");
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setRole("ROLE_ADMIN");
        adminRepository.save(admin);

        System.out.println("✅ Admin account created successfully.");
    }
}
