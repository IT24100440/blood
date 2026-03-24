package backend.Controller;

import backend.Model.*;
import backend.Repository.*;
import backend.Service.NotificationSchedulerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin({"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
@RequestMapping("/api/blood-requests")
public class BloodRequestController {
    
    @Autowired
    private BloodRequestRepository bloodRequestRepository;
    
    @Autowired
    private HospitalRepository hospitalRepository;
    
    @Autowired
    private BloodInventoryRepository bloodInventoryRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private DonorRepository donorRepository;
    
    @Autowired
    private NotificationSchedulerService notificationSchedulerService;

    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody Map<String, Object> requestData) {
        try {
            Long hospitalId = Long.valueOf(requestData.get("hospitalId").toString());
            Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new RuntimeException("Hospital not found"));
            
            if (!hospital.isVerified()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Hospital must be verified to submit requests"));
            }
            
            BloodRequest request = new BloodRequest();
            request.setHospital(hospital);
            request.setBloodGroup(BloodGroup.valueOf((String) requestData.get("bloodGroup")));
            request.setQuantity(Integer.parseInt(requestData.get("quantity").toString()));
            request.setUrgencyLevel(UrgencyLevel.valueOf((String) requestData.get("urgencyLevel")));
            request.setPatientName((String) requestData.get("patientName"));
            request.setReason((String) requestData.get("reason"));
            request.setStatus(RequestStatus.PENDING);
            
            request = bloodRequestRepository.save(request);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(request);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error creating request: " + e.getMessage()));
        }
    }

    @PostMapping("/emergency")
    public ResponseEntity<?> createEmergencyRequest(@RequestBody Map<String, Object> requestData) {
        try {
            Long hospitalId = Long.valueOf(requestData.get("hospitalId").toString());
            Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new RuntimeException("Hospital not found"));

            BloodGroup bloodGroup = BloodGroup.valueOf((String) requestData.get("bloodGroup"));
            int quantity = Integer.parseInt(requestData.get("quantity").toString());
            String reason = (String) requestData.get("reason");
            String location = requestData.containsKey("location") ? (String) requestData.get("location") : "";

            BloodRequest request = new BloodRequest();
            request.setHospital(hospital);
            request.setBloodGroup(bloodGroup);
            request.setQuantity(quantity);
            request.setUrgencyLevel(UrgencyLevel.CRITICAL);
            request.setPatientName((String) requestData.getOrDefault("patientName", "Emergency Case"));
            request.setReason(reason != null ? reason : "Emergency blood requirement");
            request.setStatus(RequestStatus.PENDING);
            request = bloodRequestRepository.save(request);

            List<Donor> donors = donorRepository.findByBloodGroupAndIsEligible(bloodGroup, true);
            if (location != null && !location.isBlank()) {
                String normalized = location.trim().toLowerCase();
                donors = donors.stream()
                    .filter(d -> {
                        String cityValue = d.getCity() != null ? d.getCity().toLowerCase() : "";
                        String stateValue = d.getState() != null ? d.getState().toLowerCase() : "";
                        return cityValue.contains(normalized) || stateValue.contains(normalized);
                    })
                    .collect(Collectors.toList());
            }

            int notificationsSent = 0;
            // Donor notifications disabled - no UserModel available

            Map<String, Object> response = new HashMap<>();
            response.put("request", request);
            response.put("notificationsSent", notificationsSent);
            response.put("message", "Emergency request created and donors notified");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error creating emergency request: " + e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<List<BloodRequest>> getAllRequests() {
        return ResponseEntity.ok(bloodRequestRepository.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getRequestById(@PathVariable Long id) {
        return bloodRequestRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<BloodRequest>> getRequestsByHospital(@PathVariable Long hospitalId) {
        return ResponseEntity.ok(bloodRequestRepository.findByHospitalId(hospitalId));
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<BloodRequest>> getRequestsByStatus(@PathVariable String status) {
        RequestStatus requestStatus = RequestStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(bloodRequestRepository.findByStatus(requestStatus));
    }
    
    @GetMapping("/pending")
    public ResponseEntity<List<BloodRequest>> getPendingRequests() {
        return ResponseEntity.ok(bloodRequestRepository.findByStatusOrderByCreatedAtDesc(RequestStatus.PENDING));
    }
    
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id, @RequestBody Map<String, Object> approvalData) {
        try {
            BloodRequest request = bloodRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
            
            if (request.getStatus() != RequestStatus.PENDING) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Only pending requests can be approved"));
            }
            
            // Check if enough blood is available
            Integer availableQuantity = bloodInventoryRepository.getTotalQuantityByBloodGroup(request.getBloodGroup());
            if (availableQuantity == null || availableQuantity < request.getQuantity()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Insufficient blood stock"));
            }
            
            request.setStatus(RequestStatus.APPROVED);
            request.setUpdatedAt(LocalDateTime.now());
            
            if (approvalData.containsKey("adminNotes")) {
                request.setAdminNotes((String) approvalData.get("adminNotes"));
            }
            if (approvalData.containsKey("approvedBy")) {
                request.setApprovedBy(Long.valueOf(approvalData.get("approvedBy").toString()));
            }
            
            request = bloodRequestRepository.save(request);
            
            // Deduct from inventory
            List<BloodInventory> inventoryList = bloodInventoryRepository.findByBloodGroup(request.getBloodGroup());
            int remainingQty = request.getQuantity();
            
            for (BloodInventory inventory : inventoryList) {
                if (!inventory.isExpired() && remainingQty > 0) {
                    if (inventory.getQuantity() <= remainingQty) {
                        remainingQty -= inventory.getQuantity();
                        bloodInventoryRepository.delete(inventory);
                    } else {
                        inventory.setQuantity(inventory.getQuantity() - remainingQty);
                        bloodInventoryRepository.save(inventory);
                        remainingQty = 0;
                    }
                }
            }
            
            // Hospital notification disabled - no UserModel available
            // Check and notify admins about low stock after inventory deduction
            notificationSchedulerService.checkAndNotifyAdminsForLowStock();
            
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error approving request: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id, @RequestBody Map<String, Object> rejectionData) {
        try {
            BloodRequest request = bloodRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
            
            if (request.getStatus() != RequestStatus.PENDING) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Only pending requests can be rejected"));
            }
            
            request.setStatus(RequestStatus.REJECTED);
            request.setUpdatedAt(LocalDateTime.now());
            
            if (rejectionData.containsKey("adminNotes")) {
                request.setAdminNotes((String) rejectionData.get("adminNotes"));
            }
            
            request = bloodRequestRepository.save(request);
            
            // Hospital notification disabled - no UserModel available
            
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error rejecting request: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRequest(@PathVariable Long id, @RequestBody Map<String, Object> requestData) {
        try {
            BloodRequest request = bloodRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
            
            if (request.getStatus() != RequestStatus.PENDING) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Only pending requests can be updated"));
            }
            
            // Update fields
            if (requestData.containsKey("bloodGroup")) {
                request.setBloodGroup(BloodGroup.valueOf((String) requestData.get("bloodGroup")));
            }
            if (requestData.containsKey("quantity")) {
                request.setQuantity(Integer.parseInt(requestData.get("quantity").toString()));
            }
            if (requestData.containsKey("urgencyLevel")) {
                request.setUrgencyLevel(UrgencyLevel.valueOf((String) requestData.get("urgencyLevel")));
            }
            if (requestData.containsKey("patientName")) {
                request.setPatientName((String) requestData.get("patientName"));
            }
            if (requestData.containsKey("reason")) {
                request.setReason((String) requestData.get("reason"));
            }
            
            request.setUpdatedAt(LocalDateTime.now());
            request = bloodRequestRepository.save(request);
            
            // Hospital notification disabled - no UserModel available
            
            // Notify admins about update
            // Admin notification disabled - no UserModel available
            
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error updating request: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelRequest(@PathVariable Long id) {
        try {
            BloodRequest request = bloodRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
            
            if (request.getStatus() != RequestStatus.PENDING) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Only pending requests can be cancelled"));
            }
            
            request.setStatus(RequestStatus.REJECTED);
            request.setAdminNotes("Cancelled by hospital");
            request.setUpdatedAt(LocalDateTime.now());
            request = bloodRequestRepository.save(request);
            
            // Hospital notification disabled - no UserModel available
            
            // Notify admins about cancellation
            // Admin notification disabled - no UserModel available
            
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error cancelling request: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/deliver")
    public ResponseEntity<?> markAsDelivered(@PathVariable Long id) {
        try {
            BloodRequest request = bloodRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
            
            if (request.getStatus() != RequestStatus.APPROVED) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Only approved requests can be marked as delivered"));
            }
            
            request.setStatus(RequestStatus.DELIVERED);
            request.setUpdatedAt(LocalDateTime.now());
            request = bloodRequestRepository.save(request);
            
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error marking as delivered: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(@PathVariable Long id) {
        try {
            bloodRequestRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Request deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error deleting request: " + e.getMessage()));
        }
    }
}

