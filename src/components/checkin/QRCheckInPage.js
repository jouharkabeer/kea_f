import React, { useState, useEffect, useRef } from 'react';
import { 
  scanQRForEventCheckIn, 
  confirmEventCheckIn, 
  getEventAttendance, 
  getEventsList 
} from '../../api/EventCheckInApi';
import './QRCheckInPage.css';
import QrScanner from 'qr-scanner';

const QRCheckInPage = () => {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [events, setEvents] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [showAttendance, setShowAttendance] = useState(false);
  const [manualUserId, setManualUserId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentView, setCurrentView] = useState('scanner');
  const [showCamera, setShowCamera] = useState(false);
  
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningError, setScanningError] = useState('');
  
  // Enhanced camera states
  const [cameraError, setCameraError] = useState('');
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const [isSecureContext, setIsSecureContext] = useState(false);
  const [deviceCapabilities, setDeviceCapabilities] = useState({
    hasCamera: false,
    supportsGetUserMedia: false
  });

  // Refs for smooth scrolling to sections
  const eventSectionRef = useRef(null);
  const scannerSectionRef = useRef(null);
  const userIdSectionRef = useRef(null);
  const resultSectionRef = useRef(null);
  const attendanceSectionRef = useRef(null);

  // Mobile navigation helper
  const scrollToSection = (sectionRef, offset = 80) => {
    if (sectionRef.current && window.innerWidth <= 768) {
      const element = sectionRef.current;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Check device capabilities and security context on mount
  useEffect(() => {
    const checkCapabilities = () => {
      const isSecure = window.location.protocol === 'https:' || 
                      window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';
      setIsSecureContext(isSecure);

      const supportsGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasCamera = supportsGetUserMedia && 
                       (navigator.mediaDevices.enumerateDevices !== undefined);

      setDeviceCapabilities({
        hasCamera,
        supportsGetUserMedia
      });

      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'camera' })
          .then(result => {
            setPermissionStatus(result.state);
            result.addEventListener('change', () => {
              setPermissionStatus(result.state);
            });
          })
          .catch(err =>  console.log('Permission query not supported:', err.name));
      }
    };

    checkCapabilities();
  }, []);

  // Initialize QR Scanner
  const initializeQRScanner = async () => {
    if (!videoRef.current) {
      console.error('Video element not found');
      showMessage('error', 'Failed to initialize camera view');
      return;
    }

    try {
      // console.log('Initializing QR Scanner...');
      
      if (!QrScanner.hasCamera()) {
        throw new Error('No camera found on this device');
      }

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          // console.log('QR Code detected:', result.data);
          handleQRCodeDetected(result.data);
        },
        {
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 5,
          returnDetailedScanResult: true,
        }
      );

      await qrScannerRef.current.start();
      setIsScanning(true);
      setScanningError('');
      showMessage('success', '📷 QR Scanner started! Point camera at QR code');
      
    } catch (error) {
      console.error('QR Scanner initialization error:', error);
      setIsScanning(false);
      
      let errorMessage = 'Failed to start QR scanner';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is being used by another application.';
      }
      
      setScanningError(errorMessage);
      showMessage('error', errorMessage);
    }
  };

  // Handle QR code detection
  const handleQRCodeDetected = async (qrData) => {
    // console.log('QR Data detected:', qrData);
    
    try {
      let userId = '';
      
      if (qrData.includes('user_id=')) {
        const match = qrData.match(/user_id=([^&\s]+)/);
        userId = match ? match[1] : '';
      } else if (qrData.includes('USER_ID:')) {
        userId = qrData.split('USER_ID:')[1]?.split(/[\s,&]/)[0] || '';
      } else if (/^[a-zA-Z0-9-]+$/.test(qrData.trim())) {
        userId = qrData.trim();
      } else {
        const uuidMatch = qrData.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
        userId = uuidMatch ? uuidMatch[0] : '';
      }
      
      if (!userId) {
        showMessage('warning', `QR code detected but no User ID found. Data: ${qrData.substring(0, 50)}...`);
        return;
      }
      
      setManualUserId(userId);
      stopQRScanner();
      
      // Mobile: Scroll to User ID section
      setTimeout(() => {
        scrollToSection(userIdSectionRef);
      }, 300);
      
      showMessage('success', `✅ User ID detected: ${userId}`);
      
      if (selectedEvent) {
        setTimeout(() => {
          handleScanUser(userId);
        }, 500);
      } else {
        showMessage('warning', 'Please select an event first, then click "Verify User"');
        setTimeout(() => {
          scrollToSection(eventSectionRef);
        }, 1000);
      }
      
    } catch (error) {
      console.error('QR code processing error:', error);
      showMessage('error', 'Error processing QR code data');
    }
  };

  const startCamera = async () => {
    setCameraError('');
    setScanningError('');
    
    try {
      if (!isSecureContext) {
        const errorMsg = 'Camera requires HTTPS or localhost. Please use https:// or run on localhost.';
        setCameraError(errorMsg);
        showMessage('error', 'Camera requires secure connection (HTTPS)');
        return;
      }

      if (!deviceCapabilities.supportsGetUserMedia) {
        const errorMsg = 'Camera not supported in this browser. Try Chrome, Firefox, or Safari.';
        setCameraError(errorMsg);
        showMessage('error', 'Camera not supported in this browser');
        return;
      }

      showMessage('info', 'Starting camera and QR scanner...');
      
      setShowCamera(true);
      setCameraError('');
      
      setTimeout(() => {
        if (videoRef.current) {
          initializeQRScanner();
        } else {
          console.error('Video element still not found after timeout');
          showMessage('error', 'Failed to initialize camera view');
          setShowCamera(false);
        }
      }, 100);
      
    } catch (error) {
      console.error('Camera error:', error);
      setShowCamera(false);
      setCameraError(`Camera error: ${error.message}`);
      showMessage('error', 'Failed to start camera');
    }
  };

  const stopQRScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
      setIsScanning(false);
      // console.log('QR Scanner stopped');
    }
  };

  const stopCamera = () => {
    stopQRScanner();
    setShowCamera(false);
    setCameraError('');
    setScanningError('');
    showMessage('info', 'Camera and QR scanner stopped');
  };

  useEffect(() => {
    return () => {
      stopQRScanner();
      // console.log('Component unmount: QR scanner cleaned up');
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isScanning) {
        stopQRScanner();
        // console.log('Tab hidden, pausing QR scanner');
      } else if (!document.hidden && showCamera && !isScanning && videoRef.current) {
        // console.log('Tab visible, restarting QR scanner');
        initializeQRScanner();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showCamera, isScanning]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await getEventsList();
      // Normalize to array in case API returns wrapped data
      const normalized = Array.isArray(response)
        ? response
        : (response?.results || response?.events || []);
      setEvents(normalized);
    } catch (error) {
      console.error('Error loading events:', error);
      showMessage('error', 'Failed to load events. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 7000);
  };

  const handleScanUser = async (userId = null) => {
    const userIdToScan = userId || manualUserId.trim();
    
    if (!selectedEvent) {
      showMessage('error', 'Please select an event first');
      setTimeout(() => {
        scrollToSection(eventSectionRef);
      }, 500);
      return;
    }

    if (!userIdToScan) {
      showMessage('error', 'Please enter a User ID or scan QR code');
      setTimeout(() => {
        scrollToSection(userIdSectionRef);
      }, 500);
      return;
    }

    setLoading(true);
    try {
      const response = await scanQRForEventCheckIn(userIdToScan, selectedEvent);
      setScanResult(response);
      
      // Mobile: Scroll to results section
      setTimeout(() => {
        scrollToSection(resultSectionRef);
      }, 300);
      
      if (showCamera) {
        stopCamera();
      }
      
      switch (response.status) {
        case 'ready_for_checkin':
          showMessage('success', 'User verified and ready for check-in!');
          break;
        case 'already_checked_in':
          showMessage('warning', 'User is already checked in');
          break;
        case 'not_registered':
          showMessage('error', 'User is not registered for this event');
          break;
        case 'membership_inactive':
        case 'membership_expired':
          showMessage('warning', response.message);
          break;
        default:
          showMessage('info', response.message || 'User verification completed');
      }
    } catch (error) {
      console.error('Error scanning QR:', error);
      showMessage('error', 'Failed to verify user. Please check your connection.');
      setScanResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!scanResult?.registration_id) {
      showMessage('error', 'No registration ID found');
      return;
    }

    setLoading(true);
    try {
      const response = await confirmEventCheckIn(scanResult.registration_id);
      showMessage('success', 'User successfully checked in!');
      setScanResult(null);
      setManualUserId('');
      
      // Mobile: Scroll back to scanner section for next user
      setTimeout(() => {
        scrollToSection(scannerSectionRef);
      }, 1000);
      
      if (currentView === 'attendance' && selectedEvent) {
        await loadAttendance();
      }
    } catch (error) {
      console.error('Error confirming check-in:', error);
      showMessage('error', 'Failed to confirm check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    if (!selectedEvent) {
      showMessage('error', 'Please select an event first');
      setTimeout(() => {
        scrollToSection(eventSectionRef);
      }, 500);
      return;
    }

    setLoading(true);
    try {
      const response = await getEventAttendance(selectedEvent);
      setAttendanceData(response);
    } catch (error) {
      console.error('Error loading attendance:', error);
      showMessage('error', 'Failed to load attendance data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAttendance = async () => {
    setCurrentView('attendance');
    await loadAttendance();
    
    // Mobile: Scroll to attendance section
    setTimeout(() => {
      scrollToSection(attendanceSectionRef);
    }, 300);
  };

  const resetAll = () => {
    setScanResult(null);
    setManualUserId('');
    setMessage({ type: '', text: '' });
    stopCamera();
    
    // Mobile: Scroll back to scanner section
    setTimeout(() => {
      scrollToSection(scannerSectionRef);
    }, 300);
  };

  const handleLoadUserFromAttendance = (userId) => {
    setManualUserId(userId);
    setCurrentView('scanner');
    
    // Mobile: Scroll to User ID section
    setTimeout(() => {
      scrollToSection(userIdSectionRef);
    }, 300);
    
    showMessage('info', `User ID ${userId} loaded for verification`);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ready_for_checkin':
        return 'qr-status-badge ready';
      case 'already_checked_in':
        return 'qr-status-badge checked-in';
      case 'not_registered':
        return 'qr-status-badge not-registered';
      case 'membership_inactive':
      case 'membership_expired':
        return 'qr-status-badge inactive';
      default:
        return 'qr-status-badge default';
    }
  };

  const selectedEventData = Array.isArray(events)
    ? events.find(event => String(event.event_id) === String(selectedEvent))
    : null;

  return (
    <div className="qr-checkin-page">
      {/* Header */}
      <div className="qr-header">
        <div className="qr-header-container">
          <div className="qr-header-content">
            <div>
              <h1 className="qr-header-title">Event Check-in System</h1>
              <p className="qr-header-subtitle">Scan QR codes and manage event attendance</p>
              
              <div className="qr-security-status">
                {isSecureContext ? '🔒 Secure Connection' : '⚠️ Insecure Connection - Camera may not work'}
              </div>
            </div>
            <div className="qr-nav-buttons">
              <button
                onClick={() => {
                  setCurrentView('scanner');
                  setTimeout(() => scrollToSection(scannerSectionRef), 100);
                }}
                className={`qr-nav-button ${currentView === 'scanner' ? 'active' : 'inactive'}`}
              >
                Scanner
              </button>
              <button
                onClick={handleViewAttendance}
                disabled={!selectedEvent || loading}
                className={`qr-nav-button ${currentView === 'attendance' ? 'active' : 'inactive'}`}
              >
                Attendance
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="qr-main-content">
        {/* Message Display */}
        {message.text && (
          <div className={`qr-message ${message.type} qr-fade-in`}>
            <div className="qr-message-content">
              <div className="qr-message-icon">
                {message.type === 'success' ? '✅' :
                 message.type === 'error' ? '❌' :
                 message.type === 'warning' ? '⚠️' : 'ℹ️'}
              </div>
              <div>
                <p className="qr-message-text">{message.text}</p>
              </div>
            </div>
          </div>
        )}

        {/* System Status Card */}
        {(!isSecureContext || !deviceCapabilities.supportsGetUserMedia) && (
          <div className="qr-system-warning">
            <h3>⚠️ System Requirements</h3>
            <div>
              {!isSecureContext && (
                <div>
                  <strong>HTTPS Required:</strong> Camera access requires a secure connection.
                  <br />Current: {window.location.protocol}//{window.location.host}
                </div>
              )}
              {!deviceCapabilities.supportsGetUserMedia && (
                <div>
                  <strong>Browser Support:</strong> Your browser doesn't support camera access.
                  Try Chrome, Firefox, or Safari.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Event Selection */}
        <div ref={eventSectionRef} className="qr-card qr-fade-in">
          <h2 className="qr-card-title">Select Event</h2>
          <select
            value={selectedEvent}
            onChange={(e) => {
              setSelectedEvent(e.target.value);
              setScanResult(null);
              setAttendanceData(null);
            }}
            className="qr-event-select"
            disabled={loading}
          >
            <option value="">Choose an event...</option>
            {events.map((event) => (
              <option key={event.event_id} value={event.event_id}>
                {event.event_name} - {event.event_sub_name} 
                ({new Date(event.event_time).toLocaleDateString()})
              </option>
            ))}
          </select>
          
          {selectedEventData && (
            <div className="qr-event-details qr-fade-in">
              <h3 className="qr-event-details-title">Event Details:</h3>
              <div className="qr-event-details-grid">
                <div><strong>Location:</strong> {selectedEventData.location}</div>
                <div><strong>Time:</strong> {new Date(selectedEventData.event_time).toLocaleString()}</div>
                <div><strong>Member Fee:</strong> ₹{selectedEventData.fee_for_member}</div>
                <div><strong>External Fee:</strong> ₹{selectedEventData.fee_for_external}</div>
              </div>
            </div>
          )}
        </div>

        {/* Scanner View */}
        {currentView === 'scanner' && (
          <div className="qr-scanner-section">
            {/* QR Scanner Section */}
            <div ref={scannerSectionRef} className="qr-card qr-fade-in">
              <h2 className="qr-card-title">QR Code Scanner</h2>
              
              {/* Camera Scanner Button */}
              <div className="qr-camera-section">
                <button
                  onClick={showCamera ? stopCamera : startCamera}
                  disabled={loading || !selectedEvent || !isSecureContext || !deviceCapabilities.supportsGetUserMedia}
                  className={`qr-button qr-camera-button ${showCamera ? 'stop' : 'start'}`}
                >
                  {showCamera ? '⏹️ Stop Camera' : '📸 Open Camera Scanner'}
                </button>
                
                {(permissionStatus !== 'prompt' || cameraError) && (
                  <div className="qr-camera-status">
                    Status: {permissionStatus === 'granted' ? '✓ Camera Access Granted' : 
                            permissionStatus === 'denied' ? '✗ Camera Access Denied' : 
                            '⏳ Permission Pending'}
                  </div>
                )}
              </div>

              {/* Camera Error Display */}
              {cameraError && (
                <div className="qr-camera-error">
                  <h4>📷 Camera Access Issue</h4>
                  <p>{cameraError}</p>
                  
                  <details className="qr-troubleshooting">
                    <summary>🔧 Troubleshooting Guide</summary>
                    <div>
                      <div>
                        <strong>1. Check Connection Security:</strong>
                        <div>
                          Current: <code>{window.location.origin}</code><br/>
                          ✅ Secure: https:// or localhost<br/>
                          ❌ Insecure: http:// (except localhost)
                        </div>
                      </div>
                      
                      <div>
                        <strong>2. Grant Browser Permission:</strong>
                        <div>
                          • Look for camera icon 📷 in address bar<br/>
                          • Click and select "Allow"<br/>
                          • Refresh the page
                        </div>
                      </div>
                      
                      <div>
                        <strong>3. Try Different Browsers:</strong>
                        <div>Chrome (recommended) → Firefox → Safari</div>
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {/* Enhanced Camera Display */}
              {showCamera && (
                <div className="qr-camera-container">
                  {isScanning && (
                    <div className="qr-camera-status-indicator">
                      🎥 LIVE - Scanning for QR Codes
                    </div>
                  )}
                  
                  <video
                    ref={videoRef}
                    className="qr-camera-video"
                    playsInline
                    muted
                  />
                  
                  <div className="qr-camera-instructions">
                    📱 <strong>Position QR code in camera view</strong><br/>
                    💡 Scanner will automatically detect QR codes<br/>
                    🔄 Processing {isScanning ? 'active' : 'initializing'}...
                  </div>
                  
                  {scanningError && (
                    <div className="qr-scanning-error">
                      {scanningError}
                    </div>
                  )}
                  
                  <div className="qr-camera-controls">
                    <button onClick={stopCamera} className="qr-button qr-stop-button">
                      ⏹️ Stop Camera
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User ID Input Section */}
            <div ref={userIdSectionRef} className="qr-card qr-fade-in">
              <h2 className="qr-card-title">Manual User Verification</h2>
              
              <div className="qr-input-group">
                <label className="qr-input-label">
                  User ID (from QR Code)
                </label>
                <div className="qr-input-row">
                  <input
                    type="text"
                    value={manualUserId}
                    onChange={(e) => setManualUserId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleScanUser()}
                    placeholder="Scan QR code or enter User ID..."
                    className="qr-input"
                    disabled={loading}
                  />
                  <button
                    onClick={() => handleScanUser()}
                    disabled={loading || !selectedEvent || !manualUserId.trim()}
                    className="qr-button primary"
                  >
                    {loading ? 'Verifying...' : 'Verify User'}
                  </button>
                </div>
              </div>

              <div className="qr-clear-section">
                <button onClick={resetAll} className="qr-text-link">
                  Clear All
                </button>
              </div>

              {/* Instructions */}
              <div className="qr-instructions">
                <h3 className="qr-instructions-title">📱 How to use:</h3>
                <ol className="qr-instructions-list">
                  <li>Select an event from the dropdown above</li>
                  <li>Click "📸 Open Camera Scanner" to access camera</li>
                  <li>Allow camera permissions when prompted</li>
                  <li>Position the QR code in the camera view</li>
                  <li>The scanner will automatically detect and read the QR code</li>
                  <li>User ID will be filled automatically</li>
                  <li>Click "Verify User" to check registration</li>
                  <li>If verified, click "Check In" to complete the process</li>
                </ol>
                
                <div className="qr-pro-tip">
                  <strong>💡 Pro Tip:</strong> For best scanning results, ensure good lighting and hold the QR code steady in the camera view. The scanner will automatically detect QR codes without clicking.
                </div>
              </div>
            </div>

            {/* Scan Results */}
            {scanResult && (
              <div ref={resultSectionRef} className="qr-result-card qr-fade-in">
                <div className="qr-result-header">
                  <h3 className="qr-result-title">Scan Result</h3>
                  <span className={getStatusBadgeClass(scanResult.status)}>
                    {scanResult.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="qr-result-message">{scanResult.message}</p>
                </div>

                {scanResult.user_info && (
                  <div className="qr-user-info-grid">
                    <div>
                      <h4 className="qr-info-section-title">👤 User Information</h4>
                      <div className="qr-info-list">
                        <div className="qr-info-item">
                          <span className="qr-info-label">Name:</span>
                          <span className="qr-info-value">{scanResult.user_info.username}</span>
                        </div>
                        <div className="qr-info-item">
                          <span className="qr-info-label">Email:</span>
                          <span className="qr-info-value">{scanResult.user_info.email}</span>
                        </div>
                        <div className="qr-info-item">
                          <span className="qr-info-label">Phone:</span>
                          <span className="qr-info-value">{scanResult.user_info.phone_number}</span>
                        </div>
                        <div className="qr-info-item">
                          <span className="qr-info-label">Company:</span>
                          <span className="qr-info-value">{scanResult.user_info.company_name || 'N/A'}</span>
                        </div>
                        <div className="qr-info-item">
                          <span className="qr-info-label">Type:</span>
                          <span className="qr-info-value" style={{ textTransform: 'capitalize' }}>{scanResult.user_info.user_type}</span>
                        </div>
                        {scanResult.user_info.fee_paid && (
                          <div className="qr-info-item">
                            <span className="qr-info-label">Fee Paid:</span>
                            <span className="qr-info-value fee">₹{scanResult.user_info.fee_paid}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {scanResult.event_info && (
                      <div>
                        <h4 className="qr-info-section-title">🎫 Event Information</h4>
                        <div className="qr-info-list">
                          <div className="qr-info-item">
                            <span className="qr-info-label">Event:</span>
                            <span className="qr-info-value">{scanResult.event_info.event_name} - {scanResult.event_info.event_sub_name}</span>
                          </div>
                          <div className="qr-info-item">
                            <span className="qr-info-label">Location:</span>
                            <span className="qr-info-value">{scanResult.event_info.location}</span>
                          </div>
                          <div className="qr-info-item">
                            <span className="qr-info-label">Time:</span>
                            <span className="qr-info-value">{new Date(scanResult.event_info.event_time).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="qr-action-buttons">
                  {scanResult.status === 'ready_for_checkin' && (
                    <button
                      onClick={handleConfirmCheckIn}
                      disabled={loading}
                      className="qr-button success large qr-checkin-button"
                    >
                      {loading ? 'Checking In...' : '✓ Check In User'}
                    </button>
                  )}
                  
                  <button
                    onClick={resetAll}
                    className="qr-button secondary"
                  >
                    Scan Another
                  </button>
                </div>

                {scanResult.checked_in_at && (
                  <div className="qr-already-checked-in">
                    <p>
                      <strong>Already checked in at:</strong> {new Date(scanResult.checked_in_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Attendance View */}
        {currentView === 'attendance' && (
          <div ref={attendanceSectionRef} className="qr-card qr-fade-in">
            <div className="qr-attendance-header">
              <div className="qr-attendance-header-content">
                <h2 className="qr-card-title">Event Attendance</h2>
                <div className="qr-attendance-actions">
                  <button
                    onClick={loadAttendance}
                    disabled={loading || !selectedEvent}
                    className="qr-button primary"
                  >
                    {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
                  </button>
                  {attendanceData && (
                    <button
                      onClick={() => {
                        const csvContent = [
                          ['Name', 'Email', 'Company', 'Fee Paid', 'Status', 'Check-in Time'],
                          ...attendanceData.attendees.map(attendee => [
                            attendee.username,
                            attendee.email,
                            attendee.company_name || 'N/A',
                            `₹${attendee.fee_paid}`,
                            attendee.checked_in ? 'Checked In' : 'Pending',
                            attendee.checked_in_at ? new Date(attendee.checked_in_at).toLocaleString() : '-'
                          ])
                        ].map(row => row.join(',')).join('\n');
                        
                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${selectedEventData?.event_name || 'event'}_attendance_${new Date().toISOString().split('T')[0]}.csv`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        showMessage('success', 'Attendance data exported successfully!');
                      }}
                      className="qr-button secondary qr-export-button"
                    >
                      📊 Export CSV
                    </button>
                  )}
                </div>
              </div>
            </div>

            {attendanceData && (
              <div className="qr-attendance-content">
                {/* Enhanced Statistics */}
                <div className="qr-stats-grid">
                  <div className="qr-stat-card blue">
                    <div className="qr-stat-number blue">{attendanceData.statistics.total_registered}</div>
                    <div className="qr-stat-label blue">Total Registered</div>
                  </div>
                  <div className="qr-stat-card green">
                    <div className="qr-stat-number green">{attendanceData.statistics.total_checked_in}</div>
                    <div className="qr-stat-label green">Checked In</div>
                  </div>
                  <div className="qr-stat-card yellow">
                    <div className="qr-stat-number yellow">{attendanceData.statistics.pending_checkin}</div>
                    <div className="qr-stat-label yellow">Pending</div>
                  </div>
                  <div className="qr-stat-card purple">
                    <div className="qr-stat-number purple">{attendanceData.statistics.attendance_rate}</div>
                    <div className="qr-stat-label purple">Attendance Rate</div>
                  </div>
                </div>

                {/* Quick Stats Summary */}
                <div className="qr-stats-summary">
                  <strong>Quick Summary:</strong> {attendanceData.statistics.total_checked_in} out of {attendanceData.statistics.total_registered} attendees have checked in 
                  ({attendanceData.statistics.attendance_rate} attendance rate). 
                  Last updated: {new Date().toLocaleTimeString()}
                </div>

                {/* Enhanced Attendees Table */}
                <div className="qr-table-container">
                  <table className="qr-table">
                    <thead>
                      <tr>
                        <th className="qr-table-header-mobile">#</th>
                        <th className="qr-table-header">Name</th>
                        <th className="qr-table-header qr-hide-mobile">Email</th>
                        <th className="qr-table-header qr-hide-mobile">Company</th>
                        <th className="qr-table-header qr-hide-tablet">Fee</th>
                        <th className="qr-table-header">Status</th>
                        <th className="qr-table-header qr-hide-mobile">Check-in Time</th>
                        <th className="qr-table-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.attendees.map((attendee, index) => (
                        <tr key={attendee.user_id} className="qr-table-row">
                          <td className="qr-table-cell qr-table-index">
                            {index + 1}
                          </td>
                          <td className="qr-table-cell qr-table-name">
                            <div className="qr-attendee-name">
                              <div className="qr-name-primary">{attendee.username}</div>
                              <div className="qr-name-secondary qr-show-mobile">
                                {attendee.email}
                                <br />
                                <span className="qr-user-type">{attendee.user_type}</span>
                              </div>
                              <div className="qr-name-secondary qr-hide-mobile">
                                {attendee.user_type}
                              </div>
                            </div>
                          </td>
                          <td className="qr-table-cell qr-hide-mobile">
                            <a href={`mailto:${attendee.email}`} className="qr-email-link">
                              {attendee.email}
                            </a>
                          </td>
                          <td className="qr-table-cell qr-hide-mobile">{attendee.company_name || 'N/A'}</td>
                          <td className="qr-table-cell qr-hide-tablet qr-fee-amount">
                            ₹{attendee.fee_paid}
                          </td>
                          <td className="qr-table-cell">
                            <span className={`qr-table-status-badge ${
                              attendee.checked_in ? 'checked-in' : 'pending'
                            }`}>
                              {attendee.checked_in ? '✓ In' : '⏳ Pending'}
                              <div className="qr-show-mobile qr-mobile-time">
                                {attendee.checked_in_at && (
                                  <small>{new Date(attendee.checked_in_at).toLocaleString()}</small>
                                )}
                              </div>
                            </span>
                          </td>
                          <td className="qr-table-cell qr-hide-mobile qr-checkin-time">
                            {attendee.checked_in_at ? (
                              <div>
                                <div className="qr-date">
                                  {new Date(attendee.checked_in_at).toLocaleDateString()}
                                </div>
                                <div className="qr-time">
                                  {new Date(attendee.checked_in_at).toLocaleTimeString()}
                                </div>
                              </div>
                            ) : '-'}
                          </td>
                          <td className="qr-table-cell">
                            <button
                              onClick={() => handleLoadUserFromAttendance(attendee.user_id)}
                              className="qr-load-button"
                              title="Load user for check-in"
                            >
                              📋 Load
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination info */}
                {attendanceData.attendees.length > 50 && (
                  <div className="qr-pagination-info">
                    Showing all {attendanceData.attendees.length} attendees
                  </div>
                )}
              </div>
            )}

            {!attendanceData && !loading && (
              <div className="qr-empty-state">
                <div className="qr-empty-icon">📊</div>
                <h3 className="qr-empty-title">No Attendance Data</h3>
                <p className="qr-empty-text">
                  Select an event and click "Refresh" to view attendance data
                </p>
              </div>
            )}

            {loading && (
              <div className="qr-loading-state">
                <div className="qr-loading-spinner"></div>
                <p>Loading attendance data...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="qr-footer">
        Event Check-in System v2.0 | 
        Camera: {deviceCapabilities.supportsGetUserMedia ? '✓ Supported' : '✗ Not Supported'} | 
        Connection: {isSecureContext ? '🔒 Secure' : '⚠️ Insecure'} | 
        Browser: {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                 navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                 navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'}
      </div>
    </div>
  );
};

export default QRCheckInPage;
                  