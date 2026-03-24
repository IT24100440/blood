package backend.Service;

import backend.Model.CampBooking;
import backend.Model.BloodCamp;
import backend.Model.Donor;
import backend.Repository.CampBookingRepository;
import backend.Repository.BloodCampRepository;
import backend.Repository.DonorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CampBookingService {
    @Autowired
    private CampBookingRepository campBookingRepository;
    
    @Autowired
    private BloodCampRepository bloodCampRepository;
    
    @Autowired
    private DonorRepository donorRepository;
    
    @Autowired
    private AppointmentService appointmentService;

    public CampBooking createCampBooking(CampBooking booking) {
        return campBookingRepository.save(booking);
    }

    public List<CampBooking> getAllCampBookings() {
        return campBookingRepository.findAll();
    }

    public Optional<CampBooking> getCampBookingById(Long id) {
        return campBookingRepository.findById(id);
    }

    public List<CampBooking> getCampBookingsByCamp(Long campId) {
        Optional<BloodCamp> camp = bloodCampRepository.findById(campId);
        if (camp.isPresent()) {
            return campBookingRepository.findByCamp(camp.get());
        }
        return List.of();
    }

    public List<CampBooking> getCampBookingsByDonor(Long donorId) {
        Optional<Donor> donor = donorRepository.findById(donorId);
        if (donor.isPresent()) {
            return campBookingRepository.findByDonor(donor.get());
        }
        return List.of();
    }

    public Optional<CampBooking> checkDonorBooking(Long campId, Long donorId) {
        Optional<BloodCamp> camp = bloodCampRepository.findById(campId);
        Optional<Donor> donor = donorRepository.findById(donorId);
        if (camp.isPresent() && donor.isPresent()) {
            return campBookingRepository.findByCampAndDonor(camp.get(), donor.get());
        }
        return Optional.empty();
    }

    public long getRegisteredCount(Long campId) {
        Optional<BloodCamp> camp = bloodCampRepository.findById(campId);
        if (camp.isPresent()) {
            return campBookingRepository.countByCampAndStatus(camp.get(), "REGISTERED");
        }
        return 0;
    }

    public boolean checkAvailability(Long campId) {
        Optional<BloodCamp> camp = bloodCampRepository.findById(campId);
        if (camp.isPresent()) {
            long registered = getRegisteredCount(campId);
            return registered < camp.get().getMaxDonors();
        }
        return false;
    }

    public CampBooking updateCampBooking(Long id, CampBooking booking) {
        Optional<CampBooking> existing = campBookingRepository.findById(id);
        if (existing.isPresent()) {
            CampBooking updatedBooking = existing.get();
            updatedBooking.setStatus(booking.getStatus());
            updatedBooking.setAttendanceDate(booking.getAttendanceDate());
            CampBooking savedBooking = campBookingRepository.save(updatedBooking);
            
            // If the booking is marked as ATTENDED, complete any pending appointments for this donor
            if ("ATTENDED".equals(booking.getStatus())) {
                Donor donor = updatedBooking.getDonor();
                appointmentService.completePendingAppointmentsForDonor(donor);
            }
            
            return savedBooking;
        }
        return null;
    }

    public void deleteCampBooking(Long id) {
        campBookingRepository.deleteById(id);
    }
}
