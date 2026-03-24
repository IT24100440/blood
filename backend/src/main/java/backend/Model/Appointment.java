package backend.Model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appointmentId;
    
    @ManyToOne
    @JoinColumn(name = "donor_id", nullable = false)
    private Donor donor;
    
    @ManyToOne
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;
    
    private LocalDate appointmentDate;
    private String timePeriod;
    private String bookingType;
    
    @ManyToOne
    @JoinColumn(name = "camp_id")
    private BloodCamp camp;
    
    private String eligibilityStatus;
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private String status = "Pending"; // Pending, Approved, Rejected, Completed
    
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;
    
    private Long approvedBy; // Admin ID who approved
    private LocalDateTime approvedAt;

    public Appointment() {
    }

    public Appointment(Donor donor, Hospital hospital, LocalDate appointmentDate, 
                       String timePeriod, String bookingType, String eligibilityStatus) {
        this.donor = donor;
        this.hospital = hospital;
        this.appointmentDate = appointmentDate;
        this.timePeriod = timePeriod;
        this.bookingType = bookingType;
        this.eligibilityStatus = eligibilityStatus;
        this.createdAt = LocalDateTime.now();
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public Donor getDonor() {
        return donor;
    }

    public void setDonor(Donor donor) {
        this.donor = donor;
    }

    public Hospital getHospital() {
        return hospital;
    }

    public void setHospital(Hospital hospital) {
        this.hospital = hospital;
    }

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public String getTimePeriod() {
        return timePeriod;
    }

    public void setTimePeriod(String timePeriod) {
        this.timePeriod = timePeriod;
    }

    public String getBookingType() {
        return bookingType;
    }

    public void setBookingType(String bookingType) {
        this.bookingType = bookingType;
    }

    public BloodCamp getCamp() {
        return camp;
    }

    public void setCamp(BloodCamp camp) {
        this.camp = camp;
    }

    public String getEligibilityStatus() {
        return eligibilityStatus;
    }

    public void setEligibilityStatus(String eligibilityStatus) {
        this.eligibilityStatus = eligibilityStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Long getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(Long approvedBy) {
        this.approvedBy = approvedBy;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }
}
