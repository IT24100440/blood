package backend.Repository;

import backend.Model.Notification;
import backend.Model.Donor;
import backend.Model.EmergencyRequest;
import backend.Model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByDonor(Donor donor);
    List<Notification> findByRequest(EmergencyRequest request);
    List<Notification> findByStatus(String status);
    List<Notification> findByExpiresAtBefore(LocalDateTime timestamp);
}
