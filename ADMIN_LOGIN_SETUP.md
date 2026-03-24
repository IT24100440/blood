# Admin Login Setup Guide

## Problem: Unable to Login to Admin Panel

If you're unable to login to the admin panel, it's likely because there are no admin accounts registered in the database yet. Follow these steps to set up your first admin account.

---

## Solution 1: Register via Frontend (Recommended)

### Step 1: Start the Backend Server
```bash
cd c:\Users\menuw\Desktop\Blood\backend
.\mvnw.cmd spring-boot:run
```
Wait for the message: `Started BackendApplication in X.XXX seconds`

### Step 2: Start the Frontend Server (In a new terminal)
```bash
cd c:\Users\menuw\Desktop\Blood\frontend
npm start
```

### Step 3: Register Your First Admin Account
1. Open your browser and go to: `http://localhost:3000/admin`
2. Click on the **"📝 Register"** tab
3. Fill in the registration form:
   - **Full Name:** Your Name
   - **Email:** your-email@example.com
   - **Password:** Your Strong Password (min 6 characters)
   - **Confirm Password:** Repeat your password
4. Click **"Register"** button
5. You should see: "Registration successful! Please login with your credentials."

### Step 4: Login
1. Click on the **"🔐 Login"** tab
2. Enter your email and password
3. Click **"Login"** button
4. You should be redirected to the Admin Dashboard

---

## Solution 2: Create Admin Account via API (For Developers)

If you prefer to use the API directly:

### Step 1: Start the Backend Server
```bash
cd c:\Users\menuw\Desktop\Blood\backend
.\mvnw.cmd spring-boot:run
```

### Step 2: Create Admin Account via PowerShell
```powershell
$body = @{
    fullName="Your Name"
    email="admin@example.com"
    password="YourPassword123"
    role="Admin"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8080/api/admin/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body `
  -UseBasicParsing
```

Expected response:
```json
{
  "message": "Admin created successfully",
  "admin": {
    "adminId": 1,
    "fullName": "Your Name",
    "email": "admin@example.com",
    "role": "Admin"
  }
}
```

### Step 3: Login via API
```powershell
$body = @{
    email="admin@example.com"
    password="YourPassword123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8080/api/admin/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body `
  -UseBasicParsing
```

Expected response:
```json
{
  "administratorId": 1,
  "fullName": "Your Name",
  "email": "admin@example.com",
  "message": "Login successful"
}
```

---

## Solution 3: Create Admin Account via Database (SQL)

If you have MySQL command line access:

```bash
mysql -u root -p2002 blood_donation_system
```

Then execute:
```sql
INSERT INTO admins (full_name, email, password, role, created_at) 
VALUES ('Your Name', 'admin@example.com', 'YourPassword123', 'Admin', NOW());
```

Then use the login page with:
- Email: `admin@example.com`
- Password: `YourPassword123`

---

## Troubleshooting

### Issue: "Email already exists"
**Solution:** Use a different email address that hasn't been registered yet.

### Issue: "Login failed. Admin not found"
**Solution:** 
1. Make sure the backend server is running
2. Verify the email address is correct
3. Check that the admin account was successfully registered

### Issue: "Invalid password"
**Solution:** Make sure you're using the exact password you set during registration. Passwords are case-sensitive.

### Issue: Backend won't start
**Solution:**
1. Make sure no other process is using port 8080
   ```bash
   netstat -ano | findstr :8080
   ```
2. Kill any Java processes:
   ```bash
   taskkill /F /IM java.exe
   ```
3. Try again:
   ```bash
   cd c:\Users\menuw\Desktop\Blood\backend
   .\mvnw.cmd spring-boot:run
   ```

### Issue: Frontend can't connect to backend
**Solution:**
1. Verify backend is running on port 8080
2. Check that the API URL in `frontend/src/services/api.js` is correct: `http://localhost:8080/api`
3. Make sure there are no firewall issues blocking the connection

---

## Test Credentials (For Quick Testing)

After you've successfully registered, here are the test credentials:

```
Email: admin@blood.com
Password: Admin@123
```

You can use these to quickly test the login flow.

---

## Admin Panel Features

Once logged in, you'll have access to:
- ✅ Admin Dashboard
- ✅ Manage Hospitals
- ✅ Manage Blood Camps
- ✅ Manage Blood Units
- ✅ View Appointments
- ✅ View Donor Records
- ✅ Manage Emergency Requests
- ✅ Manage Other Admins

---

## API Endpoints Reference

### Register Admin
- **URL:** `POST http://localhost:8080/api/admin/register`
- **Body:**
  ```json
  {
    "fullName": "Admin Name",
    "email": "admin@example.com",
    "password": "password123",
    "role": "Admin"
  }
  ```

### Login Admin
- **URL:** `POST http://localhost:8080/api/admin/login`
- **Body:**
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```

### Get All Admins
- **URL:** `GET http://localhost:8080/api/admin`

### Get Admin by ID
- **URL:** `GET http://localhost:8080/api/admin/1`

---

## Important Notes

1. **Password Security:** Keep your admin password secure and don't share it with others
2. **Email Verification:** Make sure you use a valid email address you have access to
3. **Database Backup:** Before making changes, consider backing up your database
4. **Port 8080:** Make sure no other application is using port 8080
5. **CORS:** The API is configured to accept requests from `http://localhost:3000`

---

If you still have issues, check the backend console for error messages and refer to the main README.md file for additional setup instructions.
