package com.curelex.backend.service;

import com.curelex.backend.dto.PrescriptionDetailDTO;
import com.curelex.backend.model.*;
import com.curelex.backend.repository.*;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private DoctorRepository doctorRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    // --- Latest Prescription ---
    public PrescriptionDetailDTO getLatestPrescription(String email) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        List<Prescription> list = prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId());
        if (list.isEmpty())
            return null;

        Prescription p = list.get(0);
        String doctorName = doctorRepository.findById(p.getDoctorId())
                .map(Doctor::getFullName).orElse("Unknown Doctor");

        List<PrescriptionDetailDTO.MedicineDTO> meds = p.getMedicines() != null
                ? p.getMedicines().stream()
                        .map(m -> new PrescriptionDetailDTO.MedicineDTO(
                                m.getId(), m.getMedicineName(), m.getDosage(), m.getFrequency(), m.getDuration()))
                        .collect(Collectors.toList())
                : new ArrayList<>();

        return new PrescriptionDetailDTO(p.getId(), doctorName, p.getNotes(),
                p.getCreatedAt() != null ? p.getCreatedAt().format(DATE_FMT) : "", meds);
    }

    // --- Generate PDF ---
    public byte[] generatePdf(Long prescriptionId, String email) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        // Security check: prescription belongs to this patient
        if (!prescription.getPatientId().equals(patient.getId())) {
            throw new RuntimeException("Unauthorized access to prescription");
        }

        String doctorName = doctorRepository.findById(prescription.getDoctorId())
                .map(d -> "Dr. " + d.getFullName()).orElse("Unknown Doctor");
        String doctorSpec = doctorRepository.findById(prescription.getDoctorId())
                .map(Doctor::getSpecialization).orElse("");
        String doctorHospital = doctorRepository.findById(prescription.getDoctorId())
                .map(Doctor::getCurrentHospital).orElse("");

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, baos);
            document.open();

            // --- Fonts ---
            Font titleFont = new Font(Font.HELVETICA, 22, Font.BOLD, new Color(37, 99, 235));
            Font subtitleFont = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(107, 114, 128));
            Font headerFont = new Font(Font.HELVETICA, 13, Font.BOLD, new Color(17, 24, 39));
            Font labelFont = new Font(Font.HELVETICA, 10, Font.BOLD, new Color(107, 114, 128));
            Font valueFont = new Font(Font.HELVETICA, 11, Font.NORMAL, new Color(31, 41, 55));
            Font medFont = new Font(Font.HELVETICA, 11, Font.BOLD, new Color(31, 41, 55));
            Font medDetailFont = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(75, 85, 99));
            Font footerFont = new Font(Font.HELVETICA, 8, Font.ITALIC, new Color(156, 163, 175));

            // --- Header ---
            Paragraph brandName = new Paragraph("CURELEX HEALTHCARE", titleFont);
            brandName.setAlignment(Element.ALIGN_CENTER);
            document.add(brandName);

            Paragraph tagline = new Paragraph("Advanced Healthcare Management System", subtitleFont);
            tagline.setAlignment(Element.ALIGN_CENTER);
            tagline.setSpacingAfter(5);
            document.add(tagline);

            // Separator
            LineSeparator separator = new LineSeparator();
            separator.setLineColor(new Color(229, 231, 235));
            separator.setLineWidth(1.5f);
            document.add(new Chunk(separator));
            document.add(Chunk.NEWLINE);

            // --- PRESCRIPTION title ---
            Paragraph prescTitle = new Paragraph("PRESCRIPTION", headerFont);
            prescTitle.setAlignment(Element.ALIGN_CENTER);
            prescTitle.setSpacingAfter(15);
            document.add(prescTitle);

            // --- Info Table ---
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(15);
            infoTable.setWidths(new float[] { 1, 1 });

            addInfoCell(infoTable, "Doctor Name", doctorName, labelFont, valueFont);
            addInfoCell(infoTable, "Patient Name", patient.getFullName(), labelFont, valueFont);
            addInfoCell(infoTable, "Specialization", doctorSpec, labelFont, valueFont);
            addInfoCell(infoTable, "Hospital", doctorHospital, labelFont, valueFont);
            addInfoCell(infoTable, "Consultation Date",
                    prescription.getCreatedAt() != null ? prescription.getCreatedAt().format(DATE_FMT) : "N/A",
                    labelFont, valueFont);
            addInfoCell(infoTable, "Prescription ID", "#" + prescription.getId(), labelFont, valueFont);

            document.add(infoTable);

            // --- Diagnosis Notes ---
            if (prescription.getNotes() != null && !prescription.getNotes().isEmpty()) {
                Paragraph notesHeader = new Paragraph("Diagnosis Notes", headerFont);
                notesHeader.setSpacingBefore(10);
                notesHeader.setSpacingAfter(5);
                document.add(notesHeader);

                document.add(new Chunk(separator));
                document.add(Chunk.NEWLINE);

                Paragraph notesBody = new Paragraph(prescription.getNotes(), valueFont);
                notesBody.setSpacingAfter(15);
                document.add(notesBody);
            }

            // --- Medicines ---
            Paragraph medsHeader = new Paragraph("Medicines", headerFont);
            medsHeader.setSpacingBefore(10);
            medsHeader.setSpacingAfter(5);
            document.add(medsHeader);

            document.add(new Chunk(separator));
            document.add(Chunk.NEWLINE);

            if (prescription.getMedicines() != null && !prescription.getMedicines().isEmpty()) {
                PdfPTable medsTable = new PdfPTable(4);
                medsTable.setWidthPercentage(100);
                medsTable.setSpacingAfter(15);
                medsTable.setWidths(new float[] { 3, 2, 2, 2 });

                // Header row
                String[] headers = { "Medicine", "Dosage", "Frequency", "Duration" };
                for (String h : headers) {
                    PdfPCell cell = new PdfPCell(new Phrase(h, labelFont));
                    cell.setBackgroundColor(new Color(243, 244, 246));
                    cell.setPadding(8);
                    cell.setBorderColor(new Color(229, 231, 235));
                    medsTable.addCell(cell);
                }

                for (Medicine med : prescription.getMedicines()) {
                    addMedCell(medsTable, med.getMedicineName(), medFont);
                    addMedCell(medsTable, med.getDosage() != null ? med.getDosage() : "—", medDetailFont);
                    addMedCell(medsTable, med.getFrequency() != null ? med.getFrequency() : "—", medDetailFont);
                    addMedCell(medsTable, med.getDuration() != null ? med.getDuration() : "—", medDetailFont);
                }

                document.add(medsTable);
            } else {
                document.add(new Paragraph("No medicines prescribed.", medDetailFont));
            }

            // --- Footer ---
            document.add(Chunk.NEWLINE);
            document.add(Chunk.NEWLINE);
            document.add(new Chunk(separator));

            Paragraph footer = new Paragraph(
                    "Generated by Curelex Healthcare System  •  This is a computer-generated document  •  No signature required",
                    footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(10);
            document.add(footer);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }

    private void addInfoCell(PdfPTable table, String label, String value, Font labelF, Font valueF) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(PdfPCell.NO_BORDER);
        cell.setPaddingBottom(8);
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + "\n", labelF));
        p.add(new Chunk(value != null ? value : "N/A", valueF));
        cell.addElement(p);
        table.addCell(cell);
    }

    private void addMedCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(8);
        cell.setBorderColor(new Color(229, 231, 235));
        table.addCell(cell);
    }
}
