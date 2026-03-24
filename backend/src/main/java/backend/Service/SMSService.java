package backend.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
public class SMSService {
    
    @Value("${twilio.account-sid:}")
    private String accountSid;
    
    @Value("${twilio.auth-token:}")
    private String authToken;
    
    @Value("${twilio.phone-number:}")
    private String twilioPhoneNumber;
    
    private static final Logger logger = LoggerFactory.getLogger(SMSService.class);

    /**
     * Send emergency blood request notification SMS to donor
     * @param donorPhone Donor's phone number (with country code)
     * @param donorName Donor's name
     * @param bloodType Blood type needed
     * @param hospital Hospital name
     * @param city City/location
     * @param units Units needed
     * @param contactNumber Hospital contact number
     * @return true if SMS sent successfully
     */
    public boolean sendEmergencyNotificationSMS(String donorPhone, String donorName, 
                                                 String bloodType, String hospital, String city,
                                                 int units, String contactNumber) {
        try {
            // Initialize Twilio
            Twilio.init(accountSid, authToken);
            
            // Format phone number - add country code if not present
            String formattedPhone = formatPhoneNumber(donorPhone);
            
            // Create SMS message
            String smsBody = String.format(
                "🚨 URGENT: %s needs %d units of %s blood at %s (%s). You match! Call: %s. Save a life!",
                hospital,
                units,
                bloodType,
                city,
                hospital,
                contactNumber
            );
            
            // Send SMS via Twilio
            Message message = Message.creator(
                new PhoneNumber(formattedPhone),      // To number
                new PhoneNumber(twilioPhoneNumber),   // From number
                smsBody                               // Message body
            ).create();
            
            logger.info("Emergency notification SMS sent successfully to: " + donorPhone + 
                       " (SID: " + message.getSid() + ")");
            return true;
            
        } catch (Exception e) {
            logger.error("Failed to send SMS to " + donorPhone + ": " + e.getMessage(), e);
            return false;
        }
    }

    /**
     * Send a generic SMS
     * @param phoneNumber Recipient phone number
     * @param message Message text
     * @return true if sent successfully
     */
    public boolean sendSimpleSMS(String phoneNumber, String message) {
        try {
            Twilio.init(accountSid, authToken);
            
            String formattedPhone = formatPhoneNumber(phoneNumber);
            
            Message smsMessage = Message.creator(
                new PhoneNumber(formattedPhone),
                new PhoneNumber(twilioPhoneNumber),
                message
            ).create();
            
            logger.info("SMS sent successfully to: " + phoneNumber + 
                       " (SID: " + smsMessage.getSid() + ")");
            return true;
            
        } catch (Exception e) {
            logger.error("Failed to send SMS to " + phoneNumber + ": " + e.getMessage(), e);
            return false;
        }
    }

    /**
     * Format phone number to include country code
     * @param phoneNumber Phone number to format
     * @return Formatted phone number with country code
     */
    private String formatPhoneNumber(String phoneNumber) {
        // Remove any spaces, dashes, or special characters
        String cleaned = phoneNumber.replaceAll("[^0-9+]", "");
        
        // If number doesn't start with +, assume Sri Lanka (+94)
        if (!cleaned.startsWith("+")) {
            // Remove leading 0 if present
            if (cleaned.startsWith("0")) {
                cleaned = cleaned.substring(1);
            }
            cleaned = "+94" + cleaned;
        }
        
        return cleaned;
    }
}
