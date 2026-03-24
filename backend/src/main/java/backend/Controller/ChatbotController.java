package backend.Controller;

import backend.Model.ChatMessage;
import backend.Model.ChatHistory;
import backend.Service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin({"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    /**
     * Get a response from the chatbot for a user message
     * @param chatMessage The user's message
     * @return ChatMessage with bot response
     */
    @PostMapping("/message")
    public ResponseEntity<ChatMessage> getResponse(@RequestBody ChatMessage chatMessage) {
        try {
            if (chatMessage.getUserMessage() == null || chatMessage.getUserMessage().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Generate bot response
            String botResponse = chatbotService.generateResponse(chatMessage.getUserMessage());
            
            // Create response object
            ChatMessage response = new ChatMessage(
                    chatMessage.getUserMessage(),
                    botResponse,
                    System.currentTimeMillis()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get quick suggestions for chatbot
     * @return Array of suggestion strings
     */
    @GetMapping("/suggestions")
    public ResponseEntity<Map<String, Object>> getSuggestions() {
        try {
            String[] suggestions = chatbotService.getQuickSuggestions();
            
            Map<String, Object> response = new HashMap<>();
            response.put("suggestions", suggestions);
            response.put("count", suggestions.length);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Health check endpoint for chatbot service
     * @return Status message
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "Chatbot service is running");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        
        return ResponseEntity.ok(response);
    }

    /**
     * Test endpoint to verify chatbot functionality
     * @return Test response
     */
    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        try {
            String testMessage = "How to donate blood?";
            String response = chatbotService.generateResponse(testMessage);
            
            Map<String, Object> result = new HashMap<>();
            result.put("testMessage", testMessage);
            result.put("testResponse", response);
            result.put("status", "Test successful");
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Save a chat message to the database
     * @param requestData Map containing userMessage, botResponse, donorId, sessionId, suggestions
     * @return Saved ChatHistory object
     */
    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveChatMessage(@RequestBody Map<String, Object> requestData) {
        try {
            String userMessage = (String) requestData.get("userMessage");
            String botResponse = (String) requestData.get("botResponse");
            Long donorId = requestData.containsKey("donorId") && requestData.get("donorId") != null 
                ? Long.valueOf(requestData.get("donorId").toString()) 
                : null;
            String sessionId = (String) requestData.get("sessionId");
            String suggestionsJson = (String) requestData.getOrDefault("suggestionsJson", "[]");

            if (sessionId == null || sessionId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Session ID is required"));
            }

            ChatHistory savedChat = chatbotService.saveChatMessage(userMessage, botResponse, donorId, sessionId, suggestionsJson);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "Chat message saved successfully");
            response.put("chatId", savedChat.getChatId());
            response.put("timestamp", savedChat.getCreatedAt());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to save chat message"));
        }
    }

    /**
     * Get chat history for a session
     * @param sessionId The session ID
     * @return List of chat messages for this session
     */
    @GetMapping("/history/{sessionId}")
    public ResponseEntity<Map<String, Object>> getChatHistory(@PathVariable String sessionId) {
        try {
            List<ChatHistory> history = chatbotService.getChatHistory(sessionId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("sessionId", sessionId);
            response.put("messageCount", history.size());
            response.put("messages", history);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve chat history"));
        }
    }

    /**
     * Get chat history for a donor
     * @param donorId The donor ID
     * @return List of chat messages for this donor
     */
    @GetMapping("/donor-history/{donorId}")
    public ResponseEntity<Map<String, Object>> getDonorChatHistory(@PathVariable Long donorId) {
        try {
            List<ChatHistory> history = chatbotService.getDonorChatHistory(donorId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("donorId", donorId);
            response.put("messageCount", history.size());
            response.put("messages", history);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve donor chat history"));
        }
    }

    /**
     * Get chat history for a donor in a specific session
     * @param donorId The donor ID
     * @param sessionId The session ID
     * @return List of chat messages
     */
    @GetMapping("/donor-session/{donorId}/{sessionId}")
    public ResponseEntity<Map<String, Object>> getDonorSessionChatHistory(
            @PathVariable Long donorId,
            @PathVariable String sessionId) {
        try {
            List<ChatHistory> history = chatbotService.getDonorSessionChatHistory(donorId, sessionId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("donorId", donorId);
            response.put("sessionId", sessionId);
            response.put("messageCount", history.size());
            response.put("messages", history);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve chat history"));
        }
    }

    /**
     * Clear chat history for a session
     * @param sessionId The session ID
     * @return Success message
     */
    @DeleteMapping("/clear/{sessionId}")
    public ResponseEntity<Map<String, Object>> clearSessionHistory(@PathVariable String sessionId) {
        try {
            long messageCount = chatbotService.getSessionMessageCount(sessionId);
            chatbotService.clearSessionHistory(sessionId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "Chat history cleared successfully");
            response.put("messagesDeleted", messageCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to clear chat history"));
        }
    }

    /**
     * Search chat history by keyword
     * @param keyword The search keyword
     * @return List of matching chat messages
     */
    @GetMapping("/search/{keyword}")
    public ResponseEntity<Map<String, Object>> searchChatHistory(@PathVariable String keyword) {
        try {
            List<ChatHistory> results = chatbotService.searchChatHistory(keyword);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("keyword", keyword);
            response.put("resultCount", results.size());
            response.put("results", results);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to search chat history"));
        }
    }
}

