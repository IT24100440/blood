# Chatbot Database Persistence - Quick Start Guide

## What's New? ✨

The chatbot now **automatically saves all conversations to the database**. This means:
- ✅ Conversations persist across browser sessions
- ✅ Chat history is retrievable for analysis
- ✅ Donors can see their previous conversations
- ✅ Admins can search and view chat patterns

---

## How It Works (For Users)

### Every Time You Use the Chatbot:

1. **Session Created**: Your browser generates a unique session ID
   - Stored in: `localStorage.chatbot_sessionId`
   - Format: `session_1234567890_abc123def`

2. **Message Sent**: When you type and send a message:
   ```
   User: "How to donate blood?"
   Bot:  "Step 1: Register... Step 2: Health check..."
   ```

3. **Auto-Saved to Database**: The message pair is immediately saved
   - No extra clicks needed!
   - If you're logged in, your donor ID is also saved

4. **History Available**: Next time you open the chatbot:
   - Previous messages are automatically loaded
   - You see your full conversation history
   - Pick up where you left off

---

## For Developers: Key Files Changed

### Backend (Java/Spring)

**New Files:**
- `ChatHistory.java` - JPA Entity for database persistence
- `ChatHistoryRepository.java` - Data access layer

**Updated Files:**
- `ChatbotService.java` - Added save/retrieve methods
- `ChatbotController.java` - Added 6 new API endpoints

### Frontend (React)

**Updated Files:**
- `api.js` - Added 7 new API service methods
- `Chatbot.js` - Added auto-save and history loading

---

## Database Table

Automatically created on startup: `chat_history`

```
Columns:
├─ chat_id (Primary Key)
├─ donor_id (Optional - for logged-in users)
├─ user_message (What user asked)
├─ bot_response (What bot replied)
├─ suggestions (JSON - quick reply buttons)
├─ session_id (Groups messages into conversations)
└─ created_at (Timestamp)
```

---

## New API Endpoints

```
POST   /api/chatbot/save                    → Save message to database
GET    /api/chatbot/history/{sessionId}     → Get conversation by session
GET    /api/chatbot/donor-history/{donorId} → Get all donor conversations
DELETE /api/chatbot/clear/{sessionId}       → Delete conversation
GET    /api/chatbot/search/{keyword}        → Search chat messages
```

---

## Testing the Feature

### 1. **Manual Test (Browser)**
```
1. Open http://localhost:3000
2. Navigate to Chatbot
3. Send message: "How to donate blood?"
4. Wait for response
5. Close the chatbot
6. Reopen it → Message should still be there!
```

### 2. **Database Test (MySQL)**
```bash
mysql -u root -p blood_donation_system
SELECT * FROM chat_history LIMIT 5;
```

### 3. **API Test (curl/Postman)**
```bash
# Save a message
curl -X POST http://localhost:8080/api/chatbot/save \
  -H "Content-Type: application/json" \
  -d '{
    "userMessage": "Test question?",
    "botResponse": "Test answer",
    "sessionId": "session_test123"
  }'

# Retrieve history
curl http://localhost:8080/api/chatbot/history/session_test123
```

---

## Frontend Implementation Details

### Automatic Session Management
```javascript
// On first load, generate unique session ID
let sessionId = localStorage.getItem('chatbot_sessionId');
if (!sessionId) {
  sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('chatbot_sessionId', sessionId);
}
```

### Auto-Save on Message Send
```javascript
const handleSendMessage = async (userMessage) => {
  // 1. Get bot response
  const botResponse = getBotResponse(userMessage);
  
  // 2. Display immediately
  displayMessage(userMessage, botResponse);
  
  // 3. Save to database in background
  await saveChatMessage(
    userMessage,
    botResponse,
    donorId,           // null if not logged in
    sessionId,         // from localStorage
    suggestions        // optional
  );
};
```

### Load History on Mount
```javascript
useEffect(() => {
  const sessionId = localStorage.getItem('chatbot_sessionId');
  
  // Load previous messages from database
  getChatHistory(sessionId)
    .then(response => {
      const history = response.data.messages.map(chat => [
        { text: chat.userMessage, sender: "user" },
        { text: chat.botResponse, sender: "bot" }
      ]);
      setMessages([...initialGreetings, ...history]);
    })
    .catch(() => {
      // First-time user - no history to load
    });
}, []);
```

---

## Backend Implementation Details

### Save Chat Message Service
```java
@Service
public class ChatbotService {
  @Autowired
  private ChatHistoryRepository chatHistoryRepository;
  
  public ChatHistory saveChatMessage(
    String userMessage,
    String botResponse,
    Long donorId,
    String sessionId,
    String suggestionsJson
  ) {
    ChatHistory chat = new ChatHistory(
      donorId,
      userMessage,
      botResponse,
      suggestionsJson,
      sessionId
    );
    return chatHistoryRepository.save(chat);
  }
}
```

