package backend.Model;

public class ChatMessage {
    private String userMessage;
    private String botResponse;
    private long timestamp;

    public ChatMessage() {}

    public ChatMessage(String userMessage, String botResponse) {
        this.userMessage = userMessage;
        this.botResponse = botResponse;
        this.timestamp = System.currentTimeMillis();
    }

    public ChatMessage(String userMessage, String botResponse, long timestamp) {
        this.userMessage = userMessage;
        this.botResponse = botResponse;
        this.timestamp = timestamp;
    }

    // Getters and Setters
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

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
