package backend.Controller;

import backend.Model.EmergencyRequest;
import backend.Model.Hospital;
import backend.Service.EmergencyRequestService;
import backend.Service.HospitalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@CrossOrigin({"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
@RequestMapping("/api/emergency-request")
public class EmergencyRequestController {
    @Autowired
    private EmergencyRequestService emergencyRequestService;

    @Autowired
    private HospitalService hospitalService;

    // Create Emergency Request
    @PostMapping
    public ResponseEntity<Map<String, Object>> createEmergencyRequest(@RequestBody Map<String, Object> requestData) {
        try {
            // Safe type conversion for hospitalId
            Object hospitalIdObj = requestData.get("hospitalId");
            Long hospitalId;
            if (hospitalIdObj instanceof String) {
                hospitalId = Long.parseLong((String) hospitalIdObj);
            } else if (hospitalIdObj instanceof Number) {
                hospitalId = ((Number) hospitalIdObj).longValue();
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid hospital ID format"));
            }

            Optional<Hospital> hospital = hospitalService.getHospitalById(hospitalId);

            if (!hospital.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Hospital not found"));
            }

            // Safe type conversion for requiredUnits
            Object unitsObj = requestData.get("requiredUnits");
            int requiredUnits;
            if (unitsObj instanceof String) {
                requiredUnits = Integer.parseInt((String) unitsObj);
            } else if (unitsObj instanceof Number) {
                requiredUnits = ((Number) unitsObj).intValue();
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid units format"));
            }

            EmergencyRequest request = new EmergencyRequest(
                    (String) requestData.get("title"),
                    (String) requestData.get("bloodTypeNeeded"),
                    requiredUnits,
                    hospital.get(),
                    (String) requestData.get("city"),
                    (String) requestData.get("urgencyLevel"),
                    (String) requestData.get("description"),
                    (String) requestData.get("contactNumber"),
                    LocalDate.parse((String) requestData.get("createdDate"))
            );

            // Create emergency request and send notifications to matching donors
            EmergencyRequestService.EmergencyRequestWithNotifications result = 
                    emergencyRequestService.createEmergencyRequestWithNotifications(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Emergency request created successfully");
            response.put("request", result.getRequest());
            response.put("notificationsSent", result.getNotificationCount());
            response.put("smsSent", result.getSmsSent());
            response.put("matchingDonors", result.getMatchingDonors());
            response.put("totalDonorsMatched", result.getMatchingDonors().size());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error creating emergency request: " + e.getMessage()));
        }
    }

    // Get All Emergency Requests
    @GetMapping
    public ResponseEntity<List<EmergencyRequest>> getAllEmergencyRequests() {
        return ResponseEntity.ok(emergencyRequestService.getAllEmergencyRequests());
    }

    // Get Emergency Request by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getEmergencyRequestById(@PathVariable Long id) {
        Optional<EmergencyRequest> request = emergencyRequestService.getEmergencyRequestById(id);
        if (request.isPresent()) {
            return ResponseEntity.ok(request.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Emergency request not found"));
    }

    // Get Emergency Requests by Hospital
    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<?> getEmergencyRequestsByHospital(@PathVariable Long hospitalId) {
        Optional<Hospital> hospital = hospitalService.getHospitalById(hospitalId);
        if (hospital.isPresent()) {
            return ResponseEntity.ok(emergencyRequestService.getEmergencyRequestsByHospital(hospital.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Hospital not found"));
    }

    // Get Emergency Requests by Blood Type
    @GetMapping("/blood-type/{bloodType}")
    public ResponseEntity<List<EmergencyRequest>> getEmergencyRequestsByBloodType(@PathVariable String bloodType) {
        return ResponseEntity.ok(emergencyRequestService.getEmergencyRequestsByBloodType(bloodType));
    }

    // Get Emergency Requests by City
    @GetMapping("/city/{city}")
    public ResponseEntity<List<EmergencyRequest>> getEmergencyRequestsByCity(@PathVariable String city) {
        return ResponseEntity.ok(emergencyRequestService.getEmergencyRequestsByCity(city));
    }

    // Update Emergency Request
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmergencyRequest(@PathVariable Long id, @RequestBody EmergencyRequest request) {
        EmergencyRequest updatedRequest = emergencyRequestService.updateEmergencyRequest(id, request);
        if (updatedRequest != null) {
            return ResponseEntity.ok(updatedRequest);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Emergency request not found"));
    }

    // Delete Emergency Request
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteEmergencyRequest(@PathVariable Long id) {
        Optional<EmergencyRequest> request = emergencyRequestService.getEmergencyRequestById(id);
        if (request.isPresent()) {
            emergencyRequestService.deleteEmergencyRequest(id);
            return ResponseEntity.ok(Map.of("message", "Emergency request deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Emergency request not found"));
    }
}

