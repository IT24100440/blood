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

    public List<Appointment> getAppointmentsByDonor(Donor donor) {
        return appointmentRepository.findByDonor(donor);
    }

    public List<Appointment> getAppointmentsByHospital(Hospital hospital) {
        return appointmentRepository.findByHospital(hospital);
    }

    public List<Appointment> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDate(date);
    }

    public List<Appointment> getAppointmentsByStatus(String status) {
        return appointmentRepository.findByStatus(status);
    }

    public List<Appointment> getPendingAppointmentsByDonor(Donor donor) {
        return appointmentRepository.findByDonorAndStatus(donor, "Pending");
    }

    public void completePendingAppointmentsForDonor(Donor donor) {
        // Find all pending appointments for this donor
        List<Appointment> pendingAppointments = getPendingAppointmentsByDonor(donor);
        
        // Mark all pending appointments as Completed
        for (Appointment appointment : pendingAppointments) {
            appointment.setStatus("Completed");
            appointmentRepository.save(appointment);
        }
    }

    public Appointment updateAppointment(Long id, Appointment appointment) {
        Optional<Appointment> existingAppointment = appointmentRepository.findById(id);
        if (existingAppointment.isPresent()) {
            Appointment appointmentToUpdate = existingAppointment.get();
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

    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }
}
