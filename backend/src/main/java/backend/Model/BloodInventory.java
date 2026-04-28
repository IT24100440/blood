package backend.Model;
// Import JPA annotations
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
// Table name in database
@Table(name = "blood_inventory")
public class BloodInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // Blood group column (A+, B-, etc.)
    @Column(name = "blood_group", nullable = false)
    // Store enum as String in database
    @Enumerated(EnumType.STRING)
    private BloodGroup bloodGroup;
    
    @Column(nullable = false)
    private int quantity; // in units
    // Date when blood was collected
    @Column(name = "collection_date", nullable = false)
    private LocalDate collectionDate;
    // Expiry date of blood
    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;
    // Check if blood is expired or not
    @Column(name = "is_expired")
    private boolean isExpired = false;
    // Record creation timestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    // Last updated timestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
// Default constructor
    public BloodInventory() {
        // Set current date and time when object is created
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
// Parameterized constructor
    public BloodInventory(BloodGroup bloodGroup, int quantity, LocalDate collectionDate, LocalDate expiryDate) {
        this.bloodGroup = bloodGroup;
        this.quantity = quantity;
        this.collectionDate = collectionDate;
        this.expiryDate = expiryDate;
        // Set timestamps
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BloodGroup getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(BloodGroup bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDate getCollectionDate() {
        return collectionDate;
    }

    public void setCollectionDate(LocalDate collectionDate) {
        this.collectionDate = collectionDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public boolean isExpired() {
        return isExpired;
    }

    public void setExpired(boolean expired) {
        isExpired = expired;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
