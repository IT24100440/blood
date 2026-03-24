package backend.Repository;

import backend.Model.BloodUnit;
import backend.Model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BloodUnitRepository extends JpaRepository<BloodUnit, Long> {
    List<BloodUnit> findByHospital(Hospital hospital);
    Optional<BloodUnit> findByHospitalAndBloodType(Hospital hospital, String bloodType);
    List<BloodUnit> findByBloodType(String bloodType);
}
