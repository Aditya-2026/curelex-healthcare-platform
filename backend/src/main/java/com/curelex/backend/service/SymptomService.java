package com.curelex.backend.service;

import com.curelex.backend.dto.SymptomDTO;
import com.curelex.backend.model.Consultation;
import com.curelex.backend.model.Patient;
import com.curelex.backend.model.Symptom;
import com.curelex.backend.repository.ConsultationRepository;
import com.curelex.backend.repository.PatientRepository;
import com.curelex.backend.repository.SymptomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SymptomService {

    @Autowired
    private SymptomRepository symptomRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ConsultationRepository consultationRepository;

    public Symptom addSymptom(String email, SymptomDTO dto) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Symptom symptom = new Symptom();
        symptom.setPatientId(patient.getId());
        symptom.setSymptomName(dto.getSymptomName());
        symptom.setDuration(dto.getDuration());
        symptom.setSeverity(dto.getSeverity());
        symptom.setNotes(dto.getNotes());
        symptom.setStatus("ACTIVE");
        Symptom saved = symptomRepository.save(symptom);

        // Auto-create PENDING consultation if patient doesn't have one
        boolean hasPendingOrActive = consultationRepository
                .existsByPatientIdAndStatusIn(patient.getId(), List.of("PENDING", "ACTIVE"));
        if (!hasPendingOrActive) {
            Consultation consultation = new Consultation();
            consultation.setPatientId(patient.getId());
            consultation.setDoctorId(null); // Unassigned
            consultation.setStatus("PENDING");
            consultationRepository.save(consultation);
        }

        return saved;
    }

    public List<Symptom> getSymptoms(String email) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return symptomRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId());
    }

    public Symptom updateSymptom(Long id, SymptomDTO dto) {
        Symptom symptom = symptomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Symptom not found"));

        if (dto.getSymptomName() != null)
            symptom.setSymptomName(dto.getSymptomName());
        if (dto.getDuration() != null)
            symptom.setDuration(dto.getDuration());
        if (dto.getSeverity() != null)
            symptom.setSeverity(dto.getSeverity());
        if (dto.getNotes() != null)
            symptom.setNotes(dto.getNotes());
        if (dto.getStatus() != null)
            symptom.setStatus(dto.getStatus());

        return symptomRepository.save(symptom);
    }
}
