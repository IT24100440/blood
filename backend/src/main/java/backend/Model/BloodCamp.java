package backend.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "blood_camps")
public class BloodCamp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long campId;
    
    private String title;
    private LocalDate date;
    private LocalTime time;
    private String location;
    
    @ManyToOne
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;
    
    private String description;
    private Integer maxDonors;
    private LocalDateTime createdAt;
    
    @JsonIgnore
    @OneToMany(mappedBy = "camp", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Appointment> appointments;
    
    @JsonIgnore
    @OneToMany(mappedBy = "camp", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CampBooking> campBookings;

    public BloodCamp() {
    }

    public BloodCamp(String title, LocalDate date, LocalTime time, String location, 
                     Hospital hospital, String description, Integer maxDonors) {
        this.title = title;
        this.date = date;
        this.time = time;
        this.location = location;
        this.hospital = hospital;
        this.description = description;
        this.maxDonors = maxDonors;
        this.createdAt = LocalDateTime.now();
    }

    public Long getCampId() {
        return campId;
    }

    public void setCampId(Long campId) {
        this.campId = campId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getTime() {
        return time;
    }

    public void setTime(LocalTime time) {
        this.time = time;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Hospital getHospital() {
        return hospital;
    }

    public void setHospital(Hospital hospital) {
        this.hospital = hospital;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getMaxDonors() {
        return maxDonors;
    }

    public void setMaxDonors(Integer maxDonors) {
        this.maxDonors = maxDonors;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<Appointment> appointments) {
        this.appointments = appointments;
    }

    public List<CampBooking> getCampBookings() {
        return campBookings;
    }

    public void setCampBookings(List<CampBooking> campBookings) {
        this.campBookings = campBookings;
    }
}
