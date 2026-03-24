package backend.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "camp_bookings")
public class CampBooking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;
    
    @ManyToOne
    @JoinColumn(name = "camp_id", nullable = false)
    private BloodCamp camp;
    
    @ManyToOne
    @JoinColumn(name = "donor_id", nullable = false)
    private Donor donor;
    
    private String status; // REGISTERED, ATTENDED, CANCELLED, NO_SHOW
    
    private LocalDateTime bookingDate;
    private LocalDateTime attendanceDate;

    public CampBooking() {
    }

    public CampBooking(BloodCamp camp, Donor donor, String status) {
        this.camp = camp;
        this.donor = donor;
        this.status = status;
        this.bookingDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public BloodCamp getCamp() {
        return camp;
    }

    public void setCamp(BloodCamp camp) {
        this.camp = camp;
    }

    public Donor getDonor() {
        return donor;
    }

    public void setDonor(Donor donor) {
        this.donor = donor;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDateTime bookingDate) {
        this.bookingDate = bookingDate;
    }

    public LocalDateTime getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDateTime attendanceDate) {
        this.attendanceDate = attendanceDate;
    }
}
