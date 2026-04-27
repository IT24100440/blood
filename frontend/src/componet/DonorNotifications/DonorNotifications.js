import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DonorNotifications.css';

const DonorNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const donorId = localStorage.getItem('donorId');

    useEffect(() => {
        if (donorId) {
            fetchDonorNotifications();
        } else {
            setLoading(false);
        }
    }, [donorId]);

    const fetchDonorNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8080/api/notifications/donor/${donorId}`);
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`http://localhost:8080/api/notifications/${notificationId}`, {
                status: 'READ'
            });
            fetchDonorNotifications();
        } catch (error) {
            console.error('Error updating notification:', error);
        }
    };

    const filterNotifications = () => {
        if (filter === 'all') return notifications;
        return notifications.filter(n => n.status === filter);
    };

    const filtered = filterNotifications();

    if (!donorId) {
        return (
            <div className="notifications-container">
                <div className="login-message">
                    <p>Please login to see emergency notifications</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="notifications-container">
                <div className="loading">Loading notifications...</div>
            </div>
        );
    }

    return (
      
                </div>
            </div>

            <div className="filter-buttons">
                <button 
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({notifications.length})
                </button>
                <button 
                    className={`filter-btn ${filter === 'SENT' ? 'active' : ''}`}
                    onClick={() => setFilter('SENT')}
                >
                    New ({notifications.filter(n => n.status === 'SENT').length})
                </button>
                <button 
                    className={`filter-btn ${filter === 'READ' ? 'active' : ''}`}
                    onClick={() => setFilter('READ')}
                >
                    Viewed ({notifications.filter(n => n.status === 'READ').length})
                </button>
            </div>

            {filtered.length === 0 ? (
                <div className="no-notifications">
                    <p>No emergency alerts at this time</p>
                    <p className="subtitle">We'll notify you immediately when someone needs your blood type</p>
                </div>
            ) : (
                <div className="notifications-list">
                    {filtered.map(notification => (
                        <div 
                            key={notification.notificationId} 
                            className={`notification-card ${notification.status === 'SENT' ? 'unread' : 'read'}`}
                        >
                            <div className="notification-header">
                                <div className="notification-badge">
                                    🚨 {notification.request?.bloodTypeNeeded || 'BLOOD'}
                                </div>
                                <span className="notification-status">
                                    {notification.status === 'SENT' ? '🔴 New' : '✓ Viewed'}
                                </span>
                            </div>

                            <div className="notification-content">
                                <h3>{notification.request?.title}</h3>
                                <p className="message">{notification.message}</p>

                                <div className="request-details">
                                    <div className="detail-item">
                                        <span className="label">🏥 Hospital:</span>
                                        <span className="value">{notification.request?.hospital?.hospitalName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">📍 Location:</span>
                                        <span className="value">{notification.request?.city}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">🩸 Units Needed:</span>
                                        <span className="value">{notification.request?.requiredUnits} units</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">⚠️ Urgency:</span>
                                        <span className={`urgency urgency-${notification.request?.urgencyLevel?.toLowerCase()}`}>
                                            {notification.request?.urgencyLevel}
                                        </span>
                                    </div>
                                </div>

                                {notification.request?.description && (
                                    <div className="description">
                                        <strong>Details:</strong>
                                        <p>{notification.request.description}</p>
                                    </div>
                                )}

                                <div className="contact-info">
                                    <strong>Contact for donation:</strong>
                                    <p>📞 {notification.request?.contactNumber}</p>
                                </div>
                            </div>

                            <div className="notification-footer">
                                <span className="timestamp">
                                    {new Date(notification.sentAt).toLocaleString()}
                                </span>
                                {notification.status === 'SENT' && (
                                    <button 
                                        className="mark-read-btn"
                                        onClick={() => markAsRead(notification.notificationId)}
                                    >
                                        Mark as Viewed
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DonorNotifications;
