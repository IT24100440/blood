package backend.Repository;

import backend.Model.CampBooking;
import backend.Model.BloodCamp;
import backend.Model.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampBookingRepository extends JpaRepository<CampBooking, Long> {
    List<CampBooking> findByCamp(BloodCamp camp);
    List<CampBooking> findByDonor(Donor donor);
    Optional<CampBooking> findByCampAndDonor(BloodCamp camp, Donor donor);
    List<CampBooking> findByCampAndStatus(BloodCamp camp, String status);
    long countByCampAndStatus(BloodCamp camp, String status);
}
