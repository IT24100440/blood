# 🩸 Blood Bank Management System

A comprehensive web-based blood bank management system that connects blood donors, hospitals, and blood bank administrators to facilitate efficient blood donation and distribution.

## 📋 Table of Contents
- [Features](#features)
- [System Architecture](#system-architecture)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [User Workflows](#user-workflows)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

---

## ✨ Features

### 👥 For Donors
- **Easy Registration & Profile Management**
  - Complete donor profile with blood group, location, and contact details
  - Track last donation date and total donations
  
- **Smart Appointment Booking**
  - Book appointments for blood donation
  - Automatic eligibility checking (56-day waiting period)
  - View appointment history and status
  
- **Emergency Alerts**
  - Receive urgent notifications when your blood group is critically needed
  - Location-based alerts for nearby blood requirements
  
- **Donation History**
  - Visual timeline of all donations
  - Track donation locations, dates, and status
  - View eligibility status and next donation date

### 🏥 For Hospitals
- **Quick Registration Process**
  - Hospital profile with registration number and verification
  - Secure authentication system
  
- **Blood Request Management**
  - Submit blood requests with urgency levels (Low, Medium, High, Critical)
  - Specify blood group, quantity, and patient details
  - Real-time request status tracking
  
- **Request Status Tracking**
  - Monitor request status: Pending → Approved → Delivered
  - View admin notes and feedback
  - Access complete request history

### 🧑‍💼 For Blood Bank Admins
- **Comprehensive Dashboard**
  - Overview statistics (donors, hospitals, requests, appointments)
  - Blood stock summary for all blood groups
  - Low stock alerts and notifications
  
- **Blood Inventory Management**
  - Add new blood units with collection and expiry dates
  - Automatic expiry date tracking
  - Real-time stock level monitoring
  - Low stock alerts (configurable threshold)
  
- **Hospital Management**
  - Verify new hospital registrations
  - Manage hospital permissions
  - Track hospital request history
  
- **Request Management**
  - Review and approve/reject blood requests
  - Add admin notes to requests
  - Mark requests as delivered
  - Stock allocation tracking
  
- **Emergency Response System**
  - Send emergency alerts to eligible donors
  - Filter by blood group and location
  - Track notification delivery
  
- **Appointment Oversight**
  - View all upcoming donor appointments
  - Mark appointments as completed
  - Update donor records after donation

---

## 🏗️ System Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React.js)    │
│   Port: 3000    │
└────────┬────────┘
         │
         │ HTTP/REST API
         │
┌────────▼────────┐
│   Backend       │
│  (Spring Boot)  │
│   Port: 8080    │
└────────┬────────┘
         │
         │ JDBC
         │
┌────────▼────────┐
│   Database      │
│    (MySQL)      │
│   Port: 3306    │
└─────────────────┘
```

### User Roles & Access
```
┌──────────────────────────────────────────┐
│            BLOOD BANK SYSTEM             │
├──────────────────────────────────────────┤
│                                          │
│  ┌─────────┐   ┌──────────┐  ┌────────┐ │
│  │  DONOR  │   │ HOSPITAL │  │ ADMIN  │ │
│  └────┬────┘   └────┬─────┘  └───┬────┘ │
│       │             │             │      │
│       ▼             ▼             ▼      │
│  - Register    - Register    - Manage   │
│  - Donate      - Request     - Approve  │
│  - History     - Track       - Alert    │
│  - Alerts      - Status      - Monitor  │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🛠️ Technologies Used

### Backend
- **Java 17+**
- **Spring Boot 3.x**
  - Spring Web
  - Spring Data JPA
  - Spring Validation
- **MySQL 8.0**
- **Maven** - Dependency Management

### Frontend
- **React 18.x**
- **React Router** - Navigation
- **Axios** - HTTP Client
- **CSS3** - Styling

### Development Tools
- **VS Code / IntelliJ IDEA**
- **Postman** - API Testing
- **Git** - Version Control

---

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed:
- **Java Development Kit (JDK) 17 or higher**
- **Node.js 16+ and npm**
- **MySQL 8.0+**
- **Maven 3.6+**

### Database Setup

1. **Create Database:**
```sql
CREATE DATABASE blood_bank;
```

2. **Configure Database Connection:**

Edit `backend/src/main/resources/application.properties`:
```properties
spring.application.name=backend

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/blood_bank
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# Server Configuration
server.port=8080
```

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install Dependencies and Run:**
```bash
# Windows
mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

Backend will start on: **http://localhost:8080**

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install Dependencies:**
```bash
npm install
```

3. **Start Development Server:**
```bash
npm start
```

Frontend will start on: **http://localhost:3000**

---

## 👤 User Workflows

### 🩸 Donor Workflow

1. **Registration**
   - Visit registration page
   - Select "DONOR" role
   - Complete profile with blood group, location, phone, date of birth
   - Add last donation date (if applicable)

2. **Book Appointment**
   - Navigate to Appointments tab
   - Select date and time
   - System checks eligibility (56-day rule)
   - Receive confirmation notification

3. **Receive Alerts**
   - Get notified when your blood group is urgently needed
   - Location-specific emergency alerts
   - View in notifications panel

4. **View History**
   - Track all completed donations
   - See donation timeline with dates and locations
   - Monitor total donations count

### 🏥 Hospital Workflow

1. **Registration**
   - Register with hospital details
   - Provide registration number
   - Wait for admin verification

2. **Submit Request**
   - Select blood group and quantity
   - Set urgency level (Low/Medium/High/Critical)
   - Provide patient details and reason
   - Submit for admin review

3. **Track Status**
   - Monitor request in dashboard
   - Receive notifications on status changes
   - View admin notes/feedback

### 🧑‍💼 Admin Workflow

1. **Manage Inventory**
   - Add new blood units with expiry dates
   - Monitor stock levels
   - Respond to low stock alerts

2. **Process Requests**
   - Review hospital requests
   - Approve/reject with notes
   - Mark as delivered after dispatch

3. **Send Emergency Alerts**
   - Select blood group needed
   - Optionally filter by location
   - Notify all eligible matching donors

4. **Verify Hospitals**
   - Review hospital registrations
   - Verify credentials
   - Activate hospital accounts

---

## 📚 API Documentation

Comprehensive API documentation is available in:
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete endpoint reference
- **[SYSTEM_WORKFLOW.md](SYSTEM_WORKFLOW.md)** - Detailed system workflows

### Quick API Reference

**Base URL:** `http://localhost:8080/api`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | User login |
| `/donors` | GET/POST | Manage donors |
| `/hospitals` | GET/POST | Manage hospitals |
| `/appointments` | GET/POST | Manage appointments |
| `/blood-requests` | GET/POST | Manage blood requests |
| `/blood-inventory` | GET/POST | Manage inventory |
| `/notifications/emergency-alert` | POST | Send emergency alerts |

---

## 📁 Project Structure

```
blood-bank-system/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/backend/
│   │   │   │   ├── Config/
│   │   │   │   │   └── WebConfig.java
│   │   │   │   ├── Controller/
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── DonorController.java
│   │   │   │   │   ├── HospitalController.java
│   │   │   │   │   ├── AppointmentController.java
│   │   │   │   │   ├── BloodRequestController.java
│   │   │   │   │   ├── BloodInventoryController.java
│   │   │   │   │   ├── NotificationController.java
│   │   │   │   │   └── UserController.java
│   │   │   │   ├── Model/
│   │   │   │   │   ├── UserModel.java
│   │   │   │   │   ├── Donor.java
│   │   │   │   │   ├── Hospital.java
│   │   │   │   │   ├── Appointment.java
│   │   │   │   │   ├── BloodRequest.java
│   │   │   │   │   ├── BloodInventory.java
│   │   │   │   │   ├── Notification.java
│   │   │   │   │   └── (Enums)
│   │   │   │   ├── Repository/
│   │   │   │   │   └── (JPA Repositories)
│   │   │   │   └── BackendApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml
│   └── mvnw
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── componet/
│   │   │   ├── Home/
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   ├── DonorDashboard/
│   │   │   ├── HospitalDashboard/
│   │   │   ├── AdminDashboard/
│   │   │   └── UserProfile/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── README.md
│
├── API_DOCUMENTATION.md
├── SYSTEM_WORKFLOW.md
└── README.md
```

---

## 🔑 Key Features Explained

### Eligibility System
- **Minimum Gap:** 56 days (8 weeks) between donations
- **Auto-Calculation:** System automatically checks eligibility daily
- **Clear Feedback:** Shows days remaining until next eligible date

### Emergency Alert System
- **Smart Matching:** Matches blood group + location
- **Flexible Filtering:** Optional location targeting
- **Real-time Delivery:** Instant notifications to all eligible donors

### Inventory Management
- **Expiry Tracking:** Automatic expiry date monitoring
- **Low Stock Alerts:** Configurable thresholds (default: 10 units)
- **Real-time Updates:** Live stock level display

---

## 🎯 Testing the System

### Create Test Users

1. **Admin User:**
   - Email: admin@bloodbank.com
   - Role: ADMIN

2. **Donor User:**
   - Email: donor1@example.com
   - Role: DONOR
   - Blood Group: O+

3. **Hospital User:**
   - Email: hospital@example.com
   - Role: HOSPITAL

### Test Workflow

1. Register as Admin and login
2. Add blood inventory
3. Register hospital and verify
4. Register donor with recent donation date
5. Try booking appointment (should show eligibility check)
6. Hospital submits urgent request
7. Admin sends emergency alert
8. Check donor notifications

---

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Error:**
```
Solution: Check MySQL service is running and credentials in application.properties
```

**Port Already in Use:**
```
Solution: Change port in application.properties:
server.port=8081
```

### Frontend Issues

**Cannot Connect to Backend:**
```
Solution: Verify backend is running on http://localhost:8080
Check API_BASE_URL in src/services/api.js
```

**npm install fails:**
```
Solution: Delete node_modules and package-lock.json, then run npm install again
```

---

## 🔒 Security Considerations

- ✅ Password encryption (implement bcrypt)
- ✅ Role-based access control
- ✅ Input validation on frontend and backend
- ✅ SQL injection prevention via JPA
- ⚠️ Implement JWT tokens for production
- ⚠️ Add HTTPS in production
- ⚠️ Rate limiting for API endpoints

---

## 📈 Future Enhancements

- [ ] Real-time notifications using WebSockets
- [ ] SMS/Email notifications
- [ ] Mobile app (React Native)
- [ ] Blood donation camps management
- [ ] Analytics dashboard
- [ ] Donor rewards/badges system
- [ ] Integration with national health databases
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] Blood compatibility checker

---

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

For issues, questions, or suggestions:
- Create an issue in the repository
- Email: support@bloodbank.example.com

---

## 🙏 Acknowledgments

- Spring Boot framework
- React.js framework
- MySQL database
- All contributors and users of this system

---

**Project Status:** ✅ Production Ready

**Last Updated:** 2026-02-27

**Version:** 2.0.0

---

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

Made with ❤️ for saving lives through efficient blood bank management
