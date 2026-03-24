# Blood Bank Management System - API Endpoints Documentation

## Base URL
```
http://localhost:8080/api
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "DONOR" // or "HOSPITAL", "ADMIN"
}
```

**Response:**
```json
{
  "userId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "DONOR"
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "userId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "DONOR",
  "message": "Login successful"
}
```

---

## 👥 Donor Endpoints

### Create Donor Profile
**POST** `/donors`

**Request Body:**
```json
{
  "userId": 1,
  "bloodGroup": "A_POSITIVE",
  "phone": "1234567890",
  "address": "123 Main St",
  "city": "Colombo",
  "state": "Western",
  "dateOfBirth": "1995-05-15",
  "lastDonationDate": "2025-12-01" // Optional
}
```

### Get All Donors
**GET** `/donors`

### Get Donor by ID
**GET** `/donors/{id}`

### Get Donor by User ID
**GET** `/donors/user/{userId}`

### Get Donors by Blood Group
**GET** `/donors/blood-group/{bloodGroup}`

**Example:** `/donors/blood-group/A_POSITIVE`

### Get Eligible Donors
**GET** `/donors/eligible`

### Get Eligible Donors by Blood Group
**GET** `/donors/eligible/{bloodGroup}`

### Check Donor Eligibility
**GET** `/donors/{id}/eligibility`

**Response:**
```json
{
  "donorId": 1,
  "isEligible": false,
  "daysSinceLastDonation": 30,
  "lastDonationDate": "2026-01-01",
  "canDonateOn": "2026-02-26",
  "daysUntilEligible": 26
}
```

### Get Donor Appointments
**GET** `/donors/{id}/appointments`

### Update Donor
**PUT** `/donors/{id}`

### Delete Donor
**DELETE** `/donors/{id}`

---

## 🏥 Hospital Endpoints

### Create Hospital Profile
**POST** `/hospitals`

**Request Body:**
```json
{
  "userId": 2,
  "hospitalName": "City General Hospital",
  "phone": "0112345678",
  "address": "456 Hospital Rd",
  "city": "Colombo",
  "state": "Western",
  "registrationNumber": "HOS2024001"
}
```

### Get All Hospitals
**GET** `/hospitals`

### Get Hospital by ID
**GET** `/hospitals/{id}`

### Get Hospital by User ID
**GET** `/hospitals/user/{userId}`

### Verify Hospital
**PUT** `/hospitals/{id}/verify`

### Get Hospital Requests
**GET** `/hospitals/{id}/requests`

### Update Hospital
**PUT** `/hospitals/{id}`

### Delete Hospital
**DELETE** `/hospitals/{id}`

---

## 📋 Blood Request Endpoints

### Create Blood Request
**POST** `/blood-requests`

**Request Body:**
```json
{
  "hospitalId": 1,
  "bloodGroup": "O_NEGATIVE",
  "quantity": 5,
  "urgencyLevel": "CRITICAL", // LOW, MEDIUM, HIGH, CRITICAL
  "patientName": "Jane Smith",
  "reason": "Emergency surgery"
}
```

**Response:**
```json
{
  "id": 1,
  "hospital": {...},
  "bloodGroup": "O_NEGATIVE",
  "quantity": 5,
  "urgencyLevel": "CRITICAL",
  "status": "PENDING",
  "patientName": "Jane Smith",
  "reason": "Emergency surgery",
  "createdAt": "2026-02-27T10:30:00"
}
```

### Get All Requests
**GET** `/blood-requests`

### Get Request by ID
**GET** `/blood-requests/{id}`

### Get Requests by Hospital
**GET** `/blood-requests/hospital/{hospitalId}`

### Get Pending Requests
**GET** `/blood-requests/pending`

### Get Requests by Status
**GET** `/blood-requests/status/{status}`

**Status Options:** PENDING, APPROVED, DELIVERED, REJECTED

### Approve Request
**PUT** `/blood-requests/{id}/approve`

