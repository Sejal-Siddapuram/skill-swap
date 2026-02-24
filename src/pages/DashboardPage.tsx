import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';
import { handleApiError } from '../utils/helpers';//turns backend errors into readable messages 
import './DashboardPage.css';

interface Booking {//how booking data will come from backend 
  _id: string;
  teacher: { _id: string; name: string; email: string };
  learner: { _id: string; name: string; email: string };
  skill: string;
  status: string;
  creditAmount: number;
  dateTime: string;
  duration: number;
  completedByLearner: boolean;
  completedByTeacher: boolean;
  notes?: string;
  createdAt: string;
}

export default function DashboardPage() {//stars the sessions dashboard page 
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('requests');//default active tab = requests 
  const [creditBalance, setCreditBalance] = useState(user?.creditBalance || 10);
  
  const [requests, setRequests] = useState<Booking[]>([]);
  const [myRequests, setMyRequests] = useState<Booking[]>([]);
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [completed, setCompleted] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const tabs = [
    { id: 'requests', label: 'Session Requests' },
    { id: 'my-requests', label: 'My Requests' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' }
  ];

  const fetchBookings = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Making 5 API requests at the same time:
//
// An API request = the frontend asking the backend for data or to perform an action.
// The backend verifies the token, checks the database, runs logic, and returns the result.
//
// Requests we are making:
// - /bookings/requests      → Students requesting sessions from YOU (you = teacher)
// - /bookings/my-requests   → Sessions YOU requested from others (you = learner)
// - /bookings/upcoming      → Your confirmed but not yet completed sessions
// - /bookings/com

      const [requestsRes, myRequestsRes, upcomingRes, completedRes, profileRes] = await Promise.all([
        axios.get('/bookings/requests', config),
        axios.get('/bookings/my-requests', config),
        axios.get('/bookings/upcoming', config),
        axios.get('/bookings/completed', config),
        axios.get('/profile', config)
      ]);

      setRequests(requestsRes.data);
      setMyRequests(myRequestsRes.data);
      setUpcoming(upcomingRes.data);
      setCompleted(completedRes.data);
      setCreditBalance(profileRes.data.creditBalance);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // First, cleanup any orphaned bookings and refund credits
    const cleanupAndFetch = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };//If a session was not accepted/rejected on time
        const response = await axios.get('/bookings/cleanup-orphaned', config);//AND it’s expired → credits refunded → booking deleted
        if (response.data.creditsRefunded > 0) {
          console.log(`Credits refunded: ${response.data.creditsRefunded}`);
          // Refresh user data to update credit balance
          window.location.reload();
          return;
        }
      } catch (error) {
        console.log('No orphaned bookings to clean up');
      }
      // Then fetch bookings
      fetchBookings();
    };
    
    cleanupAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);//rerun the function when the token changes 

  const handleAccept = async (bookingId: string) => {/*This runs when TEACHER clicks "Accept" on a booking.*/
    setActionLoading(bookingId);/*This sets actionLoading to the booking’s ID.
                                  Purpose: Disable just that booking’s buttons (Accept/Reject) to prevent double clicks.*/
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/bookings/${bookingId}/accept`, {}, config);
      await fetchBookings();
      alert('Session request accepted!');
    } catch (error) {
      alert(handleApiError(error));
    } finally {
      setActionLoading(null);//now buttons re enable
    }
  };

  const handleReject = async (bookingId: string) => {/*if teacher rejects*/
    if (!window.confirm('Are you sure you want to reject this session request?')) return;
    
    setActionLoading(bookingId);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/bookings/${bookingId}/reject`, {}, config);
      await fetchBookings();
      alert('Session request rejected.');
    } catch (error) {
      alert(handleApiError(error));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (bookingId: string) => {//learner cancels their own request
    if (!window.confirm('Are you sure you want to cancel this session?')) return;
    
    setActionLoading(bookingId);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/bookings/${bookingId}/cancel`, {}, config);
      await fetchBookings(); // This will refresh credit balance
      alert('Session cancelled. Credits refunded.');
    } catch (error) {
      alert(handleApiError(error));
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (bookingId: string, completedBy: 'learner' | 'teacher') => {//has to be marked completed by both
    setActionLoading(bookingId);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/bookings/${bookingId}/complete`, { completedBy }, config);
      await fetchBookings(); // This will refresh credit balance
      alert('Session completion status updated.');
    } catch (error) {
      alert(handleApiError(error));
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const BookingCard = ({ booking, userType }: { booking: Booking; userType: 'teacher' | 'learner' }) => {
    const isTeacher = userType === 'teacher';
    const otherPerson = isTeacher ? booking.learner : booking.teacher;

    return (
      <div className="booking-card">
        <div className="booking-header">
          <div>
            <h3 className="booking-skill">{booking.skill}</h3>
            <p className="booking-person">
              {isTeacher ? `Learner:` : `Teacher:`} {otherPerson.name}
            </p>
          </div>
          <div className={`booking-status ${booking.status.toLowerCase()}`}>
            {booking.status}
          </div>
        </div>
        
        <div className="booking-details">
          <div className="booking-detail-item">
            <span className="detail-label">📅</span>
            <span>{formatDateTime(booking.dateTime)}</span>
          </div>
          <div className="booking-detail-item">
            <span className="detail-label">⏱️</span>
            <span>{booking.duration} hour{booking.duration !== 1 ? 's' : ''}</span>
          </div>
          <div className="booking-detail-item">
            <span className="detail-label">💳</span>
            <span>{booking.creditAmount} credits</span>
          </div>
        </div>

        {booking.notes && (
          <div className="booking-notes">
            <strong>Notes:</strong> {booking.notes}
          </div>
        )}

        <div className="booking-actions">
          {booking.status === 'Requested' && isTeacher && (//teacher can accept or reject a requested session
            <>
              <button 
                className="action-btn accept-btn"
                onClick={() => handleAccept(booking._id)}
                disabled={actionLoading === booking._id}
              >
                Accept
              </button>
              <button 
                className="action-btn reject-btn"
                onClick={() => handleReject(booking._id)}
                disabled={actionLoading === booking._id}
              >
                Reject
              </button>
            </>
          )}
          
          {booking.status === 'Requested' && !isTeacher && (//user can cancel the session they booked.
            <button 
              className="action-btn cancel-btn"
              onClick={() => handleCancel(booking._id)}
              disabled={actionLoading === booking._id}
            >
              Cancel Request
            </button>
          )}

          {booking.status === 'Confirmed' && (
            <button 
              className="action-btn complete-btn"
              onClick={() => handleComplete(booking._id, isTeacher ? 'teacher' : 'learner')}
              disabled={actionLoading === booking._id}
            >
              {isTeacher ? booking.completedByTeacher ? '✓ Marked Complete by You' : 'Mark Complete' 
                       : booking.completedByLearner ? '✓ Marked Complete by You' : 'Mark Complete'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="sessions-page-container">
      <div className="sessions-page-content">
        {/* Header */}
        <div className="sessions-header">
          <div className="header-left">
            <div className="header-title">
              <span className="calendar-icon">📅</span>
              <h1>My Sessions</h1>
            </div>
            <p className="header-subtitle">Manage your bookings and sessions</p>
          </div>
          <div className="header-actions">
            <div className="credit-balance-btn">
              <span>💳</span>
              <span>{creditBalance} credits</span>
            </div>
            <Link to="/" className="header-btn">{/*click this to go to homepage where we can discover teachers and skills*/}
              <span>👁️</span>
              <span>Discover</span>
            </Link>
            <Link to="/profile" className="header-btn">
              <span>👤</span>
              <span>Profile</span>
            </Link>
            <button onClick={logout} className="header-btn">
              <span>↗️</span>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="sessions-main-card">
          {/* Tabs */}
          <div className="tabs-container">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}//when u click on a tab sets it as active tab
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <>
                {activeTab === 'requests' && (
                  <div className="requests-section">
                    <div className="section-header">
                      <div className="section-title">
                        <span className="section-icon">⚠️</span>
                        <h2>Session Requests</h2>
                      </div>
                      <p className="section-description">Students requesting to learn from you.</p>
                    </div>
                    
                    {requests.length === 0 ? (//no students requested sessions
                      <div className="empty-state">
                        <div className="empty-icon">🕐</div>
                        <h3>No pending requests</h3>
                        <p>When students request sessions with you, they'll appear here.</p>
                      </div>
                    ) : (
                      <div className="bookings-grid">
                        {requests.map(booking => (
                          <BookingCard key={booking._id} booking={booking} userType="teacher" />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'my-requests' && (
                  <div className="my-requests-section">
                    <div className="section-header">
                      <div className="section-title">
                        <span className="section-icon">📤</span>
                        <h2>My Requests</h2>
                      </div>
                      <p className="section-description">Sessions you've requested from other teachers.</p>
                    </div>
                    
                    {myRequests.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <h3>No requests sent</h3>
                        <p>When you request sessions with teachers, they'll appear here.</p>
                      </div>
                    ) : (
                      <div className="bookings-grid">
                        {myRequests.map(booking => (
                          <BookingCard key={booking._id} booking={booking} userType="learner" />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'upcoming' && (
                  <div className="upcoming-section">
                    <div className="section-header">
                      <div className="section-title">
                        <span className="section-icon">📅</span>
                        <h2>Upcoming Sessions</h2>
                      </div>
                      <p className="section-description">Your confirmed sessions.</p>
                    </div>
                    
                    {upcoming.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">⏰</div>
                        <h3>No upcoming sessions</h3>
                        <p>Your scheduled sessions will appear here.</p>
                      </div>
                    ) : (
                      <div className="bookings-grid">
                        {upcoming.map(booking => (
                          <BookingCard key={booking._id} booking={booking} userType={user?.id === booking.teacher._id ? 'teacher' : 'learner'} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'completed' && (
                  <div className="completed-section">
                    <div className="section-header">
                      <div className="section-title">
                        <span className="section-icon">✅</span>
                        <h2>Completed Sessions</h2>
                      </div>
                      <p className="section-description">Your finished sessions.</p>
                    </div>
                    
                    {completed.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">🎉</div>
                        <h3>No completed sessions</h3>
                        <p>Your completed sessions will appear here.</p>
                      </div>
                    ) : (
                      <div className="bookings-grid">
                        {completed.map(booking => (
                          <BookingCard key={booking._id} booking={booking} userType={user?.id === booking.teacher._id ? 'teacher' : 'learner'} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
