package backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {
    @Autowired(required = false)
    private JavaMailSender javaMailSender;
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    /**
     * Send emergency blood request notification email to donor
     * @param donorEmail Donor's email address
     * @param donorName Donor's name
     * @param bloodType Blood type needed
     * @param hospital Hospital name
     * @param city City/location
     * @param units Units needed
     * @param urgency Urgency level
     * @param contactNumber Hospital contact
     * @param description Emergency description
     * @return true if email sent successfully
     */
    public boolean sendEmergencyNotificationEmail(String donorEmail, String donorName, 
                                                   String bloodType, String hospital, String city,
                                                   int units, String urgency, String contactNumber,
                                                   String description) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@blooddonationsystem.com");
            message.setTo(donorEmail);
            message.setSubject("🚨 EMERGENCY: Blood Donation Needed - " + bloodType);
            
            String emailBody = String.format(
                """
                Dear %s,
                
                There is an URGENT blood donation request that needs your help!
                
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                EMERGENCY BLOOD REQUEST DETAILS
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                
                Blood Type Needed: %s
                Units Required: %d units
                Hospital: %s
                Location: %s
                Urgency Level: %s
                Contact Number: %s
                
                DESCRIPTION:
                %s
                
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                
                You have been selected because your blood type matches the requirement.
                
                Please contact the hospital immediately if you are willing to donate:
                📞 %s
                
                Every drop counts. Your donation can save a life!
                
                If you cannot donate, please reply to this email so we can notify other donors.
                
                Thank you for being a lifesaver!
                
                With gratitude,
                Blood Donation System Team
                """,
                donorName,
                bloodType,
                units,
                hospital,
                city,
                urgency,
                contactNumber,
                description,
                contactNumber
            );
            
            message.setText(emailBody);
            javaMailSender.send(message);
            
            logger.info("Emergency notification email sent successfully to: " + donorEmail);
            return true;
            
        } catch (Exception e) {
            logger.error("Failed to send email to " + donorEmail + ": " + e.getMessage(), e);
            return false;
        }
    }

    /**
     * Send a generic email
     * @param to Recipient email
     * @param subject Email subject
     * @param body Email body
     * @return true if sent successfully
     */
    public boolean sendSimpleEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@blooddonationsystem.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            javaMailSender.send(message);
            
            logger.info("Email sent successfully to: " + to);
            return true;
            
        } catch (Exception e) {
            logger.error("Failed to send email to " + to + ": " + e.getMessage(), e);
            return false;
        }
    }
}
