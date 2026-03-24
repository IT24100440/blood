package backend.Service;

import backend.Model.Notification;
import backend.Model.Donor;
import backend.Model.EmergencyRequest;
import backend.Repository.NotificationRepository;
import backend.Repository.DonorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private SMSService smsService;

    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public Optional<Notification> getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public List<Notification> getNotificationsByDonor(Donor donor) {
        return notificationRepository.findByDonor(donor);
    }

    public List<Notification> getNotificationsByRequest(EmergencyRequest request) {
        return notificationRepository.findByRequest(request);
    }

    public List<Notification> getNotificationsByStatus(String status) {
        return notificationRepository.findByStatus(status);
    }

    /**
     * Send emergency notifications to all matching blood type donors via SMS
     * @param emergencyRequest The emergency request to notify about
     * @return Map containing notificationCount and list of matched donors
     */
    public Map<String, Object> sendEmergencyNotifications(EmergencyRequest emergencyRequest) {
        String bloodType = emergencyRequest.getBloodTypeNeeded();
        String hospital = emergencyRequest.getHospital().getHospitalName();
        String city = emergencyRequest.getCity();
        
        // Find all donors with matching blood type
        List<Donor> matchingDonors = donorRepository.findByBloodType(bloodType);
        
        int notificationCount = 0;
        int smsSent = 0;
        List<Map<String, Object>> donorDetails = new ArrayList<>();
        
        // Create notification and send SMS for each matching donor
        for (Donor donor : matchingDonors) {
            // Create notification message
            String message = "🚨 EMERGENCY: " + bloodType + " blood urgently needed at " + hospital + 
                           " (" + city + "). Required units: " + emergencyRequest.getRequiredUnits() + 
                           ". Contact: " + emergencyRequest.getContactNumber();
            
            try {
                // Create and save notification
                Notification notification = new Notification(
                        donor,
                        emergencyRequest,
                        message,
                        "SENT"
                );
                
                createNotification(notification);
                notificationCount++;
                
                // Send SMS to donor's phone number
                boolean smsSentSuccessfully = smsService.sendEmergencyNotificationSMS(
                        donor.getPhone(),
                        donor.getName(),
                        bloodType,
                        hospital,
                        city,
                        emergencyRequest.getRequiredUnits(),
                        emergencyRequest.getContactNumber()
                );
                
                if (smsSentSuccessfully) {
                    smsSent++;
                }
                
                // Add donor details to response
                Map<String, Object> donors = new HashMap<>();
                donors.put("donorId", donor.getDonorId());
                donors.put("name", donor.getName());
                donors.put("phone", donor.getPhone());
                donors.put("city", donor.getCity());
                donors.put("bloodType", donor.getBloodType());
                donors.put("smsSent", smsSentSuccessfully);
                donorDetails.add(donors);
                
            } catch (Exception e) {
                System.err.println("Failed to send SMS notification to donor: " + donor.getDonorId() + " - " + e.getMessage());
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("notificationCount", notificationCount);
        result.put("smsSent", smsSent);
        result.put("matchingDonors", donorDetails);
        result.put("totalDonorsFound", matchingDonors.size());
        
        return result;
    }

    public Notification updateNotification(Long id, Notification notification) {
        Optional<Notification> existingNotification = notificationRepository.findById(id);
        if (existingNotification.isPresent()) {
            Notification notificationToUpdate = existingNotification.get();
            notificationToUpdate.setMessage(notification.getMessage());
            notificationToUpdate.setStatus(notification.getStatus());
            return notificationRepository.save(notificationToUpdate);
        }
        return null;
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
}
