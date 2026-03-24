// Authentication Helper Functions
export const authHelper = {
  // Save user session
  saveUserSession: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return localStorage.getItem('user') !== null;
  },

  // Get user role
  getUserRole: () => {
    const user = authHelper.getCurrentUser();
    return user ? user.role : null;
  },

  // Check if user has specific role
  hasRole: (role) => {
    const userRole = authHelper.getUserRole();
    return userRole === role;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('user');
  },

  // Get user ID
  getUserId: () => {
    const user = authHelper.getCurrentUser();
    return user ? user.userId : null;
  },
};

// Blood Group Options
export const bloodGroups = [
  { value: 'A_POSITIVE', label: 'A+' },
  { value: 'A_NEGATIVE', label: 'A-' },
  { value: 'B_POSITIVE', label: 'B+' },
  { value: 'B_NEGATIVE', label: 'B-' },
  { value: 'AB_POSITIVE', label: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB-' },
  { value: 'O_POSITIVE', label: 'O+' },
  { value: 'O_NEGATIVE', label: 'O-' },
];

// Urgency Levels
export const urgencyLevels = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

// Request Status
export const requestStatuses = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'REJECTED', label: 'Rejected' },
];

// Appointment Status
export const appointmentStatuses = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
];

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date-time
export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get status badge color
export const getStatusColor = (status) => {
  const colors = {
    PENDING: '#FFA500',
    APPROVED: '#4CAF50',
    DELIVERED: '#2196F3',
    REJECTED: '#F44336',
    SCHEDULED: '#2196F3',
    COMPLETED: '#4CAF50',
    CANCELLED: '#F44336',
    NO_SHOW: '#9E9E9E',
    LOW: '#4CAF50',
    MEDIUM: '#FFA500',
    HIGH: '#FF5722',
    CRITICAL: '#F44336',
  };
  return colors[status] || '#9E9E9E';
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default {
  authHelper,
  bloodGroups,
  urgencyLevels,
  requestStatuses,
  appointmentStatuses,
  formatDate,
  formatDateTime,
  getStatusColor,
  calculateAge,
};
