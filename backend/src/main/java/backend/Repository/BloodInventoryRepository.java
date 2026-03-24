package backend.Repository;

import backend.Model.BloodInventory;
import backend.Model.BloodGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BloodInventoryRepository extends JpaRepository<BloodInventory, Long> {
    List<BloodInventory> findByBloodGroup(BloodGroup bloodGroup);
    List<BloodInventory> findByIsExpired(boolean isExpired);
    
    @Query("SELECT SUM(b.quantity) FROM BloodInventory b WHERE b.bloodGroup = ?1 AND b.isExpired = false")
    Integer getTotalQuantityByBloodGroup(BloodGroup bloodGroup);
    
    @Query("SELECT b.bloodGroup, SUM(b.quantity) FROM BloodInventory b WHERE b.isExpired = false GROUP BY b.bloodGroup")
    List<Object[]> getBloodStockSummary();
}
