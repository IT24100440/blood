package backend.Controller;

import backend.Model.Admin;
import backend.Service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin({"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired
    private AdminService adminService;

    // Admin Login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Admin loginDetails) {
        Optional<Admin> admin = adminService.getAdminByEmail(loginDetails.getEmail());
        
        if (admin.isPresent()) {
            if (admin.get().getPassword().equals(loginDetails.getPassword())) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("adminId", admin.get().getAdminId());
                response.put("fullName", admin.get().getFullName());
                response.put("email", admin.get().getEmail());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid password"));
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Admin not found"));
        }
    }

    // Create New Admin
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Admin admin) {
        if (adminService.emailExists(admin.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email already exists"));
        }
        
        Admin createdAdmin = adminService.createAdmin(admin);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Admin created successfully");
        response.put("admin", createdAdmin);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get All Admins
    @GetMapping
    public ResponseEntity<List<Admin>> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }

    // Get Admin by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getAdminById(@PathVariable Long id) {
        Optional<Admin> admin = adminService.getAdminById(id);
        if (admin.isPresent()) {
            return ResponseEntity.ok(admin.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Admin not found"));
    }

    // Update Admin
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable Long id, @RequestBody Admin admin) {
        Admin updatedAdmin = adminService.updateAdmin(id, admin);
        if (updatedAdmin != null) {
            return ResponseEntity.ok(updatedAdmin);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Admin not found"));
    }

    // Delete Admin
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAdmin(@PathVariable Long id) {
        Optional<Admin> admin = adminService.getAdminById(id);
        if (admin.isPresent()) {
            adminService.deleteAdmin(id);
            return ResponseEntity.ok(Map.of("message", "Admin deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Admin not found"));
    }
}

