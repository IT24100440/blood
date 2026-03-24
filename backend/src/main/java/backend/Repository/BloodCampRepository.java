package backend.Repository;

import backend.Model.BloodCamp;
import backend.Model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BloodCampRepository extends JpaRepository<BloodCamp, Long> {
    List<BloodCamp> findByHospital(Hospital hospital);
    List<BloodCamp> findByDate(LocalDate date);
}
