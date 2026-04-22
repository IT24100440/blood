package backend.Controller;

import backend.Model.Appointment;
import backend.Model.Donor;
import backend.Model.Hospital;
import backend.Service.AppointmentService;
import backend.Service.DonorService;
import backend.Service.HospitalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

//REST Controller for handling Appointment-related APIs
@RestController
@CrossOrigin({"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
@RequestMapping("/api/appointment")
public class AppointmentController {
    // Inject Appointment Service
    @Autowired
    private AppointmentService appointmentService;

    // Inject Donor Service
    @Autowired
    private DonorService donorService;

    // Inject Hospital Service
    @Autowired
    private HospitalService hospitalService;

    // Create Appointment
    @PostMapping
    public ResponseEntity<Map<String, Object>> createAppointment(@RequestBody Map<String, Object> appointmentData) {
        try {
            // Extract data from request body
            Long donorId = ((Number) appointmentData.get("donorId")).longValue();
            Long hospitalId = ((Number) appointmentData.get("hospitalId")).longValue();
            String timePeriod = (String) appointmentData.get("timePeriod");
            String bookingType = (String) appointmentData.get("bookingType");
            String eligibilityStatus = (String) appointmentData.get("eligibilityStatus");
            String appointmentDateStr = (String) appointmentData.get("appointmentDate");

            // Fetch donor and hospital from database
            Optional<Donor> donor = donorService.getDonorById(donorId);
            Optional<Hospital> hospital = hospitalService.getHospitalById(hospitalId);

            // Validate donor and hospital existence
            if (!donor.isPresent() || !hospital.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid donor or hospital"));
            }

            // Create new Appointment object
            Appointment appointment = new Appointment(
                    donor.get(),
                    hospital.get(),
                    LocalDate.parse(appointmentDateStr),
                    timePeriod,
                    bookingType,
                    eligibilityStatus
            );

            // Save appointment
            Appointment createdAppointment = appointmentService.createAppointment(appointment);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Appointment booked successfully");
            response.put("appointment", createdAppointment);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            // Handle errors
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error creating appointment: " + e.getMessage()));
        }
    }

    // Get All Appointments
    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    // Get Appointment by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long id) {
        Optional<Appointment> appointment = appointmentService.getAppointmentById(id);
        if (appointment.isPresent()) {
            return ResponseEntity.ok(appointment.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Appointment not found"));
    }

    // Get Appointments by Donor
    @GetMapping("/donor/{donorId}")
    public ResponseEntity<?> getAppointmentsByDonor(@PathVariable Long donorId) {
        Optional<Donor> donor = donorService.getDonorById(donorId);
        if (donor.isPresent()) {
            return ResponseEntity.ok(appointmentService.getAppointmentsByDonor(donor.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Donor not found"));
    }

    // Get Appointments by Hospital
    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<?> getAppointmentsByHospital(@PathVariable Long hospitalId) {
        Optional<Hospital> hospital = hospitalService.getHospitalById(hospitalId);
        if (hospital.isPresent()) {
            return ResponseEntity.ok(appointmentService.getAppointmentsByHospital(hospital.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Hospital not found"));
    }

    // Update Appointment
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(@PathVariable Long id, @RequestBody Appointment appointment) {
        Appointment updatedAppointment = appointmentService.updateAppointment(id, appointment);
        if (updatedAppointment != null) {
            return ResponseEntity.ok(updatedAppointment);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Appointment not found"));
    }

    // Get Pending Appointments
    @GetMapping("/status/pending")
    public ResponseEntity<List<Appointment>> getPendingAppointments() {
        return ResponseEntity.ok(appointmentService.getAppointmentsByStatus("Pending"));
    }

    // Approve Appointment
    @PutMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveAppointment(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try {
            Long adminId = ((Number) data.get("adminId")).longValue();
            Optional<Appointment> appointmentOpt = appointmentService.getAppointmentById(id);
            
            if (!appointmentOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Appointment not found"));
            }
            
            Appointment appointment = appointmentOpt.get();
            // Update appointment status
            appointment.setStatus("Approved");
            appointment.setApprovedBy(adminId);
            // Set approval time
            java.time.LocalDateTime approvalDateTime = java.time.LocalDateTime.now();
            appointment.setApprovedAt(approvalDateTime);
            
            // Update donor's last donation date to the approval date
            Donor donor = appointment.getDonor();
            donor.setLastDonationDate(approvalDateTime.toLocalDate());
            donorService.updateDonor(donor.getDonorId(), donor);
            
            Appointment updatedAppointment = appointmentService.updateAppointment(id, appointment);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Appointment approved successfully and donor's last donation date updated");
            response.put("appointment", updatedAppointment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error approving appointment: " + e.getMessage()));
        }
    }

    // Reject Appointment
    @PutMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectAppointment(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try {
            String rejectionReason = (String) data.get("rejectionReason");
            Long adminId = ((Number) data.get("adminId")).longValue();
            
            Optional<Appointment> appointmentOpt = appointmentService.getAppointmentById(id);
            if (!appointmentOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Appointment not found"));
            }
            
            Appointment appointment = appointmentOpt.get();

            // Set rejection details
            appointment.setStatus("Rejected");
            appointment.setRejectionReason(rejectionReason);
            appointment.setApprovedBy(adminId);
            appointment.setApprovedAt(java.time.LocalDateTime.now());
            
            Appointment updatedAppointment = appointmentService.updateAppointment(id, appointment);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Appointment rejected successfully");
            response.put("appointment", updatedAppointment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error rejecting appointment: " + e.getMessage()));
        }
    }

    // Mark Appointment as Completed
    //Updates donor eligibility and last donation date
    @PutMapping("/{id}/complete")
    public ResponseEntity<Map<String, Object>> completeAppointment(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try {
            Optional<Appointment> appointmentOpt = appointmentService.getAppointmentById(id);
            if (!appointmentOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Appointment not found"));
            }
            
            Appointment appointment = appointmentOpt.get();
            // Mark as completed
            appointment.setStatus("Completed");
            
            // Update donor's last donation date
            Donor donor = appointment.getDonor();
            donor.setLastDonationDate(java.time.LocalDate.now());
            donor.setEligibilityStatus("NOT_ELIGIBLE - 4 months waiting period active"); // They need to wait 4 months
            donorService.updateDonor(donor.getDonorId(), donor);
            
            Appointment updatedAppointment = appointmentService.updateAppointment(id, appointment);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Appointment marked as completed");
            response.put("appointment", updatedAppointment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error completing appointment: " + e.getMessage()));
        }
    }

    // Delete Appointment
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAppointment(@PathVariable Long id) {
        Optional<Appointment> appointment = appointmentService.getAppointmentById(id);
        if (appointment.isPresent()) {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.ok(Map.of("message", "Appointment deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Appointment not found"));
    }
}
