# Emergency Blood Request - Real Email Notifications Setup Guide

## Overview

The system now sends **real email notifications** to eligible donors when an admin creates an emergency blood request. Matched donors are displayed with their email delivery status on the admin interface.

## 📋 What's New

### Backend Features Added

1. **EmailService.java** - Handles actual email sending
   - `sendEmergencyNotificationEmail()` - Sends detailed emergency request email
   - `sendSimpleEmail()` - Generic email sending capability

2. **Enhanced NotificationService** - Now sends emails
   - Returns matched donor details with email status
   - Tracks which emails were successfully sent
   - Returns comprehensive response with all donor information

3. **Enhanced EmergencyRequestController** - Returns full results
   - Response includes matched donors list
   - Shows email delivery status for each donor
   - Displays total notifications sent vs emails delivered

### Frontend Features Added

1. **Matched Donors Modal** - Beautiful result display after creating request
   - Shows request details
   - Displays notification statistics
   - Lists all matched donors with:
     - Donor name
     - Email address  
     - Phone number
     - City/location
     - Blood type
     - Email delivery status (✓ Sent / ⚠ Failed)

2. **Real-time Status Tracking**
   - Visual indicators for successful/failed emails
   - Color-coded status (green for success, orange for failure)
   - Comprehensive donor information for follow-up

## 🔧 Email Configuration

### Option 1: Gmail (Recommended for Testing)

1. **Prerequisites:**
   - Gmail account
   - Google Account with 2FA enabled (recommended)

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password
   - Copy this password

3. **Update `application.properties`:**
   ```properties
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-app-password
   spring.mail.properties.mail.smtp.auth=true
   spring.mail.properties.mail.smtp.starttls.enable=true
   spring.mail.properties.mail.smtp.starttls.required=true
   ```

### Option 2: MailHog (For Local Testing Without Real Emails)

1. **Install MailHog:**
   ```bash
   # Download from: https://github.com/mailhog/MailHog/releases
   # Or use Docker:
   docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
   ```

2. **Update `application.properties`:**
   ```properties
   spring.mail.host=localhost
   spring.mail.port=1025
   ```

3. **View Emails:**
   - Open http://localhost:8025 in your browser
   - See all sent emails without actually sending them

### Option 3: Other Email Providers

**SendGrid:**
```properties
spring.mail.host=smtp.sendgrid.net
spring.mail.port=587
spring.mail.username=apikey
spring.mail.password=SG.xxxxx (your SendGrid API key)
```

**Outlook:**
```properties
spring.mail.host=smtp.office365.com
spring.mail.port=587
spring.mail.username=your-email@outlook.com
spring.mail.password=your-password
```

**Custom SMTP Server:**
```properties
spring.mail.host=your-smtp-server.com
spring.mail.port=587
spring.mail.username=your-username
spring.mail.password=your-password
```

## 🚀 How It Works

### Step-by-Step Flow

```
1. Admin fills emergency request form
   ↓
2. Clicks "Create Request" button
   ↓
3. Backend receives request
   ↓
4. Saves emergency request to database
   ↓
5. Finds ALL donors with matching blood type
   ↓
6. For each matching donor:
   - Creates notification record in database
   - Sends detailed email with emergency details
   - Tracks whether email sent successfully
   ↓
7. Returns response with:
   - Request details
   - Total notifications created
   - Total emails sent
   - List of all matched donors with delivery status
   ↓
8. Frontend displays matched donors modal
   ↓
9. Admin sees exactly who was notified and via which channels
```

### Email Content Example

When sent, each donor receives an email like:

```
Subject: 🚨 EMERGENCY: Blood Donation Needed - O+

Dear John Doe,

There is an URGENT blood donation request that needs your help!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EMERGENCY BLOOD REQUEST DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Blood Type Needed: O+
Units Required: 10 units
Hospital: City Hospital
Location: Colombo
Urgency Level: CRITICAL
Contact Number: +94-11-234-5678

DESCRIPTION:
Patient in critical condition needs immediate blood transfusion.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You have been selected because your blood type matches the requirement.

Please contact the hospital immediately if you are willing to donate:
📞 +94-11-234-5678

Every drop counts. Your donation can save a life!

Thank you for being a lifesaver!

With gratitude,
Blood Donation System Team
```

## 📊 Response Example

### Create Emergency Request Response:

```json
{
  "message": "Emergency request created successfully",
  "request": {
    "requestId": 1,
    "title": "O+ Blood Urgently Needed",
    "bloodTypeNeeded": "O+",
    "requiredUnits": 10,
    "hospital": {
      "hospitalName": "City Hospital"
    },
    "city": "Colombo",
    "urgencyLevel": "CRITICAL",
    "contactNumber": "+94-11-234-5678"
  },
  "notificationsSent": 24,
  "emailsSent": 23,
  "totalDonorsMatched": 24,
  "matchingDonors": [
    {
      "donorId": 5,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+94-71-234-5678",
      "city": "Colombo",
      "bloodType": "O+",
      "emailSent": true
    },
    {
      "donorId": 8,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+94-72-123-4567",
      "city": "Colombo",
      "bloodType": "O+",
      "emailSent": true
    },
    ...more donors...
  ]
}
```

## 🎯 Admin Interface - Matched Donors Modal

After creating an emergency request, admins see:

1. **Request Summary Section**
   - Title, blood type, units needed
   - Hospital, city, urgency level
   - Full description

2. **Notification Status Section**
   - Number of notifications created
   - Number of emails successfully sent
   - Total eligible donors matched

3. **Matched Donors List**
   - Each donor displayed as a card
   - Shows: Name, Email, Phone, City, Blood Type
   - Green badge (✓ Email Sent) or Orange badge (⚠ Email Failed)
   - Email address highlighted for follow-up