**Request Body:**
```json
{
  "approvedBy": 3,
  "adminNotes": "Approved - stock available"
}
```

### Reject Request
**PUT** `/blood-requests/{id}/reject`

**Request Body:**
```json
{
  "adminNotes": "Insufficient stock available"
}
```

### Mark Request as Delivered
**PUT** `/blood-requests/{id}/deliver`

### Delete Request
**DELETE** `/blood-requests/{id}`

---

## 📅 Appointment Endpoints

### Create Appointment
**POST** `/appointments`

**Request Body:**
```json
{
  "donorId": 1,
  "appointmentDate": "2026-03-15",
  "appointmentTime": "10:00",
  "donationCenter": "Central Blood Bank",
  "notes": "First time donor"
}
```

**Success Response:**
```json
{
  "id": 1,
  "donor": {...},
  "appointmentDate": "2026-03-15",
  "appointmentTime": "10:00",
  "status": "SCHEDULED",
  "donationCenter": "Central Blood Bank",
  "notes": "First time donor"
}
```

**Error Response (Not Eligible):**
```json
{
  "message": "You need to wait 26 more days before your next donation",
  "eligible": false,
  "daysRemaining": 26,
  "nextEligibleDate": "2026-03-15"
}
```

### Get All Appointments
**GET** `/appointments`

### Get Appointment by ID
**GET** `/appointments/{id}`

### Get Appointments by Donor
**GET** `/appointments/donor/{donorId}`

### Get Upcoming Appointments
**GET** `/appointments/upcoming`

### Get Appointments by Status
**GET** `/appointments/status/{status}`

**Status Options:** SCHEDULED, COMPLETED, CANCELLED

### Complete Appointment
**PUT** `/appointments/{id}/complete`

### Cancel Appointment
**PUT** `/appointments/{id}/cancel`

### Update Appointment
**PUT** `/appointments/{id}`

### Delete Appointment
**DELETE** `/appointments/{id}`

---

## 💉 Blood Inventory Endpoints

### Add Blood Unit
**POST** `/blood-inventory`

**Request Body:**
```json
{
  "bloodGroup": "A_POSITIVE",
  "quantity": 10,
  "collectionDate": "2026-02-27",
  "expiryDate": "2026-04-10"
}
```

### Get All Inventory
**GET** `/blood-inventory`

### Get Available Inventory
**GET** `/blood-inventory/available`

### Get Expired Inventory
**GET** `/blood-inventory/expired`

### Get Inventory by Blood Group
**GET** `/blood-inventory/blood-group/{bloodGroup}`

### Get Blood Stock Summary
**GET** `/blood-inventory/summary`

**Response:**
```json
{
  "A+": 25,
  "A-": 10,
  "B+": 30,
  "B-": 5,
  "AB+": 8,
  "AB-": 3,
  "O+": 40,
  "O-": 7
}
```

### Get Low Stock Alerts
**GET** `/blood-inventory/low-stock`

**Response:**
```json
[
  {
    "bloodGroup": "O-",
    "quantity": 7,
    "threshold": 10,
    "status": "LOW"
  },
  {
    "bloodGroup": "AB-",
    "quantity": 0,
    "threshold": 10,
    "status": "CRITICAL"
  }
]
```

### Check and Mark Expired Blood
**PUT** `/blood-inventory/check-expired`

**Response:**
```json
{
  "message": "3 blood units marked as expired"
}
```

### Update Inventory
**PUT** `/blood-inventory/{id}`

### Delete Inventory
**DELETE** `/blood-inventory/{id}`

---

## 🔔 Notification Endpoints

### Create Notification
**POST** `/notifications`

**Request Body:**
```json
{
  "userId": 1,
  "type": "GENERAL",
  "title": "New Campaign",
  "message": "Blood donation campaign this weekend!"
}
```

### Broadcast Notification
**POST** `/notifications/broadcast`

**Request Body:**
```json
{
  "role": "DONOR", // or "HOSPITAL", "ADMIN", "ALL"
  "type": "GENERAL",
  "title": "Announcement",
  "message": "System maintenance scheduled"
}
```

