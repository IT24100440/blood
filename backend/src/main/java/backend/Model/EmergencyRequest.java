package backend.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "emergency_requests")
public class EmergencyRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;
    
    private String title;
    private String bloodTypeNeeded;
    private Integer requiredUnits;
    
    @ManyToOne
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;
    
    private String city;
    private String urgencyLevel;
    private String description;
    private String contactNumber;
    private LocalDate createdDate;
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // prevent circular serialization (request -> notifications -> request)
    private List<Notification> notifications;

    public EmergencyRequest() {
    }

    public EmergencyRequest(String title, String bloodTypeNeeded, Integer requiredUnits, 
                           Hospital hospital, String city, String urgencyLevel, 
                           String description, String contactNumber, LocalDate createdDate) {
        this.title = title;
        this.bloodTypeNeeded = bloodTypeNeeded;
        this.requiredUnits = requiredUnits;
        this.hospital = hospital;
        this.city = city;
        this.urgencyLevel = urgencyLevel;
        this.description = description;
        this.contactNumber = contactNumber;
        this.createdDate = createdDate;
        this.createdAt = LocalDateTime.now();
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBloodTypeNeeded() {
        return bloodTypeNeeded;
    }

    public void setBloodTypeNeeded(String bloodTypeNeeded) {
        this.bloodTypeNeeded = bloodTypeNeeded;
    }

    public Integer getRequiredUnits() {
        return requiredUnits;
    }

    public void setRequiredUnits(Integer requiredUnits) {
        this.requiredUnits = requiredUnits;
    }

    public Hospital getHospital() {
        return hospital;
    }

    public void setHospital(Hospital hospital) {
        this.hospital = hospital;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getUrgencyLevel() {
        return urgencyLevel;
    }

    public void setUrgencyLevel(String urgencyLevel) {
        this.urgencyLevel = urgencyLevel;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public LocalDate getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDate createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<Notification> notifications) {
        this.notifications = notifications;
    }
}
