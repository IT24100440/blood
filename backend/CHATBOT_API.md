# Chatbot Backend API Documentation

## Overview
The Blood Donation Management System includes a backend chatbot service that provides AI-like responses to user queries about blood donation. The chatbot can be used either standalone (frontend-only) or integrated with the backend API for centralized logic.

## Base URL
```
http://localhost:8080/api/chatbot
```

## Endpoints

### 1. Get Chatbot Response
**Endpoint:** `POST /api/chatbot/message`

**Description:** Sends a user message to the chatbot and receives a response.

**Request Body:**
```json
{
  "userMessage": "How do I donate blood?",
  "botResponse": null,
  "timestamp": 0
}
```

**Response:**
```json
{
  "userMessage": "How do I donate blood?",
  "botResponse": "The blood donation process takes about 10-15 minutes for the actual donation. The entire process including registration, health screening, and refreshments takes about 1 hour. A sterile needle is used to draw about one pint (450ml) of blood.",
  "timestamp": 1710419625000
}
```

**Status Code:** `200 OK`

**Example cURL:**
```bash
curl -X POST http://localhost:8080/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"userMessage":"How do I donate blood?","botResponse":null,"timestamp":0}'
```

---

### 2. Get Quick Suggestions
**Endpoint:** `GET /api/chatbot/suggestions`

**Description:** Retrieves a list of quick suggestion topics that users can click.

**Response:**
```json
{
  "suggestions": [
    "How to donate blood?",
    "Am I eligible?",
    "Blood types explained",
    "Find hospitals",
    "Schedule appointment",
    "What are the benefits?",
    "Post-donation care",
    "Emergency blood request"
  ],
  "count": 8
}
```

**Status Code:** `200 OK`

**Example cURL:**
```bash
curl -X GET http://localhost:8080/api/chatbot/suggestions \
  -H "Content-Type: application/json"
```

---

### 3. Health Check
**Endpoint:** `GET /api/chatbot/health`

**Description:** Checks if the chatbot service is running.

**Response:**
```json
{
  "status": "Chatbot service is running",
  "timestamp": "1710419625000"
}
```

**Status Code:** `200 OK`

**Example cURL:**
```bash
curl -X GET http://localhost:8080/api/chatbot/health \
  -H "Content-Type: application/json"
```

---

### 4. Test Endpoint
**Endpoint:** `POST /api/chatbot/test`

**Description:** Tests the chatbot functionality with a sample query.

**Response:**
```json
{
  "testMessage": "How to donate blood?",
  "testResponse": "The blood donation process takes about 10-15 minutes...",
  "status": "Test successful"
}
```

**Status Code:** `200 OK`

**Example cURL:**
```bash
curl -X POST http://localhost:8080/api/chatbot/test \
  -H "Content-Type: application/json"
```

---

## Supported Topics

The chatbot can answer questions about:

1. **Eligibility & Requirements**
   - Keywords: "can i donate", "eligible", "eligibility", "who can donate", "requirements"
   - Keywords: "age", "how old", "minimum age", "maximum age"
   - Keywords: "weight", "how much", "minimum weight", "weigh"

2. **Blood Types**
   - Keywords: "blood type", "blood group", "a positive", "b positive", "o positive", "ab", "universal", "rare"

3. **Donation Process**
   - Keywords: "what happens", "process", "procedure", "how long", "duration"
   - Keywords: "prepare", "preparation", "before donating", "what to eat", "what to drink"

4. **After-Care**
   - Keywords: "after donation", "after donating", "what to do after", "recovery"

5. **Blood Types & Compatibility**
   - Keywords: "blood type", "blood group", "compatible", "universal donor", "universal receiver"

6. **Frequency**
   - Keywords: "how often", "frequency", "how many times", "interval"

7. **Medical Conditions**
   - Keywords: "medical condition", "disease", "illness", "medication", "medicine", "drugs"
   - Keywords: "tattoo", "piercing", "body art"
   - Keywords: "travel", "abroad", "country", "international"

8. **Benefits**
   - Keywords: "why donate", "benefits", "importance", "why should", "help", "save lives"

9. **Appointment Scheduling**
   - Keywords: "appointment", "schedule", "book", "when can", "available"

10. **Emergency Requests**
    - Keywords: "emergency", "urgent", "urgency", "critical", "need blood"

11. **Contact Information**
    - Keywords: "contact", "phone", "email", "address", "location", "where"
    - Response includes phone number: 0743179688

## Error Handling

### 400 Bad Request
When user message is empty or null:
```json
{
  "error": "User message cannot be empty"
}
```

### 500 Internal Server Error
When an exception occurs:
```json
{
  "error": "Internal server error occurred"
}
```

## Implementation Details

### Backend Components

1. **ChatbotService.java**
   - Location: `backend/src/main/java/backend/Service/ChatbotService.java`
   - Purpose: Contains all chatbot logic and response generation
   - Methods:
     - `generateResponse(String userMessage)` - Generates response based on user input
     - `getQuickSuggestions()` - Returns array of suggested topics
     - `matchesPattern(String text, String pattern)` - Regex pattern matching helper

2. **ChatbotController.java**
   - Location: `backend/src/main/java/backend/Controller/ChatbotController.java`
   - Purpose: REST API endpoints for chatbot
   - Endpoints: `/message`, `/suggestions`, `/health`, `/test`

