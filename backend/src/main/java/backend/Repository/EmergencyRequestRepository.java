package backend.Repository;

import backend.Model.EmergencyRequest;
import backend.Model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyRequestRepository extends JpaRepository<EmergencyRequest, Long> {
    List<EmergencyRequest> findByHospital(Hospital hospital);
    List<EmergencyRequest> findByBloodTypeNeeded(String bloodTypeNeeded);
    List<EmergencyRequest> findByCity(String city);
}
