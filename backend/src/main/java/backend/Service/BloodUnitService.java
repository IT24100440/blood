package backend.Service;

import backend.Model.BloodUnit;
import backend.Model.Hospital;
import backend.Repository.BloodUnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BloodUnitService {
    @Autowired
    private BloodUnitRepository bloodUnitRepository;

    public BloodUnit createBloodUnit(BloodUnit bloodUnit) {
        return bloodUnitRepository.save(bloodUnit);
    }

    public Optional<BloodUnit> getBloodUnitById(Long id) {
        return bloodUnitRepository.findById(id);
    }

    public List<BloodUnit> getAllBloodUnits() {
        return bloodUnitRepository.findAll();
    }

    public List<BloodUnit> getBloodUnitsByHospital(Hospital hospital) {
        return bloodUnitRepository.findByHospital(hospital);
    }

    public List<BloodUnit> getBloodUnitsByBloodType(String bloodType) {
        return bloodUnitRepository.findByBloodType(bloodType);
    }

    public Optional<BloodUnit> getBloodUnitByHospitalAndBloodType(Hospital hospital, String bloodType) {
        return bloodUnitRepository.findByHospitalAndBloodType(hospital, bloodType);
    }

    public BloodUnit updateBloodUnit(Long id, BloodUnit bloodUnit) {
        Optional<BloodUnit> existingUnit = bloodUnitRepository.findById(id);
        if (existingUnit.isPresent()) {
            BloodUnit unitToUpdate = existingUnit.get();
            unitToUpdate.setBloodType(bloodUnit.getBloodType());
            unitToUpdate.setUnitsAvailable(bloodUnit.getUnitsAvailable());
            unitToUpdate.setUpdatedAt(LocalDateTime.now());
            return bloodUnitRepository.save(unitToUpdate);
        }
        return null;
    }

    public void deleteBloodUnit(Long id) {
        bloodUnitRepository.deleteById(id);
    }
}
