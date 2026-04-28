package backend.Service;

import backend.Model.EmergencyRequest;
import backend.Model.Hospital;
import backend.Repository.EmergencyRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmergencyRequestService {
    @Autowired
    private EmergencyRequestRepository emergencyRequestRepository;

    @Autowired
    private NotificationService notificationService;

    public EmergencyRequest createEmergencyRequest(EmergencyRequest request) {
        return emergencyRequestRepository.save(request);
    }

    /**
     * Create emergency request and send notifications to matching donors
     * @param request The emergency request to create
     * @return A wrapper object containing the created request and notification details
     */
    public EmergencyRequestWithNotifications createEmergencyRequestWithNotifications(EmergencyRequest request) {
        // Save the emergency request
        EmergencyRequest savedRequest = emergencyRequestRepository.save(request);
        
        // Send notifications to matching blood type donors
        java.util.Map<String, Object> notificationResult = notificationService.sendEmergencyNotifications(savedRequest);
        
        return new EmergencyRequestWithNotifications(
                savedRequest, 
                notificationResult
        );
    }

    public Optional<EmergencyRequest> getEmergencyRequestById(Long id) {
        return emergencyRequestRepository.findById(id);
    }

    public List<EmergencyRequest> getAllEmergencyRequests() {
        return emergencyRequestRepository.findAll();
    }

    public List<EmergencyRequest> getEmergencyRequestsByHospital(Hospital hospital) {
        return emergencyRequestRepository.findByHospital(hospital);
    }

    public List<EmergencyRequest> getEmergencyRequestsByBloodType(String bloodType) {
        return emergencyRequestRepository.findByBloodTypeNeeded(bloodType);
    }

    public List<EmergencyRequest> getEmergencyRequestsByCity(String city) {
        return emergencyRequestRepository.findByCity(city);
    }

    public EmergencyRequest updateEmergencyRequest(Long id, EmergencyRequest request) {
        Optional<EmergencyRequest> existingRequest = emergencyRequestRepository.findById(id);
        if (existingRequest.isPresent()) {
            EmergencyRequest requestToUpdate = existingRequest.get();
            requestToUpdate.setTitle(request.getTitle());
            requestToUpdate.setBloodTypeNeeded(request.getBloodTypeNeeded());
            requestToUpdate.setRequiredUnits(request.getRequiredUnits());
            requestToUpdate.setCity(request.getCity());
            requestToUpdate.setUrgencyLevel(request.getUrgencyLevel());
            requestToUpdate.setDescription(request.getDescription());
            requestToUpdate.setContactNumber(request.getContactNumber());
            return emergencyRequestRepository.save(requestToUpdate);
        }
        return null;
    }

    public void deleteEmergencyRequest(Long id) {
        emergencyRequestRepository.deleteById(id);
    }

    /**
     * Wrapper class to return both request and notification details
     */
    public static class EmergencyRequestWithNotifications {
        private EmergencyRequest request;
        private java.util.Map<String, Object> notificationDetails;

        public EmergencyRequestWithNotifications(EmergencyRequest request, java.util.Map<String, Object> notificationDetails) {
            this.request = request;
            this.notificationDetails = notificationDetails;
        }

        public EmergencyRequest getRequest() {
            return request;
        }

        public void setRequest(EmergencyRequest request) {
            this.request = request;
        }

        public java.util.Map<String, Object> getNotificationDetails() {
            return notificationDetails;
        }

        public void setNotificationDetails(java.util.Map<String, Object> notificationDetails) {
            this.notificationDetails = notificationDetails;
        }
        
        @SuppressWarnings("unchecked")
        public int getNotificationCount() {
            return ((Number) notificationDetails.getOrDefault("notificationCount", 0)).intValue();
        }
        
        @SuppressWarnings("unchecked")
        public int getSmsSent() {
            return ((Number) notificationDetails.getOrDefault("smsSent", 0)).intValue();
        }
        
        @SuppressWarnings("unchecked")
        public java.util.List<java.util.Map<String, Object>> getMatchingDonors() {
            return (java.util.List<java.util.Map<String, Object>>) notificationDetails.getOrDefault("matchingDonors", new java.util.ArrayList<>());
        }
    }
}