**Response:**
```json
{
  "message": "Notification sent to 150 users"
}
```

### Send Emergency Alert
**POST** `/notifications/emergency-alert`

**Request Body:**
```json
{
  "bloodGroup": "O_NEGATIVE",
  "message": "Critical shortage at City Hospital",
  "location": "Colombo" // Optional
}
```

**Response:**
```json
{
  "message": "Emergency alert sent",
  "notificationsSent": 45,
  "bloodGroup": "O-",
  "location": "Colombo"
}
```

### Get All Notifications
**GET** `/notifications`

### Get Notification by ID
**GET** `/notifications/{id}`

### Get User Notifications
**GET** `/notifications/user/{userId}`

**Returns:** All notifications for user, ordered by creation date (newest first)

### Get Unread Notifications
**GET** `/notifications/user/{userId}/unread`

### Get Unread Count
**GET** `/notifications/user/{userId}/unread-count`

**Response:**
```json
{
  "unreadCount": 5
}
```

### Mark Notification as Read
**PUT** `/notifications/{id}/read`

### Mark All Notifications as Read
**PUT** `/notifications/user/{userId}/mark-all-read`

### Delete Notification
**DELETE** `/notifications/{id}`

### Delete All User Notifications
**DELETE** `/notifications/user/{userId}`

---

## 📊 Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (Validation Error) |
| 404 | Not Found |
| 409 | Conflict (Duplicate Entry) |
| 500 | Internal Server Error |

---

## 🎯 Common Error Responses

### Validation Error
```json
{
  "message": "You need to wait 26 more days before your next donation",
  "eligible": false,
  "daysRemaining": 26
}
```

### Not Found Error
```json
{
  "message": "Donor not found"
}
```

### Conflict Error
```json
{
  "message": "You already have an appointment scheduled on this date"
}
```

### Authorization Error
```json
{
  "message": "Hospital must be verified to submit requests"
}
```

---

## 🔄 Blood Group Values

Use these exact values when specifying blood groups:
- `A_POSITIVE` (Display: A+)
- `A_NEGATIVE` (Display: A-)
- `B_POSITIVE` (Display: B+)
- `B_NEGATIVE` (Display: B-)
- `AB_POSITIVE` (Display: AB+)
- `AB_NEGATIVE` (Display: AB-)
- `O_POSITIVE` (Display: O+)
- `O_NEGATIVE` (Display: O-)

---

## ⚡ Request/Urgency Levels

- `LOW` - Standard request
- `MEDIUM` - Elevated priority
- `HIGH` - High priority
- `CRITICAL` - Emergency

---

## 📝 Notification Types

- `APPOINTMENT_REMINDER` - Appointment confirmations/reminders
- `EMERGENCY_ALERT` - Urgent blood needs
- `REQUEST_UPDATE` - Blood request status changes
- `GENERAL` - General announcements

---

## 🎭 User Roles

- `DONOR` - Blood donors
- `HOSPITAL` - Hospital staff
- `ADMIN` - Blood bank administrators

---

## 💡 Tips for Frontend Integration

1. **Date Format:** Use ISO format (YYYY-MM-DD) for all dates
2. **Time Format:** Use 24-hour format (HH:MM)
3. **Error Handling:** Always check response status and handle errors gracefully
4. **Loading States:** Show loading indicators during API calls
5. **Validation:** Validate data on frontend before sending to reduce server load
6. **Notifications:** Poll unread notification count periodically or use WebSockets
7. **Real-time Updates:** Reload relevant data after successful mutations

---

## 🔒 Security Notes

1. All passwords should be sent securely (HTTPS recommended)
2. Store user session data securely (localStorage/sessionStorage)
3. Include user authentication token in headers for protected routes
4. Validate user roles before allowing actions
5. Sanitize all user input on both frontend and backend

---

**API Version:** 1.0  
**Last Updated:** 2026-02-27  
**Documentation Status:** Complete ✅
