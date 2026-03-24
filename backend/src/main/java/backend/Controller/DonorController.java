package backend.Controller;

import backend.Model.Donor;
import backend.Service.DonorService;
import backend.Service.EligibilityService;
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
@RequestMapping("/api/donor")
public class DonorController {
    @Autowired
    private DonorService donorService;

    @Autowired
    private EligibilityService eligibilityService;

    // Create Donor
    @PostMapping
    public ResponseEntity<Map<String, Object>> createDonor(@RequestBody Donor donor) {
        if (donorService.nicExists(donor.getNic())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Donor with this NIC already exists"));
        }
        
        Donor createdDonor = donorService.createDonor(donor);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Donor registered successfully");
        response.put("donor", createdDonor);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get Donor by NIC
    @GetMapping("/nic/{nic}")
    public ResponseEntity<?> getDonorByNic(@PathVariable String nic) {
        Optional<Donor> donor = donorService.getDonorByNic(nic);
        if (donor.isPresent()) {
            return ResponseEntity.ok(donor.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Donor not found"));
    }

    // Get All Donors
    @GetMapping
    public ResponseEntity<List<Donor>> getAllDonors() {
        return ResponseEntity.ok(donorService.getAllDonors());
    }

    // Get Donor by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getDonorById(@PathVariable Long id) {
        Optional<Donor> donor = donorService.getDonorById(id);
        if (donor.isPresent()) {
            return ResponseEntity.ok(donor.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Donor not found"));
    }

    // Check Eligibility
    @PostMapping("/{id}/check-eligibility")
    public ResponseEntity<Map<String, Object>> checkEligibility(@PathVariable Long id) {
        Optional<Donor> donor = donorService.getDonorById(id);
        if (donor.isPresent()) {
            String eligibilityStatus = eligibilityService.checkEligibility(donor.get());
            String detailedMessage = eligibilityService.getDetailedEligibilityMessage(donor.get());
            
            Map<String, Object> response = new HashMap<>();
            response.put("eligibilityStatus", eligibilityStatus);
            response.put("message", detailedMessage);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Donor not found"));
    }

    // Update Donor
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDonor(@PathVariable Long id, @RequestBody Donor donor) {
        Donor updatedDonor = donorService.updateDonor(id, donor);
        if (updatedDonor != null) {
            return ResponseEntity.ok(updatedDonor);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Donor not found"));
    }

    // Delete Donor
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteDonor(@PathVariable Long id) {
        Optional<Donor> donor = donorService.getDonorById(id);
        if (donor.isPresent()) {
            donorService.deleteDonor(id);
            return ResponseEntity.ok(Map.of("message", "Donor deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Donor not found"));
    }
}

