import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

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
  const [useBackendAPI, setUseBackendAPI] = useState(false); // Set to true to use backend API
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const messagesEndRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setMicSupported(true);
      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
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
          setMessages(prev => [...prev, { 
            text: errorMsg, 
            sender: "bot" 
          }]);
        };

        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
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

  // Get response from backend API or local service
  const getBotResponse = async (userInput) => {
    if (useBackendAPI) {
      try {
        const response = await fetch('http://localhost:8080/api/chatbot/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userMessage: userInput,
            botResponse: null,
            timestamp: 0
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          return data.botResponse;
        } else {
          console.error('Backend API error:', response.status);
          return getLocalResponse(userInput);
        }
      } catch (error) {
        console.error('Chatbot API connection error:', error);
        console.log('Falling back to local response generation');
        return getLocalResponse(userInput);
      }
    } else {
      return getLocalResponse(userInput);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;

    const newMessages = [...messages, { text: inputMessage, sender: "user" }];
    setMessages(newMessages);
    const userInput = inputMessage;
    setInputMessage('');

    // Get bot response (from backend or local)
    setTimeout(async () => {
      const botResponse = await getBotResponse(userInput);
      setMessages([...newMessages, { text: botResponse, sender: "bot" }]);
      speak(botResponse);
    }, 500);
  };

  // Local response generation (fallback or default)
  const getLocalResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (matchesPattern(message, "\\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\\b")) {
      return "Hello! Welcome to the Blood Bank Assistant. How can I help you today? You can ask me about blood donation, eligibility, blood types, or any related questions.";
    }
    
    if (matchesPattern(message, "\\b(can i donate|eligible|eligibility|who can donate|requirements)\\b")) {
      return "To be eligible for blood donation, you must: Be at least 18 years old (or 16-17 with parental consent), weigh at least 110 pounds (50kg), be in good health, have normal blood pressure and hemoglobin levels. You shouldn't have donated blood in the last 56 days for whole blood donation.";
    }
    
    if (matchesPattern(message, "\\b(age|how old|minimum age|maximum age)\\b")) {
      return "You must be at least 18 years old to donate blood (16-17 with parental consent in some locations). There's generally no upper age limit as long as you're healthy, though some blood banks may have policies for donors over 65.";
    }
    
    if (matchesPattern(message, "\\b(weight|how much|minimum weight|weigh)\\b")) {
      return "Donors must weigh at least 110 pounds (50kg) to donate blood. This ensures you have enough blood volume to donate safely.";
    }
    
    if (matchesPattern(message, "\\b(blood type|blood group|a positive|b positive|o positive|ab|universal|rare)\\b")) {
      return "There are 8 main blood types: A+, A-, B+, B-, AB+, AB-, O+, O-. O- is the universal donor (can give to anyone), while AB+ is the universal receiver (can receive from anyone). O+ is the most common, while AB- is one of the rarest.";
    }
    
    return "I'm not sure about that specific question. I can help you with: blood donation eligibility, requirements, blood types, donation process, preparation tips, after-care, appointment scheduling, and general blood donation information. What would you like to know?";
  };

  const matchesPattern = (text, pattern) => {
    try {
      return new RegExp(pattern, 'i').test(text);
    } catch (e) {
      return false;
    }
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
