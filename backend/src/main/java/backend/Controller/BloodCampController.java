package backend.Controller;

import backend.Model.BloodCamp;
import backend.Model.Hospital;
import backend.Service.BloodCampService;
import backend.Service.HospitalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin({"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
@RequestMapping("/api/blood-camp")
public class BloodCampController {
    @Autowired
    private BloodCampService bloodCampService;

    @Autowired
    private HospitalService hospitalService;

    // Create Blood Camp
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBloodCamp(@RequestBody Map<String, Object> campData) {
        try {
            // Convert hospitalId - handle both String and Number types
            long hospitalId;
            Object hospitalIdObj = campData.get("hospitalId");
            if (hospitalIdObj instanceof String) {
                hospitalId = Long.parseLong((String) hospitalIdObj);
            } else if (hospitalIdObj instanceof Number) {
                hospitalId = ((Number) hospitalIdObj).longValue();
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid hospitalId format"));
            }

            Optional<Hospital> hospital = hospitalService.getHospitalById(hospitalId);

            if (!hospital.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Hospital not found"));
            }

            // Convert maxDonors - handle both String and Number types
            int maxDonors;
            Object maxDonorsObj = campData.get("maxDonors");
            if (maxDonorsObj instanceof String) {
                maxDonors = Integer.parseInt((String) maxDonorsObj);
            } else if (maxDonorsObj instanceof Number) {
                maxDonors = ((Number) maxDonorsObj).intValue();
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid maxDonors format"));
            }

            BloodCamp camp = new BloodCamp(
                    (String) campData.get("title"),
                    LocalDate.parse((String) campData.get("date")),
                    LocalTime.parse((String) campData.get("time")),
                    (String) campData.get("location"),
                    hospital.get(),
                    (String) campData.get("description"),
                    maxDonors
            );

            BloodCamp createdCamp = bloodCampService.createBloodCamp(camp);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Blood camp created successfully");
            response.put("camp", createdCamp);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error creating blood camp: " + e.getMessage()));
        }
    }

    // Get All Blood Camps
    @GetMapping
    public ResponseEntity<List<BloodCamp>> getAllBloodCamps() {
        return ResponseEntity.ok(bloodCampService.getAllBloodCamps());
    }

    

    // Update Blood Camp
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBloodCamp(@PathVariable Long id, @RequestBody BloodCamp camp) {
        BloodCamp updatedCamp = bloodCampService.updateBloodCamp(id, camp);
        if (updatedCamp != null) {
            return ResponseEntity.ok(updatedCamp);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Blood camp not found"));
    }

    // Delete Blood Camp
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBloodCamp(@PathVariable Long id) {
        Optional<BloodCamp> camp = bloodCampService.getBloodCampById(id);
        if (camp.isPresent()) {
            bloodCampService.deleteBloodCamp(id);
            return ResponseEntity.ok(Map.of("message", "Blood camp deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Blood camp not found"));
    }
}

