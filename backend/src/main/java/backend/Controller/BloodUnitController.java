package backend.Controller;

import backend.Model.BloodUnit;
import backend.Model.Hospital;
import backend.Service.BloodUnitService;
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
@RequestMapping("/api/blood-unit")
public class BloodUnitController {
    @Autowired
    private BloodUnitService bloodUnitService;

    @Autowired
    private HospitalService hospitalService;

    // CREATE (Add a new blood unit)
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBloodUnit(@RequestBody Map<String, Object> unitData) {
        try {
            // Convert hospitalId safely
            Long hospitalId;
            Object hospitalIdObj = unitData.get("hospitalId");
            if (hospitalIdObj instanceof String) {
                hospitalId = Long.parseLong((String) hospitalIdObj);
            } else {
                hospitalId = ((Number) hospitalIdObj).longValue();
            }

            // Convert unitsAvailable safely
            Integer unitsAvailable;
            Object unitsObj = unitData.get("unitsAvailable");
            if (unitsObj instanceof String) {
                unitsAvailable = Integer.parseInt((String) unitsObj);
            } else {
                unitsAvailable = ((Number) unitsObj).intValue();
            }

            Optional<Hospital> hospital = hospitalService.getHospitalById(hospitalId);

            if (!hospital.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Hospital not found"));
            }

            BloodUnit unit = new BloodUnit(
                    hospital.get(),
                    (String) unitData.get("bloodType"),
                    unitsAvailable
            );

            BloodUnit createdUnit = bloodUnitService.createBloodUnit(unit);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Blood unit created successfully");
            response.put("unit", createdUnit);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid number format: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error creating blood unit: " + e.getMessage()));
        }
    }

    // // Get ALL Blood Units
    @GetMapping
    public ResponseEntity<List<BloodUnit>> getAllBloodUnits() {
        return ResponseEntity.ok(bloodUnitService.getAllBloodUnits());
    }

    // Get Blood Unit by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getBloodUnitById(@PathVariable Long id) {
        Optional<BloodUnit> unit = bloodUnitService.getBloodUnitById(id);
        if (unit.isPresent()) {
            return ResponseEntity.ok(unit.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Blood unit not found"));
    }

    // Get Blood Units by Hospitals
    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<?> getBloodUnitsByHospital(@PathVariable Long hospitalId) {
        Optional<Hospital> hospital = hospitalService.getHospitalById(hospitalId);
        if (hospital.isPresent()) {
            return ResponseEntity.ok(bloodUnitService.getBloodUnitsByHospital(hospital.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Hospital not found"));
    }

    // Get Blood Units and blood types
    @GetMapping("/blood-type/{bloodType}")
    public ResponseEntity<List<BloodUnit>> getBloodUnitsByBloodType(@PathVariable String bloodType) {
        return ResponseEntity.ok(bloodUnitService.getBloodUnitsByBloodType(bloodType));
    }

    // Update Blood Units
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBloodUnit(@PathVariable Long id, @RequestBody Map<String, Object> unitData) {
        try {
            Optional<BloodUnit> existing = bloodUnitService.getBloodUnitById(id);
            if (!existing.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Blood unit not found"));
            }

            BloodUnit unit = existing.get();
            
            // Update blood type if provided
            if (unitData.get("bloodType") != null) {
                unit.setBloodType((String) unitData.get("bloodType"));
            }
            
            // Update units available if provided
            if (unitData.get("unitsAvailable") != null) {
                Integer unitsAvailable;
                Object unitsObj = unitData.get("unitsAvailable");
                if (unitsObj instanceof String) {
                    unitsAvailable = Integer.parseInt((String) unitsObj);
                } else {
                    unitsAvailable = ((Number) unitsObj).intValue();
                }
                unit.setUnitsAvailable(unitsAvailable);
            }
            
            BloodUnit updatedUnit = bloodUnitService.updateBloodUnit(id, unit);
            return ResponseEntity.ok(updatedUnit);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid number format: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error updating blood unit: " + e.getMessage()));
        }
    }

    // Delete Blood Unit
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBloodUnit(@PathVariable Long id) {
        Optional<BloodUnit> unit = bloodUnitService.getBloodUnitById(id);
        if (unit.isPresent()) {
            bloodUnitService.deleteBloodUnit(id);
            return ResponseEntity.ok(Map.of("message", "Blood unit deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Blood unit not found"));
    }
}

