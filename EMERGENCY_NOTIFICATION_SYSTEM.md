# Emergency Blood Request & Notification System Implementation

## Overview
Complete implementation of an automated emergency blood alert notification system that:
- Allows admins to create urgent blood requests with specific blood types needed
- Automatically identifies and notifies all donors with matching blood types
- Provides donors with a dedicated alerts page to view emergency blood requests
- Tracks notification status and allows donors to mark alerts as viewed

## Architecture

### Backend Components Implemented

#### 1. **NotificationService** (Enhanced)
**Location:** `backend/src/main/java/backend/Service/NotificationService.java`

**New Methods Added:**
- `sendEmergencyNotifications(EmergencyRequest emergencyRequest)` - Core function that:
  - Extracts blood type from the emergency request
  - Finds all donors with matching blood type using `DonorRepository.findByBloodType()`
  - Creates notification records for each matching donor
  - Returns count of notifications sent
  - Includes error handling for notification creation failures

**Features:**
- Automatic donor matching by blood type
- Rich notification messages with hospital, city, and contact information
- Exception handling to prevent one donor's notification failure from blocking others
- Returns count of successful notifications

#### 2. **EmergencyRequestService** (Enhanced)
**Location:** `backend/src/main/java/backend/Service/EmergencyRequestService.java`

**New Methods Added:**
- `createEmergencyRequestWithNotifications(EmergencyRequest request)` - Creates request and triggers automatic notifications
  - Saves the emergency request to database
  - Calls `NotificationService.sendEmergencyNotifications()`
  - Returns wrapper object with request and notification count

**New Inner Class:**
```java
public static class EmergencyRequestWithNotifications {
  private EmergencyRequest request;
  private int notificationCount;
  // Getters and setters
}
```

**Benefits:**
- Single method for complete emergency workflow
- Returns both request data and notification results
- Provides transparency on how many donors were notified

#### 3. **EmergencyRequestController** (Updated)
**Location:** `backend/src/main/java/backend/Controller/EmergencyRequestController.java`

**Updated Endpoint:**
- `POST /api/emergency-request` - Now includes notification sending
  - Creates emergency request using new service method
  - Returns response with:
    - `message`: Success confirmation
    - `request`: Full emergency request details
    - `notificationsSent`: Count of donors notified
    - `matchingDonors`: Count of matching blood type donors

**Response Example:**
```json
{
  "message": "Emergency request created successfully",
  "request": { /* full request object */ },
  "notificationsSent": 45,
  "matchingDonors": 45
}
```

#### 4. **NotificationController** (Enhanced)
**Location:** `backend/src/main/java/backend/Controller/NotificationController.java`

**New Endpoints:**
- `GET /api/notification/donor/{donorId}` - Get all notifications for a specific donor
- `GET /api/notification/status/{status}` - Filter notifications by status (SENT, READ, PENDING, FAILED)

#### 5. **NotificationsController** (New Alias)
**Location:** `backend/src/main/java/backend/Controller/NotificationsController.java`