### API Endpoint Example
```java
@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {
  
  @PostMapping("/save")
  public ResponseEntity<Map<String, Object>> saveChatMessage(
    @RequestBody Map<String, Object> requestData
  ) {
    // Extracts: userMessage, botResponse, donorId, sessionId
    // Calls: chatbotService.saveChatMessage(...)
    // Returns: Saved chat with ID and timestamp
  }
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interaction                         │
│  "How to donate blood?" → [Microphone/Keyboard]             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend - Chatbot Component                    │
│  1. Display message                                          │
│  2. Get bot response via getBotResponse()                   │
│  3. Display bot response                                    │
│  4. Call saveMessageToDatabase() [async]                    │
│  5. Speak response (optional)                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼ (HTTP POST)
┌─────────────────────────────────────────────────────────────┐
│          Backend - ChatbotController                         │
│  POST /api/chatbot/save                                     │
│  Body: {userMessage, botResponse, donorId, sessionId}      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          Service Layer - ChatbotService                      │
│  saveChatMessage()                                          │
│  1. Create ChatHistory object                              │
│  2. Call chatHistoryRepository.save()                      │
│  3. Return saved object with ID and timestamp              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│     Data Access Layer - ChatHistoryRepository               │
│  save() - Persists to MySQL                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              MySQL Database                                  │
│  Table: chat_history                                        │
│  ├─ INSERT new row with all chat data                      │
│  └─ Return saved record with chat_id and created_at        │
└─────────────────────────────────────────────────────────────┘
```

---

## Persistence Examples

### Example 1: Anonymous User Chat
```
Session ID: session_1710418200000_a7f8k2j1
Donor ID: NULL
Message 1: "Hi" → "Hello! How can I help?"
Message 2: "Blood types?" → "There are 8 main types..."
Message 3: "Type O?" → "O+ is universal donor..."
```

### Example 2: Logged-in Donor Chat
```
Session ID: session_1710418200000_b8g9h3k2
Donor ID: 5
Message 1: "Can I donate?" → "Yes, you're eligible..."
Message 2: "Next step?" → "Schedule appointment..."
```

### Example 3: Search Example
```
Query: "blood type"
Results:
  ├─ "What are blood types?" → "There are 8 main..."
  ├─ "Type O?" → "O+ is universal..."
  └─ "My type is B+" → "B+ can receive..."
```

---

## Configuration

### Environment Variables (application.properties)
The table is created automatically. No configuration needed!

### Database URL
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/blood_donation_system
spring.datasource.username=root
spring.datasource.password=2002
spring.jpa.hibernate.ddl-auto=update
```

---

## Performance Notes

✅ **Optimizations included:**
- Indexes on `session_id`, `donor_id`, `created_at` for fast queries
- Lazy loading of suggestions JSON
- Async save (doesn't block UI)
- Efficient pagination support for large histories

---

## Troubleshooting

### Messages Not Saving?
1. Check backend is running: `netstat -ano | findstr :8080`
2. Verify MySQL is available: `netstat -ano | findstr :3306`
3. Check browser console for API errors (F12 → Console)
4. Check backend logs for exceptions

### History Not Loading?
1. Verify sessionId in localStorage: `localStorage.getItem('chatbot_sessionId')`
2. Ensure table exists: `DESCRIBE chat_history;`
3. Query for messages: `SELECT * FROM chat_history WHERE session_id = 'xyz';`

### Database Space Issues?
1. Check table size: `SELECT COUNT(*) FROM chat_history;`
2. Archive old messages (see CHATBOT_PERSISTENCE.md)
3. Clear old sessions: `DELETE FROM chat_history WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);`

---

## Next Steps

1. ✅ **Start the app**: `npm start` (frontend) + `mvn spring-boot:run` (backend)
2. ✅ **Test the chatbot**: Send a message and verify it saves
3. ✅ **Check the database**: Query `SELECT * FROM chat_history;`
4. ✅ **View documentation**: Read `CHATBOT_PERSISTENCE.md` for full API details

---

## Demo Test Plan

### Test 1: Anonymous User
1. Open chatbot
2. Send: "How to donate blood?"
3. Verify message saved in database
4. Close and reopen chatbot
5. Verify message loads from database ✓

### Test 2: Logged-in Donor
1. Log in as donor
2. Open chatbot
3. Send: "Can I donate?"
4. Verify message saved with donor_id
5. Admin can retrieve: `GET /api/chatbot/donor-history/5` ✓

### Test 3: Search
1. Send several messages
2. Search: `GET /api/chatbot/search/blood%20type`
3. Verify all messages with "blood type" returned ✓

---

## Support & Documentation

- **Full API Docs**: [CHATBOT_PERSISTENCE.md](CHATBOT_PERSISTENCE.md)
- **Main README**: [README.md](../README.md)
- **GitHub Issues**: Report bugs and features
- **Questions?**: Contact the development team

---

## Version History

- **v1.0** (Mar 14, 2024): Initial release
  - Auto-save chat messages
  - Session management
  - Chat history retrieval
  - Search functionality
  - Database persistence

---

**Happy chatting! 🤖💬**
