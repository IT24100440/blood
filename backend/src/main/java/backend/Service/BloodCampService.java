package backend.Service;

import backend.Model.BloodCamp;
import backend.Model.Hospital;
import backend.Repository.BloodCampRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class BloodCampService {
    @Autowired
    private BloodCampRepository bloodCampRepository;

    public BloodCamp createBloodCamp(BloodCamp bloodCamp) {
        return bloodCampRepository.save(bloodCamp);
    }

    public Optional<BloodCamp> getBloodCampById(Long id) {
        return bloodCampRepository.findById(id);
    }

    public List<BloodCamp> getAllBloodCamps() {
        return bloodCampRepository.findAll();
    }

    public List<BloodCamp> getBloodCampsByHospital(Hospital hospital) {
        return bloodCampRepository.findByHospital(hospital);
    }

    public List<BloodCamp> getBloodCampsByDate(LocalDate date) {
        return bloodCampRepository.findByDate(date);
    }

    public BloodCamp updateBloodCamp(Long id, BloodCamp bloodCamp) {
        Optional<BloodCamp> existingCamp = bloodCampRepository.findById(id);
        if (existingCamp.isPresent()) {
            BloodCamp campToUpdate = existingCamp.get();
            campToUpdate.setTitle(bloodCamp.getTitle());
            campToUpdate.setDate(bloodCamp.getDate());
            campToUpdate.setTime(bloodCamp.getTime());
            campToUpdate.setLocation(bloodCamp.getLocation());
            campToUpdate.setDescription(bloodCamp.getDescription());
            campToUpdate.setMaxDonors(bloodCamp.getMaxDonors());
            return bloodCampRepository.save(campToUpdate);
        }
        return null;
    }

    public void deleteBloodCamp(Long id) {
        bloodCampRepository.deleteById(id);
    }
}
