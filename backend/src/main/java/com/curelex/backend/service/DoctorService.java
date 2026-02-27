package com.curelex.backend.service;

import com.curelex.backend.dto.DoctorDTO;
import com.curelex.backend.model.Doctor;
import com.curelex.backend.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private OtpService otpService;

    public Doctor registerDoctor(DoctorDTO doctorDTO, MultipartFile photo, MultipartFile certificate) {
        // Validate OTP
        if (!otpService.validateOtp(doctorDTO.getEmail(), doctorDTO.getOtp())) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        if (doctorRepository.existsByEmail(doctorDTO.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (doctorRepository.findByRegistrationNumber(doctorDTO.getRegistrationNumber()).isPresent()) {
            throw new RuntimeException("Doctor with this Registration Number already exists");
        }

        String photoUrl = fileStorageService.saveFile(photo, "doctors/photos");
        String certUrl = fileStorageService.saveFile(certificate, "doctors/certificates");

        Doctor doctor = new Doctor();
        doctor.setFullName(doctorDTO.getFullName());
        doctor.setAge(doctorDTO.getAge());
        doctor.setGender(doctorDTO.getGender());
        doctor.setSpecialization(doctorDTO.getSpecialization());
        doctor.setRegistrationNumber(doctorDTO.getRegistrationNumber());
        doctor.setRegistrationState(doctorDTO.getRegistrationState());
        doctor.setCurrentHospital(doctorDTO.getCurrentHospital());
        doctor.setExperienceYears(doctorDTO.getExperienceYears());
        doctor.setPatientsTreated(doctorDTO.getPatientsTreated());

        doctor.setEmail(doctorDTO.getEmail());
        doctor.setPassword(passwordEncoder.encode(doctorDTO.getPassword()));
        doctor.setMobile(doctorDTO.getMobile());

        doctor.setPhotoUrl(photoUrl);
        doctor.setCertificateUrl(certUrl);
        doctor.setIsApproved(false);

        Doctor savedDoctor = doctorRepository.save(doctor);

        // Trigger Email
        emailService.sendDoctorRegistrationEmail(
                savedDoctor.getFullName(),
                savedDoctor.getEmail(),
                savedDoctor.getSpecialization(),
                savedDoctor.getRegistrationNumber(),
                savedDoctor.getRegistrationState(),
                savedDoctor.getCurrentHospital(),
                savedDoctor.getExperienceYears(),
                savedDoctor.getPatientsTreated());

        return savedDoctor;
    }
}
