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
   // Set ID
    public void setId(Long id) {
        this.id = id;
    }
   // Get blood group
    public BloodGroup getBloodGroup() {
        return bloodGroup;
    }
  // Set blood group
    public void setBloodGroup(BloodGroup bloodGroup) {
        this.bloodGroup = bloodGroup;
    }
  // Get quantity
    public int getQuantity() {
        return quantity;
    }
// Set quantity and update timestamp
    public void setQuantity(int quantity) {
        this.quantity = quantity;
        // Update last modified time
        this.updatedAt = LocalDateTime.now();
    }
// Get collection date
    public LocalDate getCollectionDate() {
        return collectionDate;
    }
// Set collection date
    public void setCollectionDate(LocalDate collectionDate) {
        this.collectionDate = collectionDate;
    }
// Get expiry date
    public LocalDate getExpiryDate() {
        return expiryDate;
    }
// Set expiry date
    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }
// Check if expired
    public boolean isExpired() {
        return isExpired;
    }
// Set expired status
    public void setExpired(boolean expired) {
        isExpired = expired;
    }
// Get created time
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
// Set created time
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
// Get updated time
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
// Set updated time
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
