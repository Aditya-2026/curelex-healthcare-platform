# Curelex – Healthcare Management Platform

## 1️⃣ Short Introduction
Curelex is a comprehensive full-stack healthcare platform designed to seamlessly connect Patients, Doctors, and Administrators. It enables a hybrid e-clinic and telemedicine workflow backed by secure JWT authentication. The system features a doctor approval-based onboarding process, online patient consultations, and centralized medical record management. This robust application was built as an internship project.

## 2️⃣ Project Setup

### Required Software
- Java 17+ / 21+
- Node.js
- MySQL
- Maven

### Frontend Setup
1. Open a terminal and navigate to the frontend folder: `cd frontend`
2. Install dependencies using: `npm install`
3. Update the API base URL if required (e.g., in `src/services/api.js` or configuration constants).
4. Run the development server using: `npm run dev`
5. The frontend will be accessible at the default Vite port (`http://localhost:5173`).

### Backend Setup
1. Open a terminal and navigate to the backend folder: `cd backend`
2. Configure your MySQL database service.
3. Create a new MySQL database named `curelex_db`.
4. Update the `application.properties` configuration file with your local database credentials and email setup:
   - `spring.datasource.url` (e.g., `jdbc:mysql://localhost:3306/curelex_db`)
   - `spring.datasource.username`
   - `spring.datasource.password`
   - Mail configuration properties (`spring.mail.username`, `spring.mail.password`)
   - Change the email to get user registration notifications `backend\service\EmailService.java` file in `COMPANY_EMAIL` variable
5. Run the Spring Boot application using: `mvn spring-boot:run`
6. The backend API will start on `http://localhost:8080`.

*Note: A Super Admin account is automatically created during the first backend run. The Super Admin seeder initializes the admin dashboard access.*

## 3️⃣ Project Information

### User Roles
- **Patient**
- **Doctor**
- **Admin**

### Main Functionalities

**Patient:**
- Registration with profile image
- Symptom submission
- View prescriptions
- Follow-up tracking
- Profile management

**Doctor:**
- Registration with certificate upload
- Admin approval required
- Patient consultation
- Prescription & follow-up management
- Profile settings

**Admin:**
- Doctor approval/rejection
- Disable/remove doctors
- Patient & doctor monitoring
- Contact message management
- Notification-based dashboard

### Technical Features
- JWT Authentication
- Role-Based Access Control
- Secure File Uploads
- Email Notifications
- Timeline-based medical records
- PDF Prescription Download

### Tech Stack
**Frontend:**
React (Vite), Tailwind CSS, Axios

**Backend:**
Spring Boot, Spring Security, JWT, Hibernate, REST APIs

**Database:**
MySQL

**Other:**
JavaMailSender, File Upload Handling

---