4. **No Donors Message** (if applicable)
   - Clear message if no donors match the blood type
   - Suggests registering more donors with that blood type

## 🧪 Testing Instructions

### 1. Using Gmail (Production-like Testing)

```
1. Update application.properties with your Gmail credentials
2. Restart backend server (mvn spring-boot:run)
3. Go to Admin Dashboard → Emergency Requests
4. Create an emergency request with:
   - Blood Type: Choose a type that has registered donors
   - Fill all required fields
5. Check your email inbox for the notification emails
```

### 2. Using MailHog (Development Testing)

```
1. Start MailHog (Docker or direct download)
2. Update application.properties to use localhost:1025
3. Restart backend server
4. Create an emergency request in admin interface
5. Open http://localhost:8025 to see all emails
6. Check that emails contain correct information
```

### 3. Testing Each Blood Type

To test effectively:

1. Register donors with each blood type (O+, O-, A+, A-, B+, B-, AB+, AB-)
2. Create emergency requests for each type
3. Verify matched donors are correct
4. Confirm emails are sent to the right people

## 🔐 Important Security Notes

1. **Never commit passwords to git:**
   - Use environment variables for production
   - See: [Spring Boot Environment Variables Guide](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)

2. **Gmail App Passwords:**
   - These are different from your Google password
   - Use only for this application
   - Can be revoked anytime

3. **Email Privacy:**
   - All donor emails are private
   - Only used for emergency notifications
   - No spam or unsolicited emails sent

4. **Email Content:**
   - Never includes personal health information beyond blood type
   - Professional and emergency-focused

## 📧 Email Delivery Status

### Why Some Emails Might Fail

1. **Invalid email address** - Donor email format incorrect
2. **SMTP Configuration** - Wrong SMTP settings
3. **Gmail Security** - Less secure apps need special permission
4. **Network Issues** - No internet connection
5. **Email Server Down** - Temporary SMTP server issues

### How to Handle Failures

```
if (emailSent == false) {
  // Log the email for manual sending
  // Show warning to admin
  // Provide manual contact option (phone/SMS)
}
```

## 🔄 Database Records

Two database entries created per donor when email sent:

1. **notifications table**
   - notificationId
   - donorId (FK)
   - requestId (FK)
   - message
   - status ('SENT', 'READ', etc.)
   - sentAt (timestamp)

2. **emergency_requests table**
   - requestId
   - title, bloodTypeNeeded, requiredUnits
   - hospitalId (FK)
   - city, urgencyLevel
   - description, contactNumber
   - createdDate, createdAt

## 📱 Alternative Communication Channels (Optional)

For future enhancement, you can add:

1. **SMS Notifications:**
   - Integrate Twilio
   - Send urgent alerts via SMS

2. **WhatsApp Notifications:**
   - Use WhatsApp Business API
   - Direct urgent messages

3. **Push Notifications:**
   - Browser push notifications
   - Mobile app push notifications

4. **Voice Call:**
   - Automated phone calls
   - Critical emergency dial-out

## 📞 Troubleshooting

### Problem: Emails not being sent

**Solution 1: Check Gmail App Password**
```
- Go to myaccount.google.com/apppasswords
- Generate a new password
- Update application.properties
- Restart backend
```

**Solution 2: Check Email Configuration**
```
- Verify SMTP host and port are correct
- Check username and password spelling
- Ensure STARTTLS is enabled for port 587
```

**Solution 3: Check Backend Logs**
```
- Look for error messages in console
- Enable mail.smtp debugging:
  spring.mail.properties.mail.debug=true
```

### Problem: Donors not found

**Solution:**
```
- Create test donors with the blood type you're requesting
- Verify donor records exist in database
- Check blood type spelling matches exactly (e.g., "O+" not "O +")
```

### Problem: Modal not showing matched donors

**Solution:**
```
- Open browser DevTools (F12)
- Check Console for JavaScript errors
- Verify API response includes matchingDonors array
- Check Network tab to see actual response
```

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend compiles without errors
- [ ] application.properties has valid email credentials
- [ ] Database has test donors with various blood types
- [ ] Can create emergency request in admin interface
- [ ] Matched donors modal appears after creation
- [ ] Donor list shows all matching blood type donors
- [ ] Email status shows ✓ or ⚠ for each donor
- [ ] Actual emails received (or appear in MailHog)
- [ ] Email content is formatted correctly
- [ ] Phone numbers and emails are correct in modal
- [ ] System handles no matching donors gracefully

## 📚 File Changes Summary

**Backend Files Modified/Created:**
- ✅ `pom.xml` - Added spring-boot-starter-mail
- ✅ `EmailService.java` - NEW email sending service
- ✅ `NotificationService.java` - Enhanced with email integration
- ✅ `EmergencyRequestService.java` - Updated response handling
- ✅ `EmergencyRequestController.java` - Fixed type conversion + enhanced response
- ✅ `application.properties` - Added email configuration

**Frontend Files Modified/Created:**
- ✅ `ManageEmergencyRequests.js` - Added result modal and matched donors display
- ✅ `ManageEmergencyRequests.css` - Added modal styling (350+ lines)

## 🎉 Summary

Your system now:
1. ✅ Automatically finds all donors with matching blood type
2. ✅ Sends real email notifications to matched donors
3. ✅ Displays matched donors with email delivery status
4. ✅ Provides admin confirmation with comprehensive details
5. ✅ Tracks which emails were successfully delivered
6. ✅ Handles failures gracefully with clear messaging

**Next Steps:**
1. Configure your email credentials in `application.properties`
2. Test with a few donors and emergency requests
3. Verify emails are being received
4. Deploy to production when ready

---

**Questions?** Review the logs to understand the email flow and troubleshoot any issues.
