package backend.Controller;

import backend.Model.Hospital;
import backend.Service.HospitalService;
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
@RequestMapping("/api/hospital")
public class HospitalController {
    @Autowired
    private HospitalService hospitalService;

    // Create Hospital
    @PostMapping
    public ResponseEntity<Map<String, Object>> createHospital(@RequestBody Hospital hospital) {
        if (hospitalService.codeExists(hospital.getHospitalCode())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Hospital code already exists"));
        }
        
        Hospital createdHospital = hospitalService.createHospital(hospital);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Hospital created successfully");
        response.put("hospital", createdHospital);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get All Hospitals
    @GetMapping
    public ResponseEntity<List<Hospital>> getAllHospitals() {
        return ResponseEntity.ok(hospitalService.getAllHospitals());
    }

    // Get Hospital by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getHospitalById(@PathVariable Long id) {
        Optional<Hospital> hospital = hospitalService.getHospitalById(id);
        if (hospital.isPresent()) {
            return ResponseEntity.ok(hospital.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Hospital not found"));
    }

    // Get Hospital by Code
    @GetMapping("/code/{hospitalCode}")
    public ResponseEntity<?> getHospitalByCode(@PathVariable String hospitalCode) {
        Optional<Hospital> hospital = hospitalService.getHospitalByCode(hospitalCode);
        if (hospital.isPresent()) {
            return ResponseEntity.ok(hospital.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Hospital not found"));
    }

    // Update Hospital
    @PutMapping("/{id}")
    public ResponseEntity<?> updateHospital(@PathVariable Long id, @RequestBody Hospital hospital) {
        Hospital updatedHospital = hospitalService.updateHospital(id, hospital);
        if (updatedHospital != null) {
            return ResponseEntity.ok(updatedHospital);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Hospital not found"));
    }

    // Delete Hospital
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteHospital(@PathVariable Long id) {
        Optional<Hospital> hospital = hospitalService.getHospitalById(id);
        if (hospital.isPresent()) {
            hospitalService.deleteHospital(id);
            return ResponseEntity.ok(Map.of("message", "Hospital deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Hospital not found"));
    }
}

