import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import companyLogo from './assets/exellar-logo.svg';
import smsIcon from './assets/sms-icon.svg';
import whatsappIcon from './assets/whatsapp-icon.svg';

// Dashboard Component
const Dashboard = ({ onLogout }) => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome to Your Dashboard</h1>
        <button 
          className="logout-btn" 
          onClick={onLogout}
        >
          Logout
        </button>
      </header>
      <main className="dashboard-content">
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h2>Profile</h2>
            <p>Manage your personal information and account settings</p>
          </div>
          <div className="dashboard-card">
            <h2>Activity</h2>
            <p>View your recent activity and transactions</p>
          </div>
          <div className="dashboard-card">
            <h2>Settings</h2>
            <p>Configure your preferences and notifications</p>
          </div>
          <div className="dashboard-card">
            <h2>Help</h2>
            <p>Get support and answers to your questions</p>
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [otpMethod, setOtpMethod] = useState('sms'); // Default to SMS
  const [loadingProgress, setLoadingProgress] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      setResendDisabled(true);
    } else if (timer === 0) {
      setResendDisabled(false);
    }
    
    return () => clearInterval(interval);
  }, [isOtpSent, timer]);

  const sendOtp = async () => {
    if (!mobileNumber) {
      setError('Please enter your mobile number');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setLoadingProgress(0);
    
    try {
      const response = await axios.post('http://localhost:8000/api/send-otp/', { 
        mobile_number: mobileNumber,
        method: otpMethod
      });
      
      // Start progress loading
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setLoadingProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          
          // Success - proceed to OTP input page
          setIsOtpSent(true);
          setTimer(60);
          setResendDisabled(true);
          setIsLoading(false);
          
          // Focus the first OTP input
          setTimeout(() => {
            if (inputRefs.current[0]) {
              inputRefs.current[0].focus();
            }
          }, 100);
        }
      }, 150); // 150ms x 20 steps = ~3 seconds to reach 100%
      
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError('Failed to send OTP. Please try again.');
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(0, 1); // Only keep the first character
    }
    
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return;
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input when this one is filled
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };
  
  const handleKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const changeNumber = () => {
    setIsOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    setError('');
    // Don't reset the mobile number so the user can modify it
  };

  const verifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setLoadingProgress(0);
    
    try {
      const response = await axios.post('http://localhost:8000/api/verify-otp/', { 
        mobile_number: mobileNumber,
        otp: otpValue 
      });
      
      // Start progress loading
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setLoadingProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          if (response.status === 200) {
            setIsVerified(true);
          }
          setIsLoading(false);
        }
      }, 150); // 150ms x 20 steps = ~3 seconds to reach 100%
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Invalid OTP. Please try again.');
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    setIsVerified(false);
    setIsOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    // Keep mobile number for convenience
  };

  if (isVerified) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="App">
      <div className="fullscreen-layout">
        <div className="glass-container">
          <div className="company-logo">
            <img src={companyLogo} alt="Exellar Construction LLP" />
          </div>
          
          {isLoading ? (
            <div className="loading-container">
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <div className="loading-text">
                {loadingProgress}% Complete
              </div>
              <div className="loading-message">
                {isOtpSent ? 'Verifying your OTP...' : 'Sending verification code...'}
              </div>
            </div>
          ) : !isOtpSent ? (
            <div>
              <h2 className="auth-title">Login</h2><br></br>
              
              {error && <div className="error-message">{error}</div>}
              
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter your mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="otp-method-selection">
                <p>Receive OTP via:</p>
                <div className="otp-method-options">
                  <button 
                    type="button"
                    className={`otp-method-btn ${otpMethod === 'sms' ? 'active' : ''}`}
                    onClick={() => setOtpMethod('sms')}
                    disabled={isLoading}
                  >
                    <span className="method-icon">
                      <img 
                        src={smsIcon} 
                        alt="SMS" 
                        width="24" 
                        height="24" 
                      />
                    </span>
                    <span>SMS</span>
                  </button>
                  <button 
                    type="button"
                    className={`otp-method-btn ${otpMethod === 'whatsapp' ? 'active' : ''}`}
                    onClick={() => setOtpMethod('whatsapp')}
                    disabled={isLoading}
                  >
                    <span className="method-icon">
                      <img 
                        src={whatsappIcon} 
                        alt="WhatsApp" 
                        width="24" 
                        height="24" 
                      />
                    </span>
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
              
              <button 
                className="send-otp-btn" 
                onClick={sendOtp} 
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          ) : (
            <div className="otp-section">
              <h2 className="auth-title">OTP Verification</h2>
              
              {error && <div className="error-message">{error}</div>}
              
              <p className="verification-text">
                Verification code has been sent to {mobileNumber} via {otpMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                <button onClick={changeNumber} className="change-number-btn">
                  Change
                </button>
              </p>
              
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isLoading}
                    autoComplete="off"
                  />
                ))}
              </div>
              
              <div className="resend-timer">
                {timer > 0 ? (
                  <p>Resend OTP in <span className="timer">{timer}s</span></p>
                ) : (
                  <p>Didn't receive the OTP?</p>
                )}
              </div>
              
              <button 
                className="verify-btn" 
                onClick={verifyOtp}
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
              
              <button 
                className="resend-btn" 
                onClick={sendOtp}
                disabled={isLoading || resendDisabled}
              >
                Resend OTP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 