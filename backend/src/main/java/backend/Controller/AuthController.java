package backend.Controller;

import backend.Model.*;
import backend.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin({"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private DonorRepository donorRepository;
    
    @Autowired
    private HospitalRepository hospitalRepository;

    /**
     * User registration disabled - UserModel not available
     * Use role-specific registration endpoints instead
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, Object> registrationData) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
            .body(Map.of("message", "User registration via this endpoint is not available. Use role-specific registration endpoints."));
    }

    /**
     * User login disabled - UserModel not available
     * Use role-specific endpoints for authentication
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
            .body(Map.of("message", "Login via this endpoint is not available. Use role-specific login endpoints."));
    }
    
    /**
     * User profile retrieval disabled - UserModel not available
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
            .body(Map.of("message", "This endpoint is not available."));
    }
}

