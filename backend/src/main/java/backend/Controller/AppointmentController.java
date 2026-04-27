package backend.Controller;

import backend.Model.Appointment;
import backend.Model.Donor;
import backend.Model.Hospital;
import backend.Service.AppointmentService;
import backend.Service.DonorService;
import backend.Service.HospitalService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// REST Controller
@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final DonorService donorService;
    private final HospitalService hospitalService;

    // Constructor Injection (BEST PRACTICE)
    public AppointmentController(AppointmentService appointmentService,
                                 DonorService donorService,
                                 HospitalService hospitalService) {
        this.appointmentService = appointmentService;
        this.donorService = donorService;
        this.hospitalService = hospitalService;
    }

    // ================= CREATE =================
    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody AppointmentRequest request) {

        Optional<Donor> donorOpt = donorService.getDonorById(request.getDonorId());
        Optional<Hospital> hospitalOpt = hospitalService.getHospitalById(request.getHospitalId());

        if (donorOpt.isEmpty() || hospitalOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid donor or hospital");
        }

        Appointment appointment = new Appointment(
                donorOpt.get(),
                hospitalOpt.get(),
                LocalDate.parse(request.getAppointmentDate()),
                request.getTimePeriod(),
                request.getBookingType(),
                request.getEligibilityStatus()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointmentService.createAppointment(appointment));
    }

    // ================= READ =================
    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return appointmentService.getAppointmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Appointment not found"));
    }

    @GetMapping("/donor/{donorId}")
    public ResponseEntity<?> getByDonor(@PathVariable Long donorId) {
        return donorService.getDonorById(donorId)
                .map(donor -> ResponseEntity.ok(
                        appointmentService.getAppointmentsByDonor(donor)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Donor not found"));
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<?> getByHospital(@PathVariable Long hospitalId) {
        return hospitalService.getHospitalById(hospitalId)
                .map(hospital -> ResponseEntity.ok(
                        appointmentService.getAppointmentsByHospital(hospital)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Hospital not found"));
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                   @RequestBody Appointment appointment) {

        Appointment updated = appointmentService.updateAppointment(id, appointment);

        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Appointment not found");
        }

        return ResponseEntity.ok(updated);
    }

    // ================= STATUS OPERATIONS =================
    @GetMapping("/status/pending")
    public List<Appointment> getPending() {
        return appointmentService.getAppointmentsByStatus("Pending");
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id,
                                     @RequestBody AdminRequest request) {

        Optional<Appointment> opt = appointmentService.getAppointmentById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Appointment appointment = opt.get();

        appointment.setStatus("Approved");
        appointment.setApprovedBy(request.getAdminId());
        appointment.setApprovedAt(LocalDateTime.now());

        // Update donor
        Donor donor = appointment.getDonor();
        donor.setLastDonationDate(LocalDate.now());
        donorService.updateDonor(donor.getDonorId(), donor);

        return ResponseEntity.ok(appointmentService.updateAppointment(id, appointment));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id,
                                    @RequestBody RejectRequest request) {

        Optional<Appointment> opt = appointmentService.getAppointmentById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Appointment appointment = opt.get();

        appointment.setStatus("Rejected");
        appointment.setRejectionReason(request.getReason());
        appointment.setApprovedBy(request.getAdminId());
        appointment.setApprovedAt(LocalDateTime.now());

        return ResponseEntity.ok(appointmentService.updateAppointment(id, appointment));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable Long id) {

        Optional<Appointment> opt = appointmentService.getAppointmentById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Appointment appointment = opt.get();
        appointment.setStatus("Completed");

        Donor donor = appointment.getDonor();
        donor.setLastDonationDate(LocalDate.now());
        donor.setEligibilityStatus("NOT_ELIGIBLE - 4 months waiting");

        donorService.updateDonor(donor.getDonorId(), donor);

        return ResponseEntity.ok(appointmentService.updateAppointment(id, appointment));
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (appointmentService.getAppointmentById(id).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Appointment not found");
        }

        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}
