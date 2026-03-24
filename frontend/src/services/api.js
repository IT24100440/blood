import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Admin API calls
export const adminLogin = (email, password) => {
  return axios.post(`${API_BASE_URL}/admin/login`, { email, password });
};

export const createAdmin = (adminData) => {
  return axios.post(`${API_BASE_URL}/admin/register`, adminData);
};

export const getAllAdmins = () => {
  return axios.get(`${API_BASE_URL}/admin`);
};

export const getAdminById = (id) => {
  return axios.get(`${API_BASE_URL}/admin/${id}`);
};

export const updateAdmin = (id, adminData) => {
  return axios.put(`${API_BASE_URL}/admin/${id}`, adminData);
};

export const deleteAdmin = (id) => {
  return axios.delete(`${API_BASE_URL}/admin/${id}`);
};

// Hospital API calls
export const createHospital = (hospitalData) => {
  return axios.post(`${API_BASE_URL}/hospital`, hospitalData);
};

export const getAllHospitals = () => {
  return axios.get(`${API_BASE_URL}/hospital`);
};

export const getHospitalById = (id) => {
  return axios.get(`${API_BASE_URL}/hospital/${id}`);
};

export const updateHospital = (id, hospitalData) => {
  return axios.put(`${API_BASE_URL}/hospital/${id}`, hospitalData);
};

export const deleteHospital = (id) => {
  return axios.delete(`${API_BASE_URL}/hospital/${id}`);
};

// Donor API calls
export const createDonor = (donorData) => {
  return axios.post(`${API_BASE_URL}/donor`, donorData);
};

export const getDonorByNic = (nic) => {
  return axios.get(`${API_BASE_URL}/donor/nic/${nic}`);
};

export const getAllDonors = () => {
  return axios.get(`${API_BASE_URL}/donor`);
};

export const getDonorById = (id) => {
  return axios.get(`${API_BASE_URL}/donor/${id}`);
};

export const updateDonor = (id, donorData) => {
  return axios.put(`${API_BASE_URL}/donor/${id}`, donorData);
};

export const deleteDonor = (id) => {
  return axios.delete(`${API_BASE_URL}/donor/${id}`);
};

export const checkDonorEligibility = (id) => {
  return axios.post(`${API_BASE_URL}/donor/${id}/check-eligibility`);
};

// Appointment API calls
export const createAppointment = (appointmentData) => {
  return axios.post(`${API_BASE_URL}/appointment`, appointmentData);
};

export const getAllAppointments = () => {
  return axios.get(`${API_BASE_URL}/appointment`);
};

export const getAppointmentById = (id) => {
  return axios.get(`${API_BASE_URL}/appointment/${id}`);
};

export const getAppointmentsByHospital = (hospitalId) => {
  return axios.get(`${API_BASE_URL}/appointment/hospital/${hospitalId}`);
};

export const getAppointmentsByDonor = (donorId) => {
  return axios.get(`${API_BASE_URL}/appointment/donor/${donorId}`);
};

export const updateAppointment = (id, appointmentData) => {
  return axios.put(`${API_BASE_URL}/appointment/${id}`, appointmentData);
};

export const deleteAppointment = (id) => {
  return axios.delete(`${API_BASE_URL}/appointment/${id}`);
};

export const getPendingAppointments = () => {
  return axios.get(`${API_BASE_URL}/appointment/status/pending`);
};

export const approveAppointment = (id, adminId) => {
  return axios.put(`${API_BASE_URL}/appointment/${id}/approve`, { adminId });
};

export const rejectAppointment = (id, adminId, rejectionReason) => {
  return axios.put(`${API_BASE_URL}/appointment/${id}/reject`, { adminId, rejectionReason });
};

export const completeAppointment = (id) => {
  return axios.put(`${API_BASE_URL}/appointment/${id}/complete`, {});
};

// Blood Camp API calls
export const createBloodCamp = (campData) => {
  return axios.post(`${API_BASE_URL}/blood-camp`, campData);
};

export const getAllBloodCamps = () => {
  return axios.get(`${API_BASE_URL}/blood-camp`);
};

export const getBloodCampById = (id) => {
  return axios.get(`${API_BASE_URL}/blood-camp/${id}`);
};

export const getBloodCampsByHospital = (hospitalId) => {
  return axios.get(`${API_BASE_URL}/blood-camp/hospital/${hospitalId}`);
};

export const updateBloodCamp = (id, campData) => {
  return axios.put(`${API_BASE_URL}/blood-camp/${id}`, campData);
};

export const deleteBloodCamp = (id) => {
  return axios.delete(`${API_BASE_URL}/blood-camp/${id}`);
};

// Camp Booking API calls
export const bookBloodCamp = (bookingData) => {
  return axios.post(`${API_BASE_URL}/camp-booking`, bookingData);
};

export const getAllCampBookings = () => {
  return axios.get(`${API_BASE_URL}/camp-booking`);
};

export const getCampBookingById = (id) => {
  return axios.get(`${API_BASE_URL}/camp-booking/${id}`);
};

