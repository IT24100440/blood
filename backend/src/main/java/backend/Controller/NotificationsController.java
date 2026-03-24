package backend.Controller;

import backend.Model.Notification;
import backend.Model.Donor;
import backend.Service.NotificationService;
import backend.Service.DonorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Alternative endpoint for notifications (plural form)
 * Provides same functionality as NotificationController but with plural path
 */
@RestController
@CrossOrigin({"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
@RequestMapping("/api/notifications")
public class NotificationsController {
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private DonorService donorService;

    // Get All Notifications
    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    // Get Notification by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getNotificationById(@PathVariable Long id) {
        Optional<Notification> notification = notificationService.getNotificationById(id);
        if (notification.isPresent()) {
            return ResponseEntity.ok(notification.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Notification not found"));
    }

    // Get Notifications by Donor
    @GetMapping("/donor/{donorId}")
    public ResponseEntity<?> getNotificationsByDonor(@PathVariable Long donorId) {
        Optional<Donor> donor = donorService.getDonorById(donorId);
        if (donor.isPresent()) {
            return ResponseEntity.ok(notificationService.getNotificationsByDonor(donor.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Donor not found"));
    }

    // Get Notifications by Status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Notification>> getNotificationsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(notificationService.getNotificationsByStatus(status));
    }

    // Update Notification Status
    @PutMapping("/{id}")
    public ResponseEntity<?> updateNotification(@PathVariable Long id, @RequestBody Notification notification) {
        Notification updatedNotification = notificationService.updateNotification(id, notification);
        if (updatedNotification != null) {
            return ResponseEntity.ok(updatedNotification);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Notification not found"));
    }

    // Delete Notification
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable Long id) {
        Optional<Notification> notification = notificationService.getNotificationById(id);
        if (notification.isPresent()) {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Notification not found"));
    }
}