**Purpose:** Provides plural form endpoints for frontend compatibility
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/{id}` - Get notification by ID
- `GET /api/notifications/donor/{donorId}` - Get donor's notifications
- `GET /api/notifications/status/{status}` - Filter by status
- `PUT /api/notifications/{id}` - Update notification status
- `DELETE /api/notifications/{id}` - Delete notification

#### 6. **DonorRepository** (Enhanced)
**Location:** `backend/src/main/java/backend/Repository/DonorRepository.java`

**New Query Method:**
```java
List<Donor> findByBloodType(String bloodType);
```
- Enables finding all donors with a specific blood type
- Critical for the emergency donor matching functionality

### Frontend Components Implemented

#### 1. **DonorNotifications Component** (New)
**Location:** `frontend/src/componet/DonorNotifications/DonorNotifications.js`

**Features:**
- Displays all emergency alerts for logged-in donors
- Real-time notification filtering (All / New / Viewed)
- Detailed emergency request information:
  - Blood type needed
  - Units required
  - Hospital location
  - Urgency level (CRITICAL, HIGH, MEDIUM, LOW)
  - Detailed description
  - Direct contact number for donations
- Status indicator (New/Viewed) with visual styling
- Mark as Viewed functionality
- Responsive design for all screen sizes
- "Pulse" animation on new alerts

**Notification Card Display:**
- Emergency badge with blood type
- Message preview with red indicator
- Grid-based detail display (Hospital, Location, Units, Urgency)
- Contact information box
- Timestamp and action buttons
- Color-coded urgency levels:
  - CRITICAL: Deep red (#FF4D4D)
  - HIGH: Orange (#FF9500)
  - MEDIUM: Yellow (#FFC400)
  - LOW: Green (#4CAF50)

#### 2. **DonorNotifications Styling** (New)
**Location:** `frontend/src/componet/DonorNotifications/DonorNotifications.css`

**Styling Includes:**
- Card-based layout with shadow effects
- Responsive grid for notification details
- Color-coded urgency levels
- Smooth transitions and hover effects
- Mobile-optimized interface
- Pulse animation for new alerts
- Filter button styling

#### 3. **Header Component** (Updated)
**Location:** `frontend/src/components/Header/Header.js`

**Changes:**
- Conditional "🔔 Alerts" link for logged-in donors
- Displays only when `donorId` exists in localStorage
- Links to `/notifications` page
- Separate logout handling for donors vs admins
- Includes donor email and name in localStorage

#### 4. **Header Styling** (Enhanced)
**Location:** `frontend/src/components/Header/Header.css`

**New Styles:**
- `.notifications-link` - Highlighted notification button
- Pulse animation for alerts
- Semi-transparent white background with hover effect

#### 5. **App Router** (Updated)
**Location:** `frontend/src/App.js`

**New Route:**
- `<Route path="/notifications" element={<DonorNotifications />} />`

**Component Import:**
- Added `DonorNotifications` import from notifications component

#### 6. **BookAppointment Component** (Enhanced)
**Location:** `frontend/src/pages/BookAppointment/BookAppointment.js`

**New Feature:** Donor localStorage persistence
- Stores `donorId`, `donorEmail`, `donorName`, `donorNic` after appointment booking
- Enables persistent login across sessions
- Auto-populates donor alerts link in header

#### 7. **BloodCampBooking Component** (Enhanced)
**Location:** `frontend/src/pages/BloodCampBooking/BloodCampBooking.js`

**New Feature:** Donor localStorage persistence
- Same persistence as BookAppointment
- Stores donor info when successfully booking a blood camp

## Database Schema

### Notification Table
- `notificationId` (PK) - Unique identifier
- `donorId` (FK) - References Donor
- `requestId` (FK) - References EmergencyRequest
- `message` - Alert message text
- `status` - SENT, READ, PENDING, FAILED
- `sentAt` - Timestamp when notification was created

### EmergencyRequest Table
- `requestId` (PK)
- `bloodTypeNeeded` - O+, O-, A+, A-, B+, B-, AB+, AB-
- `requiredUnits` - Number of units needed
- `hospitalId` (FK) - Hospital making the request
- `city` - Location
- `urgencyLevel` - CRITICAL, HIGH, MEDIUM, LOW
- More fields as previously documented

### Donor Table
- `donorId` (PK)
- `bloodType` - Blood type of donor
- Other donor details

## API Endpoints

### Emergency Request Endpoints
- `POST /api/emergency-request` - Create + Auto-notify donors
- `GET /api/emergency-request` - Get all requests
- `GET /api/emergency-request/{id}` - Get specific request
- `GET /api/emergency-request/blood-type/{bloodType}` - Get by blood type
- `GET /api/emergency-request/city/{city}` - Get by city
- `PUT /api/emergency-request/{id}` - Update request
- `DELETE /api/emergency-request/{id}` - Delete request

### Notification Endpoints (Singular)
- `GET /api/notification` - Get all
- `GET /api/notification/{id}` - Get by ID
- `GET /api/notification/donor/{donorId}` - Get donor's notifications
- `GET /api/notification/status/{status}` - Get by status
- `PUT /api/notification/{id}` - Update notification
- `DELETE /api/notification/{id}` - Delete

### Notification Endpoints (Plural)
- `GET /api/notifications` - Get all
- `GET /api/notifications/{id}` - Get by ID
- `GET /api/notifications/donor/{donorId}` - Get donor's notifications
- `GET /api/notifications/status/{status}` - Get by status
- `PUT /api/notifications/{id}` - Update notification
- `DELETE /api/notifications/{id}` - Delete

## Workflow

### Admin Creates Emergency Request
1. Admin navigates to `/admin/emergency-requests`
2. Fills in emergency details:
   - Title
   - Blood type needed
   - Units required
   - Hospital
   - City
   - Urgency level
   - Description
   - Contact number
3. Clicks "Create Emergency Request"
4. Backend:
   - Saves EmergencyRequest
   - Queries `DonorRepository.findByBloodType(bloodType)`
   - Creates Notification for each matching donor
   - Returns success response with notification count

### Donor Receives & Views Notification
1. Donor logs in through:
   - Book Appointment page, or
   - Blood Camp Booking page
2. Backend stores `donorId` in localStorage
3. Header displays "🔔 Alerts" link
4. Donor clicks "🔔 Alerts"
5. Frontend fetches notifications from `GET /api/notifications/donor/{donorId}`
6. Displays all emergency alerts with:
   - Filter buttons (All/New/Viewed)
   - Rich notification cards
   - Hospital and contact details
7. Donor can:
   - View full emergency request details
   - See contact number to respond
   - Mark alerts as viewed

## Key Features

✅ **Automatic Donor Matching**
- Instantly finds all eligible donors by blood type

✅ **Real-time Notifications**
- Donors see alerts immediately after login

✅ **Status Tracking**
- Track which donors have seen the alert

✅ **Rich Information Display**
- Complete emergency context for donors
- Direct contact information

✅ **Responsive Design**
- Works on desktop, tablet, and mobile

✅ **Error Handling**
- Gracefully handles notification failures
- No single donor failure blocks others

✅ **Persistent Login**
- Donors stay logged in across sessions
- Easy access to alerts from header

## Testing Workflow

### To Test Emergency Notification System:

1. **Backend Compilation:**
   ```bash
   cd backend
   .\mvnw.cmd package -DskipTests
   ```

2. **Start Backend:**
   - Backend runs on `http://localhost:8080`