export const getCampBookings = (campId) => {
  return axios.get(`${API_BASE_URL}/camp-booking/camp/${campId}`);
};

export const getDonorBookings = (donorId) => {
  return axios.get(`${API_BASE_URL}/camp-booking/donor/${donorId}`);
};

export const checkDonorBooking = (campId, donorId) => {
  return axios.get(`${API_BASE_URL}/camp-booking/check/${campId}/${donorId}`);
};

export const updateCampBooking = (id, bookingData) => {
  return axios.put(`${API_BASE_URL}/camp-booking/${id}`, bookingData);
};

export const cancelCampBooking = (id) => {
  return axios.delete(`${API_BASE_URL}/camp-booking/${id}`);
};

export const getCampAvailability = (campId) => {
  return axios.get(`${API_BASE_URL}/camp-booking/availability/${campId}`);
};

// Emergency Request API calls
export const createEmergencyRequest = (requestData) => {
  return axios.post(`${API_BASE_URL}/emergency-request`, requestData);
};

export const getAllEmergencyRequests = () => {
  return axios.get(`${API_BASE_URL}/emergency-request`);
};

export const getEmergencyRequestById = (id) => {
  return axios.get(`${API_BASE_URL}/emergency-request/${id}`);
};

export const getEmergencyRequestsByHospital = (hospitalId) => {
  return axios.get(`${API_BASE_URL}/emergency-request/hospital/${hospitalId}`);
};

export const getEmergencyRequestsByBloodType = (bloodType) => {
  return axios.get(`${API_BASE_URL}/emergency-request/blood-type/${bloodType}`);
};

export const getEmergencyRequestsByCity = (city) => {
  return axios.get(`${API_BASE_URL}/emergency-request/city/${city}`);
};

export const updateEmergencyRequest = (id, requestData) => {
  return axios.put(`${API_BASE_URL}/emergency-request/${id}`, requestData);
};

export const deleteEmergencyRequest = (id) => {
  return axios.delete(`${API_BASE_URL}/emergency-request/${id}`);
};

// Blood Unit API calls
export const createBloodUnit = (unitData) => {
  return axios.post(`${API_BASE_URL}/blood-unit`, unitData);
};

export const getAllBloodUnits = () => {
  return axios.get(`${API_BASE_URL}/blood-unit`);
};

export const getBloodUnitById = (id) => {
  return axios.get(`${API_BASE_URL}/blood-unit/${id}`);
};

export const getBloodUnitsByHospital = (hospitalId) => {
  return axios.get(`${API_BASE_URL}/blood-unit/hospital/${hospitalId}`);
};

export const getBloodUnitsByBloodType = (bloodType) => {
  return axios.get(`${API_BASE_URL}/blood-unit/blood-type/${bloodType}`);
};

export const updateBloodUnit = (id, unitData) => {
  return axios.put(`${API_BASE_URL}/blood-unit/${id}`, unitData);
};

export const deleteBloodUnit = (id) => {
  return axios.delete(`${API_BASE_URL}/blood-unit/${id}`);
};

// Notification API calls
export const getAllNotifications = () => {
  return axios.get(`${API_BASE_URL}/notification`);
};

export const getNotificationById = (id) => {
  return axios.get(`${API_BASE_URL}/notification/${id}`);
};

export const updateNotification = (id, notificationData) => {
  return axios.put(`${API_BASE_URL}/notification/${id}`, notificationData);
};

export const deleteNotification = (id) => {
  return axios.delete(`${API_BASE_URL}/notification/${id}`);
};

// Chatbot API calls
export const getChatbotResponse = (message) => {
  return axios.post(`${API_BASE_URL}/chatbot/message`, { userMessage: message });
};

export const getChatbotSuggestions = () => {
  return axios.get(`${API_BASE_URL}/chatbot/suggestions`);
};

export const getChatbotHealth = () => {
  return axios.get(`${API_BASE_URL}/chatbot/health`);
};

export const testChatbot = () => {
  return axios.post(`${API_BASE_URL}/chatbot/test`);
};

export const saveChatMessage = (userMessage, botResponse, donorId, sessionId, suggestions = []) => {
  return axios.post(`${API_BASE_URL}/chatbot/save`, {
    userMessage,
    botResponse,
    donorId: donorId || null,
    sessionId,
    suggestionsJson: JSON.stringify(suggestions)
  });
};

export const getChatHistory = (sessionId) => {
  return axios.get(`${API_BASE_URL}/chatbot/history/${sessionId}`);
};

export const getDonorChatHistory = (donorId) => {
  return axios.get(`${API_BASE_URL}/chatbot/donor-history/${donorId}`);
};

export const getDonorSessionChatHistory = (donorId, sessionId) => {
  return axios.get(`${API_BASE_URL}/chatbot/donor-session/${donorId}/${sessionId}`);
};

export const clearChatHistory = (sessionId) => {
  return axios.delete(`${API_BASE_URL}/chatbot/clear/${sessionId}`);
};

export const searchChatHistory = (keyword) => {
  return axios.get(`${API_BASE_URL}/chatbot/search/${keyword}`);
};
