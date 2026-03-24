# Blood Bank Management System - Complete Workflow

## System Overview

This Blood Bank Management System connects Donors, Hospitals, and Blood Bank Administrators to facilitate efficient blood donation and distribution.

---

## 🩸 1. DONOR WORKFLOW

### Step 1: Registration
**Process:**
1. Donor visits the website and navigates to Register page
2. Fills in registration details:
   - Name
   - Email & Password
   - Role: Select "DONOR"
3. After successful registration, logs in
4. Completes Donor Profile with:
   - Blood Group (A+, A-, B+, B-, AB+, AB-, O+, O-)
   - Phone Number
   - Complete Address (Address, City, State)
   - Date of Birth
   - Last Donation Date (if applicable)

**Backend Process:**
- User account created in `users` table
- Donor details saved in `donors` table
- System automatically checks eligibility based on last donation date

### Step 2: Book Appointment
**Process:**
1. Navigate to "Appointments" tab in Donor Dashboard
2. Select appointment date (future dates only)
3. Select preferred time slot
4. Enter donation center location
5. Add optional notes
6. Submit appointment request

**System Checks:**
- ✅ Donor must wait minimum 56 days (8 weeks) between donations
- ✅ No duplicate appointments on same date
- ✅ Appointment date must be in the future
- ✅ Donor eligibility status must be active

**If Eligible:**
- Appointment saved to database with status "SCHEDULED"
- Confirmation notification sent to donor

**If Not Eligible:**
- System displays:
  - Reason for ineligibility
  - Days remaining until next eligible date
  - Next eligible donation date

### Step 3: Receive Emergency Alerts
**When It Happens:**
- Hospital submits urgent blood request
- Admin sends emergency alert for specific blood group

**Notification Process:**
1. System identifies eligible donors with matching blood group
2. If location specified, filters donors by city/state
3. Sends emergency notification to all matching donors
4. Notification appears in Donor's notification panel with:
   - Urgency indicator
   - Blood group needed
   - Location details
   - Request message

### Step 4: View Donation History
**Features:**
1. Navigate to "Donation History" tab
2. View statistics:
   - Total donations made
   - Last donation date
   - Blood group
3. See timeline of all completed donations with:
   - Donation date
   - Location/Center
   - Time
   - Status
   - Any special notes

---

## 🏥 2. HOSPITAL WORKFLOW

### Step 1: Hospital Registration
**Process:**
1. Hospital admin visits registration page
2. Fills in details:
   - Hospital Name
   - Official Email & Password
   - Role: Select "HOSPITAL"
3. After login, completes Hospital Profile:
   - Hospital Registration Number
   - Phone Number
   - Complete Address (Address, City, State)

**Backend Process:**
- Hospital account created with `verified: false` status
- Awaits admin verification before submitting requests

### Step 2: Submit Blood Request
**Requirements:**
- Hospital must be verified by admin

**Process:**
1. Navigate to "Submit Request" section
2. Fill in request details:
   - Blood Group needed
   - Quantity (in units)
   - Urgency Level: LOW, MEDIUM, HIGH, CRITICAL
   - Patient Name
   - Reason for request
3. Submit request

**System Actions:**
- Request saved with status "PENDING"
- All Blood Bank Admins receive notification
- Request appears in admin dashboard for review

### Step 3: Track Request Status
**Available Statuses:**
- 🟡 **PENDING**: Request submitted, awaiting admin review
- 🟢 **APPROVED**: Admin approved, preparing for delivery
- 🔵 **DELIVERED**: Blood units delivered to hospital
- 🔴 **REJECTED**: Request denied (with reason from admin)

**Hospital Dashboard Shows:**
- All submitted requests
- Current status of each request
- Admin notes/feedback
- Request history

---

## 🧑‍💼 3. ADMIN / BLOOD BANK STAFF WORKFLOW

### Step 1: Blood Inventory Management

#### Adding New Blood Units
**Process:**
1. Navigate to "Inventory" tab
2. Click "Add New Blood Unit"
3. Enter details:
   - Blood Group
   - Quantity (units)
   - Collection Date
   - Expiry Date (typically 35-42 days from collection)
4. Save to inventory

#### Auto-Expiry Tracking
**System Automatically:**
- Checks expiry dates daily
- Marks expired blood units as unusable
- Shows expiry alerts for units expiring soon
- Removes expired units from available stock count

#### Low Stock Alerts
**System Monitors:**
- Current stock levels for each blood group
- Generates alerts when stock falls below threshold (default: 10 units)
- Alert levels:
  - **LOW**: Below 10 units
  - **CRITICAL**: 0 units

**Dashboard Display:**
- Red alert: Critical (0 units)
- Orange alert: Low stock (1-9 units)
- Green: Adequate stock (10+ units)

### Step 2: Manage Hospital Requests

#### Review Requests
1. Navigate to "Requests" tab
2. See all pending requests with:
   - Hospital name
   - Blood group needed
   - Quantity
   - Urgency level
   - Patient details
   - Reason

#### Approve Request
**Process:**
1. Click "Approve" on request
2. System checks if sufficient stock available
3. If approved:
   - Status changes to "APPROVED"
   - Hospital receives notification
   - Stock can be allocated

