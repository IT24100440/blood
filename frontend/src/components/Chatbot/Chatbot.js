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

    // 1 Eligibility
if (message.match(/\b(eligibility|can i donate|who can donate|requirements)\b/)) {
  return "Most healthy adults aged 18-65 can donate blood. You should weigh at least 50kg and be in good health. Some medical conditions or recent travel may affect eligibility.";
}

// 2 Age limit
if (message.match(/\b(age limit|minimum age|maximum age)\b/)) {
  return "The typical age range for blood donation is 18 to 65 years. Some countries allow older donors with medical approval.";
}

// 3 Weight requirement
if (message.match(/\b(weight|minimum weight)\b/)) {
  return "You usually need to weigh at least 50kg (110 lbs) to donate blood safely.";
}

// 4 Donation time
if (message.match(/\b(how long|duration|time to donate)\b/)) {
  return "The entire blood donation process takes about 30 to 45 minutes, while the actual donation takes only 8-10 minutes.";
}

// 5 Pain
if (message.match(/\b(pain|hurt|is it painful)\b/)) {
  return "You may feel a slight pinch when the needle is inserted, but most donors say it's very manageable.";
}

// 6 Safety
if (message.match(/\b(safe|is it safe|risk)\b/)) {
  return "Blood donation is very safe. Sterile, single-use equipment is used, so there is no risk of infection.";
}

// 7 Frequency
if (message.match(/\b(how often|frequency|how many times)\b/)) {
  return "You can donate whole blood every 3 months (about 12 weeks).";
}

// 8 Before donation
if (message.match(/\b(before donation|prepare|what to do before)\b/)) {
  return "Eat a healthy meal, drink plenty of water, and get good sleep before donating blood.";
}

// 9 After donation
if (message.match(/\b(after donation|post donation|what to do after)\b/)) {
  return "Rest for a few minutes, drink fluids, and avoid heavy activities for the rest of the day.";
}

// 10 Blood types
if (message.match(/\b(blood types|types of blood)\b/)) {
  return "The main blood types are A, B, AB, and O, each with positive or negative Rh factors.";
}

// 11 Universal donor
if (message.match(/\b(universal donor)\b/)) {
  return "O negative blood is known as the universal donor because it can be given to almost anyone.";
}

// 12 Universal recipient
if (message.match(/\b(universal recipient)\b/)) {
  return "AB positive individuals are universal recipients and can receive blood from any type.";
}

// 13 Hemoglobin
if (message.match(/\b(hemoglobin|hb level)\b/)) {
  return "Your hemoglobin level is checked before donation to ensure it is safe for you to donate.";
}

// 14 Fasting
if (message.match(/\b(fasting|empty stomach)\b/)) {
  return "You should NOT donate on an empty stomach. Eat a healthy meal before donating.";
}

// 15 Alcohol
if (message.match(/\b(alcohol|drink alcohol)\b/)) {
  return "Avoid alcohol before and after donation, as it can dehydrate you.";
}

// 16 Smoking
if (message.match(/\b(smoking|smoke)\b/)) {
  return "Smoking is allowed, but avoid smoking immediately before and after donating blood.";
}

// 17 Illness
if (message.match(/\b(sick|ill|fever|cold)\b/)) {
  return "If you are feeling unwell, it's best to wait until you fully recover before donating.";
}

// 18 Medication
if (message.match(/\b(medication|medicine|drugs)\b/)) {
  return "Some medications may affect eligibility. Always inform staff about any medicines you're taking.";
}

// 19 Pregnancy
if (message.match(/\b(pregnant|pregnancy)\b/)) {
  return "Pregnant women should not donate blood. You can donate after recovery and medical approval.";
}

// 20 Travel
if (message.match(/\b(travel|abroad|recent travel)\b/)) {
  return "Recent travel to certain countries may temporarily affect your eligibility due to infection risks.";
}

// 21 Tattoo
if (message.match(/\b(tattoo|piercing)\b/)) {
  return "You may need to wait 3-6 months after getting a tattoo or piercing before donating.";
}

// 22 Diabetes
if (message.match(/\b(diabetes)\b/)) {
  return "People with controlled diabetes can donate blood if they meet other eligibility criteria.";
}

// 23 Blood storage
if (message.match(/\b(storage|how blood stored)\b/)) {
  return "Donated blood is stored in controlled conditions and separated into components like plasma and platelets.";
}

