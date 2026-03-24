package backend.Service;

import backend.Model.ChatHistory;
import backend.Repository.ChatHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.regex.Pattern;
import java.util.List;

@Service
public class ChatbotService {

    @Autowired
    private ChatHistoryRepository chatHistoryRepository;

    /**
     * Generates a bot response based on user message
     * @param userMessage The message from the user
     * @return The bot's response
     */
    public String generateResponse(String userMessage) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return "I didn't catch that. Could you please rephrase your question?";
        }

        String message = userMessage.toLowerCase();

        // Greetings
        if (matchesPattern(message, "\\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\\b")) {
            return "Hello! Welcome to the Blood Bank Assistant. How can I help you today? You can ask me about blood donation, eligibility, blood types, or any related questions.";
        }

        // Blood donation eligibility
        if (matchesPattern(message, "\\b(can i donate|eligible|eligibility|who can donate|requirements)\\b")) {
            return "To be eligible for blood donation, you must: Be at least 18 years old (or 16-17 with parental consent), weigh at least 110 pounds (50kg), be in good health, have normal blood pressure and hemoglobin levels. You shouldn't have donated blood in the last 56 days for whole blood donation.";
        }

        // Age requirements
        if (matchesPattern(message, "\\b(age|how old|minimum age|maximum age)\\b")) {
            return "You must be at least 18 years old to donate blood (16-17 with parental consent in some locations). There's generally no upper age limit as long as you're healthy, though some blood banks may have policies for donors over 65.";
        }

        // Weight requirements
        if (matchesPattern(message, "\\b(weight|how much|minimum weight|weigh)\\b")) {
            return "Donors must weigh at least 110 pounds (50kg) to donate blood. This ensures you have enough blood volume to donate safely.";
        }

        // Blood types
        if (matchesPattern(message, "\\b(blood type|blood group|a positive|b positive|o positive|ab|universal|rare)\\b")) {
            return "There are 8 main blood types: A+, A-, B+, B-, AB+, AB-, O+, O-. O- is the universal donor (can give to anyone), while AB+ is the universal receiver (can receive from anyone). O+ is the most common, while AB- is one of the rarest.";
        }

        // Frequency of donation
        if (matchesPattern(message, "\\b(how often|frequency|how many times|interval)\\b")) {
            return "You can donate whole blood every 56 days (8 weeks), platelets every 7 days (up to 24 times per year), and plasma every 28 days. It's important to wait the full period to allow your body to replenish.";
        }

        // What happens during donation
        if (matchesPattern(message, "\\b(what happens|process|procedure|how long|duration)\\b")) {
            return "The blood donation process takes about 10-15 minutes for the actual donation. The entire process including registration, health screening, and refreshments takes about 1 hour. A sterile needle is used to draw about one pint (450ml) of blood.";
        }

        // Side effects
        if (matchesPattern(message, "\\b(side effects|risks|safe|pain|hurt|dangerous)\\b")) {
            return "Blood donation is very safe! Common minor effects include slight bruising, lightheadedness, or fatigue. Serious complications are extremely rare. The needle insertion may cause brief discomfort. Drinking fluids and eating before donating helps prevent dizziness.";
        }

        // Preparation
        if (matchesPattern(message, "\\b(prepare|preparation|before donating|what to eat|what to drink)\\b")) {
            return "To prepare for donation: Drink extra fluids (non-alcoholic) in the 24 hours before, eat iron-rich foods, get a good night's sleep, eat a healthy meal before donating, and bring your ID. Avoid fatty foods right before donation.";
        }

        // After donation care
        if (matchesPattern(message, "\\b(after donation|after donating|what to do after|recovery)\\b")) {
            return "After donating: Rest for 10-15 minutes and have refreshments, drink extra fluids for the next 24-48 hours, avoid strenuous activity or heavy lifting for 5 hours, keep the bandage on for a few hours, and eat iron-rich foods to help replenish your blood.";
        }

        // Medical conditions
        if (matchesPattern(message, "\\b(medical condition|disease|illness|medication|medicine|drugs)\\b")) {
            return "Some medical conditions and medications may affect eligibility. Generally, you cannot donate if you have: active infections, certain chronic conditions, or are taking specific medications. Please consult with blood bank staff about your specific situation.";
        }

        // Tattoos and piercings
        if (matchesPattern(message, "\\b(tattoo|piercing|body art)\\b")) {
            return "If you got a tattoo or piercing, you may need to wait 3-12 months before donating, depending on the regulations in your area and whether it was done at a licensed facility. This waiting period helps ensure disease transmission safety.";
        }

        // Travel restrictions
        if (matchesPattern(message, "\\b(travel|abroad|country|international)\\b")) {
            return "Recent travel to certain countries may temporarily defer you from donating blood, particularly if you visited areas with malaria or other infectious diseases. The deferral period varies by region. Please inform the blood bank staff about your recent travels.";
        }

        // Why donate
        if (matchesPattern(message, "\\b(why donate|benefits|importance|why should|help|save lives)\\b")) {
            return "Blood donation saves lives! One donation can save up to 3 lives. Blood is needed for surgeries, cancer treatment, chronic illnesses, and traumatic injuries. There's always a need for blood, and only 3% of eligible people donate. Your donation makes a real difference!";
        }

        // Appointment
        if (matchesPattern(message, "\\b(appointment|schedule|book|when can|available)\\b")) {
            return "You can schedule an appointment through our system. Check the Donor Dashboard to book your appointment at a convenient time and location. Walk-ins are also often welcome, but appointments help reduce wait times.";
        }

        // First time donor
        if (matchesPattern(message, "\\b(first time|never donated|new donor|scared|nervous)\\b")) {
            return "Welcome, first-time donor! It's normal to feel nervous. The staff will guide you through every step. The process is safe, quick, and you'll be making an incredible difference. Bring a friend for support if you'd like. You've got this!";
        }

        // Blood testing
        if (matchesPattern(message, "\\b(test|testing|blood test|screening|check)\\b")) {
            return "All donated blood is tested for blood type, infectious diseases (HIV, hepatitis B and C, syphilis, etc.), and other markers to ensure safety. You'll be notified if any issues are found. This testing is free and helps protect both donors and recipients.";
        }

        // Different types of donation
        if (matchesPattern(message, "\\b(types of donation|platelet|plasma|whole blood|apheresis)\\b")) {
            return "Types of blood donation include: Whole Blood (most common, used for all blood components), Platelet Donation (used for cancer patients), Plasma Donation (used for burn and trauma patients), and Double Red Cell Donation (gives twice the red blood cells).";
        }

        // Iron levels
        if (matchesPattern(message, "\\b(iron|hemoglobin|anemia|anemic)\\b")) {
            return "Your hemoglobin (iron) level will be tested before donation. Men need at least 13.0 g/dL and women need 12.5 g/dL. Eating iron-rich foods like red meat, spinach, beans, and fortified cereals helps maintain healthy iron levels for donation.";
        }

        // COVID-19
        if (matchesPattern(message, "\\b(covid|coronavirus|vaccine|vaccination|pandemic)\\b")) {
            return "If you've had COVID-19, you should wait until you're symptom-free and meet recovery guidelines. COVID-19 vaccination doesn't prevent you from donating - you can donate as long as you're feeling well. Blood donation is safe during the pandemic with proper precautions.";
        }

        // Emergency blood
        if (matchesPattern(message, "\\b(emergency|urgent|urgency|critical|need blood)\\b")) {
            return "In emergencies, blood needs can be critical. O- blood is often used in emergencies because it's compatible with all blood types. If there's an urgent need, you may be contacted. Check our system for current urgent needs and consider donating.";
        }

        // Thank you
        if (matchesPattern(message, "\\b(thank|thanks|appreciate)\\b")) {
            return "You're very welcome! Thank you for your interest in blood donation. Every donor is a hero! If you have more questions, feel free to ask anytime.";
        }

        // Goodbye
        if (matchesPattern(message, "\\b(bye|goodbye|see you|later)\\b")) {
            return "Goodbye! Thank you for chatting with me. Remember, your blood donation can save lives. Have a great day!";
        }

        // Contact
        if (matchesPattern(message, "\\b(contact|phone|email|address|location|where)\\b")) {
            return "You can reach us at phone number 0743179688 for any inquiries. Our team is ready to help you!";
        }

        // Default response
        return "I'm not sure about that specific question. I can help you with: blood donation eligibility, requirements, blood types, donation process, preparation tips, after-care, appointment scheduling, and general blood donation information. What would you like to know?";
    }

    /**
     * Helper method to match patterns using regex
     * @param text The text to search in
     * @param pattern The regex pattern
     * @return True if pattern matches, false otherwise
     */
    private boolean matchesPattern(String text, String pattern) {
        try {
            return Pattern.compile(pattern, Pattern.CASE_INSENSITIVE).matcher(text).find();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get quick suggestions for users to click
     * @return Array of suggestion strings
     */
    public String[] getQuickSuggestions() {
        return new String[]{
                "How to donate blood?",
                "Am I eligible?",
                "Blood types explained",
                "Find hospitals",
                "Schedule appointment",
                "What are the benefits?",
                "Post-donation care",
                "Emergency blood request"
        };
    }

    /**
     * Save a chat message to the database
     * @param userMessage The user's message
     * @param botResponse The bot's response
     * @param donorId Optional donor ID if logged in
     * @param sessionId Session ID for grouping conversations
     * @param suggestionsJson JSON string of suggestions
     * @return Saved ChatHistory object
     */
    public ChatHistory saveChatMessage(String userMessage, String botResponse, Long donorId, String sessionId, String suggestionsJson) {
        ChatHistory chatHistory = new ChatHistory(donorId, userMessage, botResponse, suggestionsJson, sessionId);
        return chatHistoryRepository.save(chatHistory);
    }

    /**
     * Get chat history for a specific session
     * @param sessionId The session ID
     * @return List of ChatHistory objects for this session
     */
    public List<ChatHistory> getChatHistory(String sessionId) {
        return chatHistoryRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    /**
     * Get chat history for a specific donor
     * @param donorId The donor ID
     * @return List of ChatHistory objects for this donor
     */
    public List<ChatHistory> getDonorChatHistory(Long donorId) {
        return chatHistoryRepository.findByDonorIdOrderByCreatedAtDesc(donorId);
    }

    /**
     * Get chat history for a donor in a specific session
     * @param donorId The donor ID
     * @param sessionId The session ID
     * @return List of ChatHistory objects for this donor and session
     */
    public List<ChatHistory> getDonorSessionChatHistory(Long donorId, String sessionId) {
        return chatHistoryRepository.findByDonorIdAndSessionIdOrderByCreatedAtAsc(donorId, sessionId);
    }

    /**
     * Delete all chat history for a session
     * @param sessionId The session ID
     */
    public void clearSessionHistory(String sessionId) {
        List<ChatHistory> chats = chatHistoryRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        chatHistoryRepository.deleteAll(chats);
    }

    /**
     * Search chat messages by keyword
     * @param keyword The keyword to search for
     * @return List of matching ChatHistory objects
     */
    public List<ChatHistory> searchChatHistory(String keyword) {
        return chatHistoryRepository.searchChatMessages(keyword);
    }

    /**
     * Get total count of messages in a session
     * @param sessionId The session ID
     * @return Count of messages
     */
    public long getSessionMessageCount(String sessionId) {
        return chatHistoryRepository.countBySessionId(sessionId);
    }
}