#### Reject Request
**Process:**
1. Click "Reject"
2. Enter reason for rejection
3. Hospital receives notification with reason

#### Mark as Delivered
Once blood is delivered to hospital:
1. Change status to "DELIVERED"
2. System deducts quantity from inventory
3. Updates stock levels
4. Records transaction

### Step 3: Send Emergency Notifications

#### Emergency Alert System
**When to Use:**
- Critical shortage of specific blood group
- Urgent request from hospital
- Mass casualty event
- Natural disaster response

**Process:**
1. Navigate to "Emergency Alerts" tab
2. Fill in alert form:
   - Blood Group needed
   - Location (Optional - City/State to target specific area)
   - Emergency Message
3. Click "Send Emergency Alert"

**System Actions:**
1. Identifies all eligible donors with matching blood group
2. If location specified:
   - Filters donors by city/state match
   - Only notifies donors in specified location
3. Sends URGENT notification to all matching donors
4. Notification includes:
   - Emergency indicator
   - Blood group needed
   - Location (if specified)
   - Custom message from admin

**Confirmation:**
- Admin receives confirmation message showing:
  - Number of donors notified
  - Blood group
  - Location targeted (if applicable)

### Step 4: Verify Hospitals
**Process:**
1. Navigate to "Hospitals" tab
2. Review pending hospital registrations
3. Verify legitimacy by checking:
   - Registration number
   - Contact details
   - Official documentation
4. Click "Verify" to activate hospital
5. Hospital can now submit blood requests

### Step 5: Monitor Appointments
**Features:**
1. View all upcoming donor appointments
2. See scheduled donations by:
   - Date
   - Donor name and blood group
   - Location
3. Mark appointments as "COMPLETED" after donation
4. System updates:
   - Donor's last donation date
   - Total donation count
   - Eligibility status (reset to ineligible for 56 days)

---

## 🔄 Key System Features

### Eligibility Calculation
**Rules:**
- Minimum 56 days (8 weeks) between donations
- Automatically recalculated daily
- Donors not eligible if donated within last 56 days
- Eligibility restored automatically after 56 days

### Notification System
**Types:**
1. **APPOINTMENT_REMINDER**: Appointment confirmation/reminders
2. **EMERGENCY_ALERT**: Urgent blood need
3. **REQUEST_UPDATE**: Request status changes
4. **GENERAL**: General announcements

### Blood Stock Management
**Features:**
- Real-time stock tracking
- Multi-blood group inventory
- Expiry date monitoring
- Low stock alerts
- Automatic expired blood removal

### Smart Location Matching
**For Emergency Alerts:**
- Matches donor city with request location
- Also matches donor state with request location
- Case-insensitive matching
- Allows targeting specific geographic areas

---

## 📊 Dashboard Features

### Donor Dashboard
- Profile overview with eligibility status
- Current blood stock levels (highlighting donor's blood group)
- Appointment booking and management
- Donation history timeline
- Emergency notifications
- Unread notification count

### Hospital Dashboard
- Request submission form
- Request tracking with real-time status
- Blood stock visibility
- Communication with blood bank
- Request history

### Admin Dashboard
- Overview statistics:
  - Total donors
  - Registered hospitals
  - Pending requests
  - Upcoming appointments
- Blood stock summary for all groups
- Low stock alerts
- Donor management
- Hospital verification
- Request approval/rejection
- Emergency alert broadcasting
- Appointment monitoring

---

## 🔐 Security Features

- Role-based access control (DONOR, HOSPITAL, ADMIN)
- Password encryption
- Session management
- Protected routes
- Hospital verification requirement
- Eligibility validation

---

## 🎯 User Experience Highlights

1. **Intuitive Navigation**: Tabbed interface for easy access
2. **Real-time Updates**: Instant status changes and notifications
3. **Visual Indicators**: Color-coded status badges and alerts
4. **Responsive Design**: Works on desktop and mobile devices
5. **Clear Feedback**: Success/error messages for all actions
6. **Data Validation**: Prevents invalid data entry
7. **Smart Defaults**: Pre-filled sensible values in forms

---

## 📈 System Benefits

### For Donors:
- Easy appointment booking
- Clear eligibility information
- Emergency alert response capability
- Complete donation history tracking

### For Hospitals:
- Quick request submission
- Real-time status tracking
- Transparent communication
- Request history maintenance

### For Blood Banks:
- Centralized management
- Automated eligibility tracking
- Efficient emergency response
- Comprehensive inventory control
- Data-driven decision making

---

## 🚀 Getting Started

### Prerequisites
- Java 17+ (Backend)
- Node.js 16+ (Frontend)
- MySQL Database

### Backend Setup
```bash
cd backend
mvnw spring-boot:run
```
Backend runs on: http://localhost:8080

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs on: http://localhost:3000

### Database Configuration
Configure in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/blood_bank
spring.datasource.username=your_username
spring.datasource.password=your_password
```

---

## 📞 Support & Maintenance

For issues or questions:
1. Check system logs for errors
2. Verify database connectivity
3. Ensure all services are running
4. Review user role permissions

---

**Last Updated:** 2026-02-27
**Version:** 2.0
**System Status:** Production Ready ✅
