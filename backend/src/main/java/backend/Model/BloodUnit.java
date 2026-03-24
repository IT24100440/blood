package backend.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blood_units")
public class BloodUnit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long unitId;
    
    @ManyToOne
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;
    
    private String bloodType;
    private Integer unitsAvailable;
    private LocalDateTime updatedAt;

    public BloodUnit() {
    }

    public BloodUnit(Hospital hospital, String bloodType, Integer unitsAvailable) {
        this.hospital = hospital;
        this.bloodType = bloodType;
        this.unitsAvailable = unitsAvailable;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getUnitId() {
        return unitId;
    }

    public void setUnitId(Long unitId) {
        this.unitId = unitId;
    }

    public Hospital getHospital() {
        return hospital;
    }

    public void setHospital(Hospital hospital) {
        this.hospital = hospital;
    }

    public String getBloodType() {
        return bloodType;
    }

    public void setBloodType(String bloodType) {
        this.bloodType = bloodType;
    }

    public Integer getUnitsAvailable() {
        return unitsAvailable;
    }

    public void setUnitsAvailable(Integer unitsAvailable) {
        this.unitsAvailable = unitsAvailable;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
