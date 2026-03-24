package backend.Service;

import backend.Model.*;
import backend.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationSchedulerService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private DonorRepository donorRepository;
    
    @Autowired
    private BloodInventoryRepository bloodInventoryRepository;
    
    // Minimum stock threshold for alerts
    private static final int LOW_STOCK_THRESHOLD = 10;
    private static final int CRITICAL_STOCK_THRESHOLD = 5;
    
    /**
     * Check blood stock levels
     * Can be called manually when stock changes
     */
    public void checkAndNotifyAdminsForLowStock() {
        // Admin notifications disabled - no UserModel available
        // This functionality can be re-enabled when User model is implemented
    }
    
    /**
     * Scheduled job to check low stock and notify admins
     * Runs every 3 hours
     */
    @Scheduled(cron = "0 0 */3 * * *") // Every 3 hours
    public void scheduledLowStockAdminAlert() {
        checkAndNotifyAdminsForLowStock();
    }
    
    /**
     * Send appointment reminders 24 hours before scheduled appointments
     * Runs every hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour at minute 0
    public void sendAppointmentReminders() {
        // Appointment reminder notifications disabled - no UserModel available
        // This functionality can be re-enabled when User model is implemented
    }
    
    /**
     * Send same-day appointment reminders
     * Runs every hour from 6 AM to 8 PM
     */
    @Scheduled(cron = "0 0 6-20 * * *") // Every hour from 6 AM to 8 PM
    public void sendSameDayReminders() {
        // Same-day reminder notifications disabled - no UserModel available
        // This functionality can be re-enabled when User model is implemented
    }
    
    /**
     * Check for low blood stock and notify eligible donors
     * Runs every 6 hours
     */
    @Scheduled(cron = "0 0 */6 * * *") // Every 6 hours
    public void checkLowStockAndNotifyDonors() {
        // Donor notification disabled - no UserModel available
        // This functionality can be re-enabled when User model is implemented
    }
    
    /**
     * Clean up expired notifications
     * Runs daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *") // Daily at 2 AM
    public void cleanupExpiredNotifications() {
        List<Notification> expiredNotifications = notificationRepository
            .findByExpiresAtBefore(LocalDateTime.now());
        
        if (!expiredNotifications.isEmpty()) {
            notificationRepository.deleteAll(expiredNotifications);
        }
    }
    
    /**
     * Send eligibility update notifications
     * Runs daily at 8 AM
     */
    @Scheduled(cron = "0 0 8 * * *") // Daily at 8 AM
    public void notifyEligibleDonors() {
        // Eligibility notification disabled - no UserModel available
        // This functionality can be re-enabled when User model is implemented
    }

    private boolean isAppointmentScheduled(Appointment appointment) {
        if (appointment == null || appointment.getStatus() == null) {
            return false;
        }
        return AppointmentStatus.SCHEDULED.name().equalsIgnoreCase(appointment.getStatus());
    }

    private String resolveAppointmentTime(Appointment appointment) {
        if (appointment == null || appointment.getTimePeriod() == null) {
            return "scheduled time";
        }
        return appointment.getTimePeriod();
    }

    private String resolveDonationCenter(Appointment appointment) {
        if (appointment != null && appointment.getHospital() != null &&
            appointment.getHospital().getHospitalName() != null) {
            return appointment.getHospital().getHospitalName();
        }
        return "donation center";
    }
}
