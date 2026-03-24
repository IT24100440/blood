package backend.Repository;

import backend.Model.BloodRequest;
import backend.Model.Hospital;
import backend.Model.BloodGroup;
import backend.Model.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {
    List<BloodRequest> findByHospital(Hospital hospital);
    List<BloodRequest> findByHospitalId(Long hospitalId);
    List<BloodRequest> findByStatus(RequestStatus status);
    List<BloodRequest> findByBloodGroup(BloodGroup bloodGroup);
    List<BloodRequest> findByHospitalIdAndStatus(Long hospitalId, RequestStatus status);
    List<BloodRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status);
}
