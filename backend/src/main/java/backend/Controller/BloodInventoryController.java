package backend.Controller;

import backend.Model.*;
import backend.Repository.*;
import backend.Service.NotificationSchedulerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@CrossOrigin({"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
@RequestMapping("/api/blood-inventory")
public class BloodInventoryController {
    
    @Autowired
    private BloodInventoryRepository bloodInventoryRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private NotificationSchedulerService notificationSchedulerService;

    @PostMapping
    public ResponseEntity<?> addBloodUnit(@RequestBody Map<String, Object> inventoryData) {
        try {
            BloodInventory inventory = new BloodInventory();
            inventory.setBloodGroup(BloodGroup.valueOf((String) inventoryData.get("bloodGroup")));
            inventory.setQuantity(Integer.parseInt(inventoryData.get("quantity").toString()));
            inventory.setCollectionDate(LocalDate.parse((String) inventoryData.get("collectionDate")));
            inventory.setExpiryDate(LocalDate.parse((String) inventoryData.get("expiryDate")));
            inventory.setExpired(false);
            
            inventory = bloodInventoryRepository.save(inventory);
            
            // Check and notify admins if stock is still low after adding
            notificationSchedulerService.checkAndNotifyAdminsForLowStock();
            
            return ResponseEntity.status(HttpStatus.CREATED).body(inventory);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error adding blood unit: " + e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<List<BloodInventory>> getAllInventory() {
        return ResponseEntity.ok(bloodInventoryRepository.findAll());
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<BloodInventory>> getAvailableInventory() {
        return ResponseEntity.ok(bloodInventoryRepository.findByIsExpired(false));
    }
    
    @GetMapping("/expired")
    public ResponseEntity<List<BloodInventory>> getExpiredInventory() {
        return ResponseEntity.ok(bloodInventoryRepository.findByIsExpired(true));
    }
    
    @GetMapping("/blood-group/{bloodGroup}")
    public ResponseEntity<List<BloodInventory>> getInventoryByBloodGroup(@PathVariable String bloodGroup) {
        BloodGroup bg = BloodGroup.valueOf(bloodGroup);
        return ResponseEntity.ok(bloodInventoryRepository.findByBloodGroup(bg));
    }
    
    @GetMapping("/summary")
    public ResponseEntity<?> getBloodStockSummary() {
        try {
            Map<String, Integer> summary = new HashMap<>();
            
            for (BloodGroup bg : BloodGroup.values()) {
                Integer quantity = bloodInventoryRepository.getTotalQuantityByBloodGroup(bg);
                summary.put(bg.getDisplayName(), quantity != null ? quantity : 0);
            }
            
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error fetching summary: " + e.getMessage()));
        }
    }
    
    @GetMapping("/low-stock")
    public ResponseEntity<?> getLowStockAlerts() {
        try {
            List<Map<String, Object>> lowStockItems = new ArrayList<>();
            int LOW_STOCK_THRESHOLD = 10; // units
            
            for (BloodGroup bg : BloodGroup.values()) {
                Integer quantity = bloodInventoryRepository.getTotalQuantityByBloodGroup(bg);
                int stock = quantity != null ? quantity : 0;
                
                if (stock < LOW_STOCK_THRESHOLD) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("bloodGroup", bg.getDisplayName());
                    item.put("quantity", stock);
                    item.put("threshold", LOW_STOCK_THRESHOLD);
                    item.put("status", stock == 0 ? "CRITICAL" : "LOW");
                    lowStockItems.add(item);
                }
            }
            
            return ResponseEntity.ok(lowStockItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error fetching low stock alerts: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateInventory(@PathVariable Long id, @RequestBody Map<String, Object> inventoryData) {
        try {
            BloodInventory inventory = bloodInventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));
            
            if (inventoryData.containsKey("quantity")) {
                inventory.setQuantity(Integer.parseInt(inventoryData.get("quantity").toString()));
            }
            if (inventoryData.containsKey("expiryDate")) {
                inventory.setExpiryDate(LocalDate.parse((String) inventoryData.get("expiryDate")));
            }
            
            inventory = bloodInventoryRepository.save(inventory);
            
            // Check and notify admins about low stock after update
            notificationSchedulerService.checkAndNotifyAdminsForLowStock();
            
            return ResponseEntity.ok(inventory);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error updating inventory: " + e.getMessage()));
        }
    }
    
    @PutMapping("/check-expired")
    public ResponseEntity<?> markExpiredBlood() {
        try {
            List<BloodInventory> allInventory = bloodInventoryRepository.findAll();
            LocalDate today = LocalDate.now();
            int expiredCount = 0;
            
            for (BloodInventory inventory : allInventory) {
                if (!inventory.isExpired() && inventory.getExpiryDate().isBefore(today)) {
                    inventory.setExpired(true);
                    bloodInventoryRepository.save(inventory);
                    expiredCount++;
                }
            }
            
            return ResponseEntity.ok(Map.of("message", expiredCount + " blood units marked as expired"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error checking expired blood: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInventory(@PathVariable Long id) {
        try {
            bloodInventoryRepository.deleteById(id);
            
            // Check and notify admins about low stock after deletion
            notificationSchedulerService.checkAndNotifyAdminsForLowStock();
            
            return ResponseEntity.ok(Map.of("message", "Inventory item deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error deleting inventory: " + e.getMessage()));
        }
    }
}

