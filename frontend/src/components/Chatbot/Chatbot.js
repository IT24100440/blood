import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import { saveChatMessage, getChatHistory } from '../../services/api';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your Blood Bank Assistant. I can help you with information about blood donation, eligibility, blood types, and more. You can type or use voice input!", sender: "bot" },
    { text: "🎤 To use voice: Click the microphone button and speak clearly. Make sure to allow microphone access when prompted by your browser.", sender: "bot" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [micSupported, setMicSupported] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [donorId, setDonorId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const messagesEndRef = useRef(null);

  // Initialize speech recognition and session
  useEffect(() => {
    // Generate or retrieve session ID for chat persistence
    let sid = localStorage.getItem('chatbot_sessionId');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chatbot_sessionId', sid);
    }
    setSessionId(sid);

    // Get donor ID if user is logged in
    const savedDonorId = localStorage.getItem('donorId');
    if (savedDonorId) {
      setDonorId(Number(savedDonorId));
    }

    // Load chat history from database
    loadChatHistory(sid);

    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setMicSupported(true);
      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true; // Changed to true for better feedback
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started');
        };

        recognitionRef.current.onresult = (event) => {
          console.log('Speech recognition result received');
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          // Update input with interim or final transcript
          if (finalTranscript) {
            setInputMessage(finalTranscript);
            setIsListening(false);
          } else if (interimTranscript) {
            setInputMessage(interimTranscript);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          let errorMsg = '';
          
          switch(event.error) {
            case 'no-speech':
              errorMsg = 'No speech detected. Please try again.';
              break;
            case 'audio-capture':
              errorMsg = 'No microphone found. Please check your microphone.';
              break;
            case 'not-allowed':
              errorMsg = 'Microphone permission denied. Please allow microphone access.';
              break;
            case 'network':
              errorMsg = 'Network error. Please check your connection.';
              break;
            default:
              errorMsg = `Error: ${event.error}`;
          }
          
          setIsListening(false);
          
          // Show error as a bot message
          setMessages(prev => [...prev, { 
            text: errorMsg, 
            sender: "bot" 
          }]);
        };

        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };

        recognitionRef.current.onspeechstart = () => {
          console.log('Speech detected');
        };

        recognitionRef.current.onspeechend = () => {
          console.log('Speech ended');
        };

      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        setMicSupported(false);
      }
    } else {
      console.warn('Speech recognition not supported in this browser');
      setMicSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Error stopping recognition:', e);
        }
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setIsListening(true);
        recognitionRef.current.start();
        console.log('Starting speech recognition...');
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsListening(false);
        setMessages(prev => [...prev, { 
          text: 'Failed to start microphone. Please ensure microphone permissions are granted and try again.', 
          sender: "bot" 
        }]);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        console.log('Stopped speech recognition');
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsListening(false);
      }
    }
  };

  const speak = (text) => {
    if (voiceEnabled && synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  /**
   * Load chat history from database
   */
  const loadChatHistory = async (sid) => {
    try {
      if (!sid) return;
      
      const response = await getChatHistory(sid);
      if (response.status === 200 && response.data.messages && response.data.messages.length > 0) {
        // Convert database format to UI format
        const historyMessages = response.data.messages.flatMap(chat => [
          { text: chat.userMessage, sender: "user", id: `user_${chat.chatId}` },
          { text: chat.botResponse, sender: "bot", id: `bot_${chat.chatId}` }
        ]);
        
        // Load history but keep initial greeting messages
        if (historyMessages.length > 0) {
          const initialGreetings = messages;
          setMessages([...initialGreetings, ...historyMessages]);
        }
      }
    } catch (error) {
      console.log('Chat history not found or database error (first time user):', error);
      // This is normal for first-time users
    }
  };

  /**
   * Save message to database
   */
  const saveMessageToDatabase = async (userMsg, botMsg) => {
    if (!sessionId || isSaving) return;
    
    try {
      setIsSaving(true);
      await saveChatMessage(
        userMsg,
        botMsg,
        donorId,
        sessionId,
        [] // suggestions can be added if needed
      );
      console.log('Message saved to database');
    } catch (error) {
      console.error('Error saving message to database:', error);
      // Silently fail - don't disrupt user experience
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;

    // Add user message
    const newMessages = [...messages, { text: inputMessage, sender: "user" }];
    setMessages(newMessages);
    const userInput = inputMessage;
    setInputMessage('');

    // Get bot response
    setTimeout(() => {
      const botResponse = getBotResponse(userInput);
      setMessages([...newMessages, { text: botResponse, sender: "bot" }]);
      
      // Save to database
      saveMessageToDatabase(userInput, botResponse);
      
      // Speak response
      speak(botResponse);
    }, 500);
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Greetings
    if (message.match(/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/)) {
      return "Hello! Welcome to the Blood Bank Assistant. How can I help you today? You can ask me about blood donation, eligibility, blood types, or any related questions.";
    }
    
    // Blood donation eligibility
    if (message.match(/\b(can i donate|eligible|eligibility|who can donate|requirements)\b/)) {
      return "To be eligible for blood donation, you must: Be at least 18 years old (or 16-17 with parental consent), weigh at least 110 pounds (50kg), be in good health, have normal blood pressure and hemoglobin levels. You shouldn't have donated blood in the last 56 days for whole blood donation.";
    }
    
    // Age requirements
    if (message.match(/\b(age|how old|minimum age|maximum age)\b/)) {
      return "You must be at least 18 years old to donate blood (16-17 with parental consent in some locations). There's generally no upper age limit as long as you're healthy, though some blood banks may have policies for donors over 65.";
    }
    
    // Weight requirements
    if (message.match(/\b(weight|how much|minimum weight|weigh)\b/)) {
      return "Donors must weigh at least 110 pounds (50kg) to donate blood. This ensures you have enough blood volume to donate safely.";
    }
    
    // Blood types
    if (message.match(/\b(blood type|blood group|a positive|b positive|o positive|ab|universal|rare)\b/)) {
      return "There are 8 main blood types: A+, A-, B+, B-, AB+, AB-, O+, O-. O- is the universal donor (can give to anyone), while AB+ is the universal receiver (can receive from anyone). O+ is the most common, while AB- is one of the rarest.";
    }
    
    // Frequency of donation
    if (message.match(/\b(how often|frequency|how many times|interval)\b/)) {
      return "You can donate whole blood every 56 days (8 weeks), platelets every 7 days (up to 24 times per year), and plasma every 28 days. It's important to wait the full period to allow your body to replenish.";
    }
    
    // What happens during donation
    if (message.match(/\b(what happens|process|procedure|how long|duration)\b/)) {
      return "The blood donation process takes about 10-15 minutes for the actual donation. The entire process including registration, health screening, and refreshments takes about 1 hour. A sterile needle is used to draw about one pint (450ml) of blood.";
    }
    
    // Side effects
    if (message.match(/\b(side effects|risks|safe|pain|hurt|dangerous)\b/)) {
      return "Blood donation is very safe! Common minor effects include slight bruising, lightheadedness, or fatigue. Serious complications are extremely rare. The needle insertion may cause brief discomfort. Drinking fluids and eating before donating helps prevent dizziness.";
    }
    
    // Preparation
    if (message.match(/\b(prepare|preparation|before donating|what to eat|what to drink)\b/)) {
      return "To prepare for donation: Drink extra fluids (non-alcoholic) in the 24 hours before, eat iron-rich foods, get a good night's sleep, eat a healthy meal before donating, and bring your ID. Avoid fatty foods right before donation.";
    }
    
    // After donation care
    if (message.match(/\b(after donation|after donating|what to do after|recovery)\b/)) {
      return "After donating: Rest for 10-15 minutes and have refreshments, drink extra fluids for the next 24-48 hours, avoid strenuous activity or heavy lifting for 5 hours, keep the bandage on for a few hours, and eat iron-rich foods to help replenish your blood.";
    }
    
    // Medical conditions
    if (message.match(/\b(medical condition|disease|illness|medication|medicine|drugs)\b/)) {
      return "Some medical conditions and medications may affect eligibility. Generally, you cannot donate if you have: active infections, certain chronic conditions, or are taking specific medications. Please consult with blood bank staff about your specific situation.";
    }
    
    // Tattoos and piercings
    if (message.match(/\b(tattoo|piercing|body art)\b/)) {
      return "If you got a tattoo or piercing, you may need to wait 3-12 months before donating, depending on the regulations in your area and whether it was done at a licensed facility. This waiting period helps ensure disease transmission safety.";
    }
    
    // Travel restrictions
    if (message.match(/\b(travel|abroad|country|international)\b/)) {
      return "Recent travel to certain countries may temporarily defer you from donating blood, particularly if you visited areas with malaria or other infectious diseases. The deferral period varies by region. Please inform the blood bank staff about your recent travels.";
    }
    
    // Why donate
    if (message.match(/\b(why donate|benefits|importance|why should|help)\b/)) {
      return "Blood donation saves lives! One donation can save up to 3 lives. Blood is needed for surgeries, cancer treatment, chronic illnesses, and traumatic injuries. There's always a need for blood, and only 3% of eligible people donate. Your donation makes a real difference!";
    }
    
    // Appointment
    if (message.match(/\b(appointment|schedule|book|when can|available)\b/)) {
      return "You can schedule an appointment through our system. Check the Donor Dashboard to book your appointment at a convenient time and location. Walk-ins are also often welcome, but appointments help reduce wait times.";
    }
    
    // First time donor
    if (message.match(/\b(first time|never donated|new donor|scared|nervous)\b/)) {
      return "Welcome, first-time donor! It's normal to feel nervous. The staff will guide you through every step. The process is safe, quick, and you'll be making an incredible difference. Bring a friend for support if you'd like. You've got this!";
    }
    
    // Blood testing
    if (message.match(/\b(test|testing|blood test|screening|check)\b/)) {
      return "All donated blood is tested for blood type, infectious diseases (HIV, hepatitis B and C, syphilis, etc.), and other markers to ensure safety. You'll be notified if any issues are found. This testing is free and helps protect both donors and recipients.";
    }
    
    // Different types of donation
    if (message.match(/\b(types of donation|platelet|plasma|whole blood|apheresis)\b/)) {
      return "Types of blood donation include: Whole Blood (most common, used for all blood components), Platelet Donation (used for cancer patients), Plasma Donation (used for burn and trauma patients), and Double Red Cell Donation (gives twice the red blood cells).";
    }
    
    // Iron levels
    if (message.match(/\b(iron|hemoglobin|anemia|anemic)\b/)) {
      return "Your hemoglobin (iron) level will be tested before donation. Men need at least 13.0 g/dL and women need 12.5 g/dL. Eating iron-rich foods like red meat, spinach, beans, and fortified cereals helps maintain healthy iron levels for donation.";
    }
    
    // COVID-19
    if (message.match(/\b(covid|coronavirus|vaccine|vaccination|pandemic)\b/)) {
      return "If you've had COVID-19, you should wait until you're symptom-free and meet recovery guidelines. COVID-19 vaccination doesn't prevent you from donating - you can donate as long as you're feeling well. Blood donation is safe during the pandemic with proper precautions.";
    }
    
    // Emergency blood
    if (message.match(/\b(emergency|urgent|urgency|critical|need blood)\b/)) {
      return "In emergencies, blood needs can be critical. O- blood is often used in emergencies because it's compatible with all blood types. If there's an urgent need, you may be contacted. Check our system for current urgent needs and consider donating.";
    }
    
    // Thank you
    if (message.match(/\b(thank|thanks|appreciate)\b/)) {
      return "You're very welcome! Thank you for your interest in blood donation. Every donor is a hero! If you have more questions, feel free to ask anytime.";
    }
   
    
    // Goodbye
    if (message.match(/\b(bye|goodbye|see you|later)\b/)) {
      return "Goodbye! Thank you for chatting with me. Remember, your blood donation can save lives. Have a great day!";
    }
    
    // Contact
    if (message.match(/\b(contact|phone|email|address|location|where)\b/)) {
      return "You can reach us at phone number 0743179688 for any inquiries. Our team is ready to help you!";
    }

    // 51 Blood pressure
if (message.match(/\b(blood pressure|bp)\b/)) {
  return "Your blood pressure is checked before donation to ensure it is within a safe range.";
}

// 52 Pulse rate
if (message.match(/\b(pulse|heart rate)\b/)) {
  return "Your pulse rate is measured before donating to make sure your heart is healthy.";
}

// 53 Temperature
if (message.match(/\b(temperature|body temperature)\b/)) {
  return "Your body temperature is checked to confirm you are not having a fever.";
}

// 54 Anemia
if (message.match(/\b(anemia|low iron)\b/)) {
  return "If you have anemia or low iron levels, you may not be eligible to donate until recovered.";
}

// 55 Recovery time
if (message.match(/\b(recovery|recover|how long to recover)\b/)) {
  return "Most people feel normal within a few hours, but full recovery of blood volume takes about 24 hours.";
}

// 56 Eat after donation
if (message.match(/\b(eat after|food after donation)\b/)) {
  return "Eat a healthy meal after donating and include iron-rich foods like spinach or meat.";
}

// 57 Dizziness
if (message.match(/\b(dizzy|dizziness|faint)\b/)) {
  return "Some donors may feel lightheaded. Sit or lie down and drink fluids until you feel better.";
}

// 58 Driving
if (message.match(/\b(drive|driving after donation)\b/)) {
  return "You can usually drive after donating, but rest if you feel dizzy or weak.";
}

// 59 Work
if (message.match(/\b(work|go to work)\b/)) {
  return "You can return to normal work, but avoid heavy lifting for the rest of the day.";
}

// 60 Sports
if (message.match(/\b(sports|play sports)\b/)) {
  return "Avoid intense sports or workouts for at least 24 hours after donating.";
}

// 61 Blood separation
if (message.match(/\b(separate|components)\b/)) {
  return "Donated blood is separated into red cells, plasma, and platelets for different medical uses.";
}

// 62 Rare blood
if (message.match(/\b(rare blood|rare type)\b/)) {
  return "Rare blood types are especially valuable and in high demand for specific patients.";
}

// 63 Donation interval
if (message.match(/\b(interval|gap between donations)\b/)) {
  return "There must be at least a 3-month gap between whole blood donations.";
}

// 64 Infection risk
if (message.match(/\b(risk of infection)\b/)) {
  return "There is no risk of infection when donating because sterile equipment is used every time.";
}

// 65 Consent
if (message.match(/\b(consent|permission)\b/)) {
  return "You must give consent before donating blood, confirming you understand the process.";
}

// 66 Health check
if (message.match(/\b(health check|checkup)\b/)) {
  return "A mini health check is done before donation, including hemoglobin, BP, and pulse.";
}

// 67 Chronic disease
if (message.match(/\b(chronic disease)\b/)) {
  return "Some chronic conditions may affect eligibility. Always consult medical staff.";
}

// 68 Cancer history
if (message.match(/\b(cancer history|cancer patient)\b/)) {
  return "People with a history of certain cancers may not be eligible to donate.";
}

// 69 Surgery
if (message.match(/\b(surgery|operation)\b/)) {
  return "You may need to wait a few months after surgery before donating blood.";
}

// 70 Vaccination
if (message.match(/\b(vaccine|vaccination)\b/)) {
  return "After some vaccinations, you may need to wait before donating. Check with staff.";
}

// 71 COVID
if (message.match(/\b(covid|coronavirus)\b/)) {
  return "If you've had COVID-19, you can donate after full recovery and a waiting period.";
}

// 72 Bleeding
if (message.match(/\b(bleeding after donation)\b/)) {
  return "Apply pressure to the site and keep the bandage on for a few hours to prevent bleeding.";
}

// 73 Bruising
if (message.match(/\b(bruising|bruise)\b/)) {
  return "Minor bruising can happen but usually fades within a few days.";
}

// 74 Hydration importance
if (message.match(/\b(why hydrate|importance of water)\b/)) {
  return "Staying hydrated helps maintain blood volume and prevents dizziness.";
}

// 75 Iron food
if (message.match(/\b(iron food|foods with iron)\b/)) {
  return "Eat foods like spinach, beans, red meat, and eggs to maintain iron levels.";
}

// 76 Blood usage
if (message.match(/\b(used for|who needs blood)\b/)) {
  return "Blood is used for surgeries, trauma care, cancer treatment, and childbirth complications.";
}

// 77 Donor card
if (message.match(/\b(donor card)\b/)) {
  return "After donating, you may receive a donor card to track your contributions.";
}

// 78 Mobile camps
if (message.match(/\b(mobile camp|mobile donation)\b/)) {
  return "Mobile donation units travel to communities to make donation more accessible.";
}

// 79 Emergency call
if (message.match(/\b(call for donors|urgent donors)\b/)) {
  return "Sometimes urgent appeals are made when specific blood types are critically low.";
}

// 80 Volunteer
if (message.match(/\b(volunteer|help donation)\b/)) {
  return "You can also support blood donation programs by volunteering at events.";
}

    
    
    // Default response with suggestions
    return "I'm not sure about that specific question. I can help you with: blood donation eligibility, requirements, blood types, donation process, preparation tips, after-care, appointment scheduling, and general blood donation information. What would you like to know?";
  };

  return (
    <div className="chatbot-container">
      {/* Floating Chat Button */}
      <div className={`chat-button ${isOpen ? 'active' : ''}`} onClick={toggleChat}>
        {isOpen ? (
          <span className="close-icon">✕</span>
        ) : (
          <span className="nurse-icon">👩‍⚕️</span>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Blood Bank Assistant</h3>
            <div className="header-controls">
              <button 
                className={`voice-toggle-button ${voiceEnabled ? 'active' : ''}`}
                onClick={toggleVoice}
                title={voiceEnabled ? "Disable voice" : "Enable voice"}
              >
                {voiceEnabled ? '🔊' : '🔇'}
              </button>
              {isSpeaking && (
                <button 
                  className="stop-speaking-button"
                  onClick={stopSpeaking}
                  title="Stop speaking"
                >
                  ⏹️
                </button>
              )}
              <button className="minimize-button" onClick={toggleChat}>−</button>
            </div>
          </div>
          
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                <div className="message-bubble">
                  {message.text}
                </div>
              </div>
            ))}
            {isListening && (
              <div className="message bot">
                <div className="message-bubble listening-indicator">
                  <span className="pulse-dot"></span>
                  <span className="pulse-dot"></span>
                  <span className="pulse-dot"></span>
                  <span style={{marginLeft: '8px'}}>Listening...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <button
              type="button"
              className={`mic-button ${isListening ? 'listening' : ''} ${!micSupported ? 'disabled' : ''}`}
              onClick={isListening ? stopListening : startListening}
              disabled={!micSupported}
              title={
                !micSupported 
                  ? "Voice input not supported in this browser. Try Chrome or Edge." 
                  : isListening 
                  ? "Click to stop listening (or just stop speaking)" 
                  : "Click and speak your message"
              }
            >
              {isListening ? (
                <span className="mic-icon-pulse">🎤</span>
              ) : (
                <span className="mic-icon">🎤</span>
              )}
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                !micSupported 
                  ? "Type your message..." 
                  : isListening 
                  ? "🎤 Listening... speak now!" 
                  : "Type or click 🎤 to speak..."
              }
              className="chat-input"
            />
            <button type="submit" className="send-button" disabled={inputMessage.trim() === ''}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="white" 
                width="20px" 
                height="20px"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
