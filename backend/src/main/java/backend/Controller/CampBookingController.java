package backend.Controller;

import backend.Model.CampBooking;
import backend.Model.BloodCamp;
import backend.Model.Donor;
import backend.Service.CampBookingService;
import backend.Service.BloodCampService;
import backend.Service.DonorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin({"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
@RequestMapping("/api/camp-booking")
public class CampBookingController {
    @Autowired
    private CampBookingService campBookingService;
    
    @Autowired
    private BloodCampService bloodCampService;
    
    @Autowired
    private DonorService donorService;

    // Book a blood camp
    @PostMapping
    public ResponseEntity<Map<String, Object>> bookCamp(@RequestBody Map<String, Object> bookingData) {
        try {
            // Get camp and donor
            long campId = Long.parseLong(bookingData.get("campId").toString());
            long donorId = Long.parseLong(bookingData.get("donorId").toString());
            
            Optional<BloodCamp> campOpt = bloodCampService.getBloodCampById(campId);
            Optional<Donor> donorOpt = donorService.getDonorById(donorId);
            
            if (!campOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Blood camp not found"));
            }
            if (!donorOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Donor not found"));
            }
            
            BloodCamp camp = campOpt.get();
            Donor donor = donorOpt.get();
            
            // Check if donor already booked
            Optional<CampBooking> existingBooking = campBookingService.checkDonorBooking(campId, donorId);
            if (existingBooking.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "You have already booked this camp"));
            }
            
            // Check availability
            if (!campBookingService.checkAvailability(campId)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Camp is full. Maximum donors reached."));
            }
            
            // Create booking
            CampBooking booking = new CampBooking(camp, donor, "REGISTERED");
            CampBooking createdBooking = campBookingService.createCampBooking(booking);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Camp booking successful!");
            response.put("booking", createdBooking);
            response.put("remainingSlots", camp.getMaxDonors() - (campBookingService.getRegisteredCount(campId) + 1));
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error booking camp: " + e.getMessage()));
        }
    }

    // Get all camp bookings
    @GetMapping
    public ResponseEntity<List<CampBooking>> getAllCampBookings() {
        return ResponseEntity.ok(campBookingService.getAllCampBookings());
    }

    // Get camp booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getCampBookingById(@PathVariable Long id) {
        Optional<CampBooking> booking = campBookingService.getCampBookingById(id);
        if (booking.isPresent()) {
            return ResponseEntity.ok(booking.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Booking not found"));
    }

    // Get bookings for a specific camp
    @GetMapping("/camp/{campId}")
    public ResponseEntity<Map<String, Object>> getCampBookings(@PathVariable Long campId) {
        Optional<BloodCamp> camp = bloodCampService.getBloodCampById(campId);
        if (!camp.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Camp not found"));
        }
        
        List<CampBooking> bookings = campBookingService.getCampBookingsByCamp(campId);
        long registered = campBookingService.getRegisteredCount(campId);
        long remaining = camp.get().getMaxDonors() - registered;
        
        Map<String, Object> response = new HashMap<>();
        response.put("camp", camp.get());
        response.put("bookings", bookings);
        response.put("registeredDonors", registered);
        response.put("remainingSlots", remaining);
        response.put("isFull", remaining <= 0);
        
        return ResponseEntity.ok(response);
    }

    // Get bookings for a specific donor
    @GetMapping("/donor/{donorId}")
    public ResponseEntity<?> getDonorBookings(@PathVariable Long donorId) {
        List<CampBooking> bookings = campBookingService.getCampBookingsByDonor(donorId);
        return ResponseEntity.ok(bookings);
    }

    // Check if donor has booked a specific camp
    @GetMapping("/check/{campId}/{donorId}")
    public ResponseEntity<Map<String, Object>> checkDonorBooking(@PathVariable Long campId, @PathVariable Long donorId) {
        Optional<CampBooking> booking = campBookingService.checkDonorBooking(campId, donorId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("isBooked", booking.isPresent());
        if (booking.isPresent()) {
            response.put("booking", booking.get());
        }
        
        return ResponseEntity.ok(response);
    }



    // Cancel booking
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> cancelCampBooking(@PathVariable Long id) {
        try {
            Optional<CampBooking> booking = campBookingService.getCampBookingById(id);
            if (!booking.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Booking not found"));
            }
            
            CampBooking toCancel = booking.get();
            toCancel.setStatus("CANCELLED");
            campBookingService.updateCampBooking(id, toCancel);
            
            return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error cancelling booking"));
        }
    }

    // Get camp availability
    @GetMapping("/availability/{campId}")
    public ResponseEntity<Map<String, Object>> getCampAvailability(@PathVariable Long campId) {
        Optional<BloodCamp> camp = bloodCampService.getBloodCampById(campId);
        if (!camp.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Camp not found"));
        }
        
        long registered = campBookingService.getRegisteredCount(campId);
        long remaining = camp.get().getMaxDonors() - registered;
        
        Map<String, Object> response = new HashMap<>();
        response.put("campId", campId);
        response.put("maxDonors", camp.get().getMaxDonors());
        response.put("registeredDonors", registered);
        response.put("remainingSlots", Math.max(0, remaining));
        response.put("isAvailable", remaining > 0);
        response.put("isFull", remaining <= 0);
        
        return ResponseEntity.ok(response);
    }
}

