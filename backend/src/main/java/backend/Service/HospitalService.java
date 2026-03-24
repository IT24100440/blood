package backend.Service;

import backend.Model.Hospital;
import backend.Repository.HospitalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HospitalService {
    @Autowired
    private HospitalRepository hospitalRepository;

    public Hospital createHospital(Hospital hospital) {
        return hospitalRepository.save(hospital);
    }

    public Optional<Hospital> getHospitalById(Long id) {
        return hospitalRepository.findById(id);
    }

    public List<Hospital> getAllHospitals() {
        return hospitalRepository.findAll();
    }

    public Hospital updateHospital(Long id, Hospital hospital) {
        Optional<Hospital> existingHospital = hospitalRepository.findById(id);
        if (existingHospital.isPresent()) {
            Hospital hospitalToUpdate = existingHospital.get();
            hospitalToUpdate.setHospitalName(hospital.getHospitalName());
            hospitalToUpdate.setHospitalCode(hospital.getHospitalCode());
            hospitalToUpdate.setAddress(hospital.getAddress());
            hospitalToUpdate.setCity(hospital.getCity());
            hospitalToUpdate.setPhone(hospital.getPhone());
            hospitalToUpdate.setEmail(hospital.getEmail());
            hospitalToUpdate.setTimePeriod(hospital.getTimePeriod());
            hospitalToUpdate.setStatus(hospital.getStatus());
            return hospitalRepository.save(hospitalToUpdate);
        }
        return null;
    }

    public void deleteHospital(Long id) {
        hospitalRepository.deleteById(id);
    }

    public Optional<Hospital> getHospitalByCode(String hospitalCode) {
        return hospitalRepository.findByHospitalCode(hospitalCode);
    }

    public boolean codeExists(String hospitalCode) {
        return hospitalRepository.existsByHospitalCode(hospitalCode);
    }
}