3. **ChatMessage.java**
   - Location: `backend/src/main/java/backend/Model/ChatMessage.java`
   - Purpose: Data Transfer Object (DTO) for message requests/responses
   - Fields: `userMessage`, `botResponse`, `timestamp`

### Frontend Integration

The frontend chatbot (React component) can be configured to:
1. Use local logic only (current implementation)
2. Call the backend API for responses
3. Hybrid approach (fallback to local responses if API is unavailable)

To enable backend API calls in the frontend, modify `src/components/Chatbot/Chatbot.js`:

```javascript
const getBotResponse = async (userMessage) => {
  try {
    const response = await fetch('http://localhost:8080/api/chatbot/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage: userMessage,
        botResponse: null,
        timestamp: 0
      })
    });
    
    const data = await response.json();
    return data.botResponse;
  } catch (error) {
    console.error('Chatbot API error:', error);
    // Fallback to local response generation
    return generateLocalResponse(userMessage);
  }
};
```

## Response Format Examples

### Greeting
**Input:** "Hi there"
**Response:** "Hello! Welcome to the Blood Bank Assistant. How can I help you today? You can ask me about blood donation, eligibility, blood types, or any related questions."

### Eligibility Question
**Input:** "Can I donate blood?"
**Response:** "To be eligible for blood donation, you must: Be at least 18 years old (or 16-17 with parental consent), weigh at least 110 pounds (50kg), be in good health, have normal blood pressure and hemoglobin levels. You shouldn't have donated blood in the last 56 days for whole blood donation."

### Blood Type Question
**Input:** "What are blood types?"
**Response:** "There are 8 main blood types: A+, A-, B+, B-, AB+, AB-, O+, O-. O- is the universal donor (can give to anyone), while AB+ is the universal receiver (can receive from anyone). O+ is the most common, while AB- is one of the rarest."

### Unrecognized Question
**Input:** "What is your favorite color?"
**Response:** "I'm not sure about that specific question. I can help you with: blood donation eligibility, requirements, blood types, donation process, preparation tips, after-care, appointment scheduling, and general blood donation information. What would you like to know?"

## Testing

### Using Postman

1. **Test Message Endpoint:**
   - Method: POST
   - URL: `http://localhost:8080/api/chatbot/message`
   - Body (Raw JSON):
   ```json
   {
     "userMessage": "How to donate blood?",
     "botResponse": null,
     "timestamp": 0
   }
   ```

2. **Test Suggestions Endpoint:**
   - Method: GET
   - URL: `http://localhost:8080/api/chatbot/suggestions`

3. **Test Health Endpoint:**
   - Method: GET
   - URL: `http://localhost:8080/api/chatbot/health`

### Using JavaScript Fetch

```javascript
// Get chatbot response
async function getChatbotResponse(userMessage) {
  const response = await fetch('http://localhost:8080/api/chatbot/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userMessage: userMessage,
      botResponse: null,
      timestamp: 0
    })
  });
  
  const data = await response.json();
  console.log('Bot Response:', data.botResponse);
  return data.botResponse;
}

// Call it
getChatbotResponse('How do I donate blood?');
```

## Performance Considerations

1. **Response Time:** Average response time is <50ms for message generation
2. **Concurrency:** API can handle multiple simultaneous requests
3. **Resource Usage:** Minimal memory footprint, no database queries
4. **Caching:** Suggestions can be cached on frontend for better performance

## Future Enhancements

1. Add logging and analytics for user queries
2. Store conversation history with user IDs
3. Implement machine learning for improved response matching
4. Add support for multiple languages
5. Integrate with hospital and appointment databases for dynamic responses
6. Add sentiment analysis to detect user frustration
7. Implement conversation context tracking
8. Add intent classification with confidence scores

## CORS Configuration

The chatbot API is configured with CORS to accept requests from:
- `http://localhost:3000` (React development server)

To add more origins, modify the `@CrossOrigin` annotation in `ChatbotController.java`:
```java
@CrossOrigin(origins = {"http://localhost:3000", "https://yourdomain.com"})
```

## Troubleshooting

### Issue: "Failed to connect to chatbot API"
**Solution:** 
1. Ensure backend server is running (`mvnw spring-boot:run`)
2. Check that port 8080 is not blocked
3. Verify CORS configuration includes your frontend URL

### Issue: "All responses are generic fallback response"
**Solution:**
1. Check that keywords match the user input
2. Verify regex patterns are correct
3. Add console.log in ChatbotService for debugging

### Issue: "Empty message error"
**Solution:**
1. Ensure userMessage field is not null or empty
2. Validate input before sending to API
3. Check request body format

## API Rate Limiting

Currently, there are no rate limits on the chatbot API. For production, consider implementing:
- Rate limiting per IP address
- Rate limiting per user ID
- Exponential backoff for retries

## Security Considerations

1. **Input Validation:** Always validate and sanitize user input
2. **SQL Injection:** Not applicable (no database queries)
3. **XSS:** Frontend should escape bot responses
4. **HTTPS:** Use HTTPS in production instead of HTTP
5. **Authentication:** Consider adding JWT tokens for production
6. **CORS:** Restrict origins to trusted domains

---

## Contact

For issues or questions about the chatbot API, contact the development team at 0743179688.
