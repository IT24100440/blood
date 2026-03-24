package backend.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "donors")
public class Donor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long donorId;
    
    @Column(unique = true, nullable = false)
    private String nic;
    private String name;
    private String email;
    private String phone;
    private Integer age;
    private Double weight;
    private String bloodType;
    private String address;
    private String city;
    private String state;
    @Enumerated(EnumType.STRING)
    private BloodGroup bloodGroup;
    @Column(name = "is_eligible")
    private Boolean isEligible = true;
    private LocalDate lastDonationDate;
    private String eligibilityStatus;
    private LocalDateTime createdAt;

    public Donor() {
    }

    public Donor(String nic, String name, String email, String phone, Integer age, 
                 Double weight, String bloodType, String address, String city, LocalDate lastDonationDate) {
        this.nic = nic;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.age = age;
        this.weight = weight;
        this.bloodType = bloodType;
        this.address = address;
        this.city = city;
        this.lastDonationDate = lastDonationDate;
        this.createdAt = LocalDateTime.now();
    }

    public Long getDonorId() {
        return donorId;
    }

    public void setDonorId(Long donorId) {
        this.donorId = donorId;
    }

    public String getNic() {
        return nic;
    }

    public void setNic(String nic) {
        this.nic = nic;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public String getBloodType() {
        return bloodType;
    }

    public void setBloodType(String bloodType) {
        this.bloodType = bloodType;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public BloodGroup getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(BloodGroup bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public boolean isEligible() {
        return isEligible == null || isEligible;
    }

    public void setEligible(boolean eligible) {
        this.isEligible = eligible;
    }



    public LocalDate getLastDonationDate() {
        return lastDonationDate;
    }

    public void setLastDonationDate(LocalDate lastDonationDate) {
        this.lastDonationDate = lastDonationDate;
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
}