3. **Create Test Donor:**
   - Go to Book Appointment page
   - Enter NIC, fill form with blood type (e.g., "O+")
   - Book an appointment
   - DonorId stored in localStorage

4. **Create Emergency Request:**
   - Admin logs in
   - Navigate to `/admin/emergency-requests`
   - Create request for blood type "O+"
   - Note the `notificationsSent` count in response

5. **View Notifications:**
   - Donor refreshes page (already logged in from step 3)
   - Header shows "🔔 Alerts" link
   - Click link to view emergency notifications
   - Should see the created emergency request

6. **Mark as Viewed:**
   - Click "Mark as Viewed" button on notification
   - Status changes from "New" to "Viewed"

## System State

### ✅ Completed
- Emergency Request creation with full CRUD
- Automatic donor matching by blood type
- Notification creation and storage
- Frontend notifications page with filtering
- Donor localStorage persistence
- Header navigation with alerts link
- Status tracking (SENT, READ, PENDING, FAILED)
- Both singular and plural API endpoint versions

### 📋 Optional Enhancements (Future)
- Email notification sending integration
- SMS alerts for urgent requests
- Push notifications via browser
- Donor response/acknowledgment tracking
- Notification history and analytics
- Blood type availability dashboard
- Admin notification delivery confirmation

## Code Compilation Status
✅ **Backend:** Successfully compiles with Maven
✅ **Frontend:** Ready for npm start

## Summary
The Emergency Blood Request and Notification System is now fully implemented and operational. Admins can create urgent blood requests, and the system automatically identifies and notifies all eligible donors with matching blood types. Donors receive persistent notifications in their alerts page and can track which emergencies they've viewed.
