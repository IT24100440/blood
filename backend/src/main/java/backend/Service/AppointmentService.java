package backend.Service;

import backend.Model.Appointment;
import backend.Model.Donor;
import backend.Model.Hospital;
import backend.Repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {
    @Autowired
    private AppointmentRepository appointmentRepository; // Injecting AppointmentRepository dependency

    // Create and save a new appointment
    public Appointment createAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    // Get a single appointment by its ID
    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }

    // Get all appointments from the database
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // Get all appointments for a specific donor
    public List<Appointment> getAppointmentsByDonor(Donor donor) {
        return appointmentRepository.findByDonor(donor);
    }

    // Get all appointments for a specific hospital
    public List<Appointment> getAppointmentsByHospital(Hospital hospital) {
        return appointmentRepository.findByHospital(hospital);
    }

    // Get all appointments for a specific date
    public List<Appointment> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDate(date);
    }

    // Get all appointments by status (e.g., Pending, Completed, Approved)
    public List<Appointment> getAppointmentsByStatus(String status) {
        return appointmentRepository.findByStatus(status);
    }

    // Get all pending appointments for a specific donor
    public List<Appointment> getPendingAppointmentsByDonor(Donor donor) {
        return appointmentRepository.findByDonorAndStatus(donor, "Pending");
    }

    // Mark all pending appointments of a donor as "Completed"
    public void completePendingAppointmentsForDonor(Donor donor) {
        // Find all pending appointments for this donor
        List<Appointment> pendingAppointments = getPendingAppointmentsByDonor(donor);
        
        // Mark all pending appointments as Completed
        for (Appointment appointment : pendingAppointments) {
            appointment.setStatus("Completed");
            appointmentRepository.save(appointment);
        }
    }

    // Update an existing appointment by ID
    public Appointment updateAppointment(Long id, Appointment appointment) {
        Optional<Appointment> existingAppointment = appointmentRepository.findById(id);
        // Check if appointment exists in database
        if (existingAppointment.isPresent()) {
            Appointment appointmentToUpdate = existingAppointment.get();

            // Update fields with new values
            appointmentToUpdate.setAppointmentDate(appointment.getAppointmentDate());
            appointmentToUpdate.setTimePeriod(appointment.getTimePeriod());
            appointmentToUpdate.setBookingType(appointment.getBookingType());
            appointmentToUpdate.setEligibilityStatus(appointment.getEligibilityStatus());
            appointmentToUpdate.setCamp(appointment.getCamp());
            appointmentToUpdate.setStatus(appointment.getStatus());
            appointmentToUpdate.setRejectionReason(appointment.getRejectionReason());
            appointmentToUpdate.setApprovedBy(appointment.getApprovedBy());
            appointmentToUpdate.setApprovedAt(appointment.getApprovedAt());
            return appointmentRepository.save(appointmentToUpdate);
        }
        return null;
    }

    // Delete an appointment by ID
    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }
}

