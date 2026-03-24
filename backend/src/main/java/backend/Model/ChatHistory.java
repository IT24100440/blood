package backend.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * ChatHistory Entity - Stores all chatbot conversations in the database
 */
@Entity
@Table(name = "chat_history")
public class ChatHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long chatId;
    
    @Column(name = "donor_id", nullable = true)
    private Long donorId; // Optional: associate with donor if logged in
    
    @Column(name = "user_message", columnDefinition = "TEXT")
    private String userMessage;
    
    @Column(name = "bot_response", columnDefinition = "TEXT")
    private String botResponse;
    
    @Column(name = "suggestions", columnDefinition = "JSON")
    private String suggestionsJson; // Store suggestions as JSON
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "session_id")
    private String sessionId; // To group messages by conversation session
    
    // Constructors
    public ChatHistory() {
        this.createdAt = LocalDateTime.now();
    }
    
    public ChatHistory(String userMessage, String botResponse, String sessionId) {
        this.userMessage = userMessage;
        this.botResponse = botResponse;
        this.sessionId = sessionId;
        this.createdAt = LocalDateTime.now();
    }
    
    public ChatHistory(Long donorId, String userMessage, String botResponse, String suggestionsJson, String sessionId) {
        this.donorId = donorId;
        this.userMessage = userMessage;
        this.botResponse = botResponse;
        this.suggestionsJson = suggestionsJson;
        this.sessionId = sessionId;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getChatId() {
        return chatId;
    }
    
    public void setChatId(Long chatId) {
        this.chatId = chatId;
    }
    
    public Long getDonorId() {
        return donorId;
    }
    
    public void setDonorId(Long donorId) {
        this.donorId = donorId;
    }
    
    public String getUserMessage() {
        return userMessage;
    }
    
    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }
    
    public String getBotResponse() {
        return botResponse;
    }
    
    public void setBotResponse(String botResponse) {
        this.botResponse = botResponse;
    }
    
    public String getSuggestionsJson() {
        return suggestionsJson;
    }
    
    public void setSuggestionsJson(String suggestionsJson) {
        this.suggestionsJson = suggestionsJson;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    @Override
    public String toString() {
        return "ChatHistory{" +
                "chatId=" + chatId +
                ", donorId=" + donorId +
                ", userMessage='" + userMessage + '\'' +
                ", botResponse='" + botResponse + '\'' +
                ", sessionId='" + sessionId + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
