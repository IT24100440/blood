package backend.Repository;

import backend.Model.BloodGroup;
import backend.Model.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonorRepository extends JpaRepository<Donor, Long> {
    Optional<Donor> findByNic(String nic);
    boolean existsByNic(String nic);
    List<Donor> findByBloodType(String bloodType);
    List<Donor> findByBloodGroupAndIsEligible(BloodGroup bloodGroup, boolean eligible);
}
