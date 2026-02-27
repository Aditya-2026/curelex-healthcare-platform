package com.curelex.backend.service;

import com.curelex.backend.model.Contact;
import com.curelex.backend.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ContactService {

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private EmailService emailService;

    public Contact saveMessage(Contact contact) throws Exception {
        Contact savedContact = contactRepository.save(contact);

        // Send Email Notification
        emailService.sendContactMessage(
                savedContact.getFullName(),
                savedContact.getEmail(),
                savedContact.getPhone(),
                savedContact.getInquiryType(),
                savedContact.getMessage());

        return savedContact;
    }
}