// 24 Platelets
if (message.match(/\b(platelets)\b/)) {
  return "Platelets help blood clot and are often needed for cancer patients and surgeries.";
}

// 25 Plasma
if (message.match(/\b(plasma)\b/)) {
  return "Plasma is the liquid part of blood and is used to treat burns, shock, and clotting disorders.";
}

// 26 Red cells
if (message.match(/\b(red blood cells|rbc)\b/)) {
  return "Red blood cells carry oxygen and are essential for patients with anemia or blood loss.";
}

// 27 Blood shortage
if (message.match(/\b(shortage|lack of blood)\b/)) {
  return "Blood shortages happen often. Regular donations help maintain a stable supply for emergencies.";
}

// 28 Emergency
if (message.match(/\b(emergency|urgent need)\b/)) {
  return "Blood is critical during emergencies like accidents, surgeries, and natural disasters.";
}

// 29 Donation cost
if (message.match(/\b(cost|free|payment)\b/)) {
  return "Blood donation is completely free and voluntary. You are helping save lives!";
}

// 30 Benefits
if (message.match(/\b(health benefits|benefits)\b/)) {
  return "Donating blood can improve heart health, reduce iron overload, and give you a free health check.";
}

// 31 Fear
if (message.match(/\b(fear|scared|afraid)\b/)) {
  return "It's normal to feel nervous, but trained staff ensure a safe and comfortable experience.";
}

// 32 First time
if (message.match(/\b(first time|new donor)\b/)) {
  return "First-time donors are guided through every step. The process is simple and safe.";
}

// 33 ID requirement
if (message.match(/\b(id|identification)\b/)) {
  return "You may need a valid ID when registering for blood donation.";
}

// 34 Blood testing
if (message.match(/\b(testing|screening)\b/)) {
  return "All donated blood is carefully tested for infections before being used.";
}

// 35 Waiting time
if (message.match(/\b(wait|waiting time)\b/)) {
  return "Appointments reduce waiting time, but walk-ins are usually welcome.";
}

// 36 Donation camp
if (message.match(/\b(camp|blood camp|drive)\b/)) {
  return "Blood donation camps are organized regularly in schools, offices, and communities.";
}

// 37 Cancel appointment
if (message.match(/\b(cancel|reschedule)\b/)) {
  return "You can cancel or reschedule your appointment anytime through your dashboard.";
}

// 38 Location
if (message.match(/\b(location|where)\b/)) {
  return "You can find nearby donation centers using the Donor Dashboard or location services.";
}

// 39 Reminder
if (message.match(/\b(reminder|notify)\b/)) {
  return "You will receive reminders before your scheduled donation appointment.";
}

// 40 Dashboard
if (message.match(/\b(dashboard|account)\b/)) {
  return "The Donor Dashboard helps you track donations, appointments, and health updates.";
}

// 41 History
if (message.match(/\b(history|records)\b/)) {
  return "You can view your donation history in your profile dashboard.";
}

// 42 Contact
if (message.match(/\b(contact|support|help)\b/)) {
  return "You can contact support through the help section for any assistance.";
}

// 43 Feedback
if (message.match(/\b(feedback|review)\b/)) {
  return "We appreciate your feedback to improve our services.";
}

// 44 Thank donor
if (message.match(/\b(thank|appreciate)\b/)) {
  return "Thank you for your willingness to donate blood and save lives!";
}

// 45 Iron levels
if (message.match(/\b(iron)\b/)) {
  return "Maintaining good iron levels is important. Eat iron-rich foods before and after donation.";
}

// 46 Exercise
if (message.match(/\b(exercise|gym)\b/)) {
  return "Avoid heavy exercise immediately after donating blood.";
}

// 47 Hydration
if (message.match(/\b(water|hydrate|hydration)\b/)) {
  return "Drink plenty of water before and after donation to stay hydrated.";
}

// 48 Sleep
if (message.match(/\b(sleep|rest)\b/)) {
  return "Get at least 6-8 hours of sleep before donating blood.";
}

// 49 Infection
if (message.match(/\b(infection|disease)\b/)) {
  return "People with certain infections may need to wait before donating blood.";
}

// 50 Motivation
if (message.match(/\b(motivation|inspire)\b/)) {
  return "Every blood donation is a chance to save lives and make a meaningful impact.";
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
