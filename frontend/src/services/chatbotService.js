/**
 * Chatbot Service - Handles chatbot responses and logic
 */

const GREETINGS = ['hello', 'hi', 'hey', 'greetings', 'namaste'];
const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export const chatbotService = {
  /**
   * Generate chatbot response based on user message
   */
  generateResponse: (userMessage, context = {}) => {
    const message = userMessage.toLowerCase().trim();

    // Greeting responses
    if (GREETINGS.some(g => message.includes(g))) {
      return {
        text: "👋 Welcome to Blood Donation System! I'm your assistant chatbot. How can I help you today? You can ask me about:\n• Blood donation process\n• Finding blood banks\n• Booking appointments\n• Upcoming blood camps\n• Blood types and compatibility\n• General FAQs",
        suggestions: ['Blood Donation Process', 'Find Blood Banks', 'Book Appointment', 'Blood Camps', 'Blood Types']
      };
    }

    // Blood donation process
    if (message.includes('blood donation') || message.includes('how to donate') || message.includes('donation process')) {
      return {
        text: "🩸 **Blood Donation Process:**\n\n1. **Registration** - Fill in your health details\n2. **Health Check** - We'll check your blood pressure and hemoglobin levels\n3. **Donation** - The actual donation takes 8-10 minutes\n4. **Rest & Refreshment** - Rest for 15 minutes and enjoy snacks\n5. **Certificate** - You'll receive a donation certificate\n\n**Eligibility:**\n• Age: 18-65 years\n• Weight: Minimum 50 kg\n• Last donation: 3 months ago\n\nWould you like to book an appointment?",
        suggestions: ['Book Appointment', 'Eligibility Checklist', 'What to Eat Before', 'Side Effects']
      };
    }

    // Find blood banks/hospitals
    if (message.includes('blood bank') || message.includes('hospital') || message.includes('find location') || message.includes('near me')) {
      return {
        text: "🏥 **Find Blood Banks & Hospitals:**\n\nWe have partner hospitals across major cities:\n• Colombo Medical Center\n• Kurunegala Hospital\n• Kandy General Hospital\n• Galle Teaching Hospital\n\nYou can view all hospitals with their details, working hours, and contact information in our system.",
        suggestions: ['View All Hospitals', 'Book Appointment', 'Hospital Details']
      };
    }

    // Book appointment
    if (message.includes('appointment') || message.includes('book') || message.includes('schedule')) {
      return {
        text: "📅 **Book Your Appointment:**\n\nTo book a blood donation appointment:\n1. Click on 'Blood Camps' in the navigation\n2. Select your preferred camp\n3. Fill in your details\n4. Confirm booking\n\nOr you can directly register and search for available camps.",
        suggestions: ['Go to Blood Camps', 'View Schedule', 'My Appointments']
      };
    }

    // Blood camps
    if (message.includes('blood camp') || message.includes('camps') || message.includes('events')) {
      return {
        text: "🏕️ **Upcoming Blood Camps:**\n\nWe organize regular blood camps at different locations. Visit our Blood Camps section to see:\n• Camp dates and times\n• Locations\n• Maximum donors capacity\n• Camp descriptions\n\nYou can book your slot directly from there!",
        suggestions: ['View Blood Camps', 'Book Camp', 'Camp Schedule']
      };
    }

    // Blood types
    if (message.includes('blood type') || message.includes('compatible') || message.includes('blood group')) {
      return {
        text: "🩸 **Blood Types & Compatibility:**\n\n**Universal Donor:** O- (can donate to all)\n**Universal Recipient:** AB+ (can receive from all)\n\n**Letter meanings:**\n• A, B, AB, O = Antigen type\n• + or - = Rh factor\n\n**Compatibility Table:**\n• O+ → O+, A+, B+, AB+\n• O- → All types\n• AB+ → AB+ only\n• AB- → AB+, AB-\n\nDonated blood is tested for safety before use.",
        suggestions: ['Blood Type Chart', 'Donation Rules', 'Recipient Search']
      };
    }

    // Eligibility
    if (message.includes('eligibility') || message.includes('can i donate') || message.includes('requirements')) {
      return {
        text: "✅ **Donation Eligibility:**\n\n**Must Have:**\n✓ Age: 18-65 years\n✓ Weight: At least 50 kg\n✓ Good health\n✓ No recent illness\n\n**Cannot Donate If:**\n✗ Pregnant or breastfeeding\n✗ Recent surgery (3 months)\n✗ On blood thinners\n✗ Recent tattoo or piercing (6 months)\n✗ Donated in last 3 months\n\n**Before Donation:**\n• Eat light, healthy meal\n• Drink plenty of water\n• Get adequate sleep\n• Avoid alcohol/smoking\n\nHave more questions?",
        suggestions: ['Health Checklist', 'After Donation Care', 'Contraindications']
      };
    }

    // Emergency blood request
    if (message.includes('emergency') || message.includes('urgent blood') || message.includes('blood needed')) {
      return {
        text: "🚨 **Emergency Blood Request:**\n\nIf you need urgent blood:\n1. Contact the nearest hospital immediately\n2. Provide blood type needed\n3. Specify quantity\n4. Our system alerts registered donors\n5. Donors can respond quickly\n\n**Emergency Hotline:**\nCall the hospital directly or use our emergency request system.",
        suggestions: ['Emergency Requests', 'Hospital Contact', 'Request Blood']
      };
    }

    // Benefits of donation
    if (message.includes('benefit') || message.includes('why donate') || message.includes('importance')) {
      return {
        text: "❤️ **Why Donate Blood?**\n\n**Health Benefits:**\n✓ Reduces risk of heart disease\n✓ Lowers iron levels\n✓ Stimulates new blood cell production\n✓ Free health checkup included\n\n**Social Benefits:**\n✓ Save 3 lives per donation\n✓ Help accident victims\n✓ Support patients with blood disorders\n✓ Build community\n\n**Blood Shortage:**\nOne donation can save up to 3 lives!",
        suggestions: ['My Impact', 'Donation Statistics', 'Donor Stories']
      };
    }

    // After donation care
    if (message.includes('after donation') || message.includes('post donation') || message.includes('care after')) {
      return {
        text: "💪 **After Donation Care:**\n\n**Immediately:**\n• Rest for 15 minutes\n• Enjoy refreshments\n• Don't stand up suddenly\n\n**First 24 Hours:**\n✓ Drink plenty of fluids\n✓ Eat iron-rich foods\n✓ Avoid strenuous activities\n✓ No heavy lifting\n✓ No driving for 10 minutes\n\n**Next Few Days:**\n✓ Resume normal activities gradually\n✓ Maintain hydration\n✓ Eat nutritious meals\n\n**Avoid:**\n✗ Alcohol for 24 hours\n✗ Smoking\n✗ Hot baths\n✗ Heavy exercise for 24-48 hours",
        suggestions: ['Side Effects', 'Diet Plan', 'FAQs']
      };
    }

    // Register/Login
    if (message.includes('register') || message.includes('login') || message.includes('create account')) {
      return {
        text: "👤 **Account & Registration:**\n\n**To Register as Donor:**\n1. Click 'Register' in the navigation\n2. Fill in your basic details (Name, Email, Phone)\n3. Add your NIC and blood type\n4. Set password\n5. Complete registration\n\n**For Admins:**\nUse the 'Admin Login' button to access administrative features.",
        suggestions: ['Go to Register', 'Login', 'Forgot Password']
      };
    }

    // FAQs
    if (message.includes('faq') || message.includes('question') || message.includes('common')) {
      return {
        text: "❓ **Frequently Asked Questions:**\n\n**Q: How often can I donate?**\nA: Every 3 months (minimum 12 donations per year)\n\n**Q: Does donation hurt?**\nA: Minimal discomfort, quick process\n\n**Q: How much blood is taken?**\nA: 450 ml per donation\n\n**Q: Will I feel weak?**\nA: Most donors feel normal within days\n\n**Q: Can I donate with tattoos?**\nA: Yes, if 6 months have passed\n\n**Q: What about travel/flight?**\nA: Wait 24 hours before air travel\n\nMore questions?",
        suggestions: ['Blood Types FAQ', 'Eligibility FAQ', 'Process FAQ', 'Contact Support']
      };
    }

    // Default response
    return {
      text: "I'm here to help! 😊 You can ask me about:\n• Blood donation process\n• Finding hospitals and blood banks\n• Booking appointments\n• Blood camps\n• Blood types and compatibility\n• Eligibility requirements\n• Emergency blood requests\n• And much more!\n\nWhat would you like to know?",
      suggestions: ['Blood Donation Basics', 'Find Hospitals', 'Book Appointment', 'Emergency Help', 'Blood Types']
    };
  },

  /**
   * Get quick suggestions based on context
   */
  getQuickSuggestions: () => {
    return [
      'Blood Donation Process',
      'Find Blood Banks',
      'Book Appointment',
      'Blood Camps',
      'Emergency Blood',
      'Blood Types',
      'Eligibility Check',
      'Contact Support'
    ];
  },

  /**
   * Handle suggestion clicks
   */
  handleSuggestion: (suggestion) => {
    return chatbotService.generateResponse(suggestion);
  }
};

export default chatbotService;
