package backend.Service;

import backend.Model.Donor;
import backend.Repository.DonorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DonorService {
    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private EligibilityService eligibilityService;

    public Donor createDonor(Donor donor) {
        // Calculate and set eligibility status
        String eligibilityStatus = eligibilityService.checkEligibility(donor);
        donor.setEligibilityStatus(eligibilityStatus);
        return donorRepository.save(donor);
    }

    public Optional<Donor> getDonorById(Long id) {
        return donorRepository.findById(id);
    }

    public Optional<Donor> getDonorByNic(String nic) {
        return donorRepository.findByNic(nic);
    }

    public List<Donor> getAllDonors() {
        return donorRepository.findAll();
    }

    public Donor updateDonor(Long id, Donor donor) {
        Optional<Donor> existingDonor = donorRepository.findById(id);
        if (existingDonor.isPresent()) {
            Donor donorToUpdate = existingDonor.get();
            donorToUpdate.setName(donor.getName());
            donorToUpdate.setEmail(donor.getEmail());
            donorToUpdate.setPhone(donor.getPhone());
            donorToUpdate.setAge(donor.getAge());
            donorToUpdate.setWeight(donor.getWeight());
            donorToUpdate.setBloodType(donor.getBloodType());
            donorToUpdate.setAddress(donor.getAddress());
            donorToUpdate.setCity(donor.getCity());
            donorToUpdate.setLastDonationDate(donor.getLastDonationDate());
            
            // Recalculate eligibility
            String eligibilityStatus = eligibilityService.checkEligibility(donorToUpdate);
            donorToUpdate.setEligibilityStatus(eligibilityStatus);
            
            return donorRepository.save(donorToUpdate);
        }
        return null;
    }

    public void deleteDonor(Long id) {
        donorRepository.deleteById(id);
    }

    public boolean nicExists(String nic) {
        return donorRepository.existsByNic(nic);
    }
}
