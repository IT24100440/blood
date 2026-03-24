package backend.Repository;

import backend.Model.Appointment;
import backend.Model.Donor;
import backend.Model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDonor(Donor donor);
    List<Appointment> findByHospital(Hospital hospital);
    List<Appointment> findByAppointmentDate(LocalDate appointmentDate);
    List<Appointment> findByStatus(String status);
    List<Appointment> findByDonorAndStatus(Donor donor, String status);
}
