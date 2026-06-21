import React, { useState } from 'react';
import { sendOTP } from '../../api/OtpApi';
import { recoverRegisteredEmail, isPhoneRegistered, cleanPhoneNumber } from '../../api/AuthApi';
import { useNotification } from '../../contexts/NotificationContext';
import { useOtpResendTimer } from '../../utils/useOtpResendTimer';

const FindRegisteredEmailPanel = ({ onUseEmail, onCancel }) => {
  const { success, error: showError, info } = useNotification();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [recoveredEmail, setRecoveredEmail] = useState('');
  const [error, setError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { secondsLeft, canResend, startTimer } = useOtpResendTimer(60);

  const getNormalizedPhone = () => cleanPhoneNumber(phone) || phone.trim();

  const handleSendOtp = async () => {
    if (!canResend && otpSent) return;

    const normalizedPhone = getNormalizedPhone();
    if (!normalizedPhone) {
      const msg = 'Please enter your registered mobile number.';
      setError(msg);
      showError(msg);
      return;
    }

    setSendingOtp(true);
    setError('');
    setRecoveredEmail('');

    try {
      const registered = await isPhoneRegistered(normalizedPhone);
      if (!registered) {
        const msg = 'No registered account found with this mobile number.';
        setError(msg);
        showError(msg);
        return;
      }

      info('Sending OTP to your mobile number...');
      const data = await sendOTP(normalizedPhone);
      if (data.verification_id) {
        setVerificationId(data.verification_id);
      }
      setOtpSent(true);
      startTimer();
      success('OTP sent! Check your phone for the verification code.');
    } catch (err) {
      const msg = err?.error || err?.message || 'Failed to send OTP. Please try again.';
      setError(msg);
      showError(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyAndRecover = async (e) => {
    e.preventDefault();
    const normalizedPhone = getNormalizedPhone();

    if (!normalizedPhone) {
      const msg = 'Please enter your mobile number.';
      setError(msg);
      showError(msg);
      return;
    }

    if (!otp.trim()) {
      const msg = 'Please enter the OTP sent to your phone.';
      setError(msg);
      showError(msg);
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const data = await recoverRegisteredEmail({
        phone_number: normalizedPhone,
        otp: otp.trim(),
        verification_id: verificationId,
      });
      setRecoveredEmail(data.email);
      success('Registered email found!');
    } catch (err) {
      const msg = err?.error || err?.message || 'Failed to verify OTP. Please try again.';
      setError(msg);
      showError(msg);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="email-recovery-panel">
      <div className="email-recovery-header">
        <h2 className="email-recovery-title">Find your registered email</h2>
        <p className="email-recovery-desc">
          Enter the mobile number linked to your KEA account. We will verify it with OTP and show your registered email.
        </p>
      </div>

      {error && (
        <div className="alert-error">
          <div className="alert-content">
            <p className="alert-message">{error}</p>
          </div>
        </div>
      )}

      {recoveredEmail ? (
        <div className="email-recovery-result">
          <p className="email-recovery-result__label">Your registered email is:</p>
          <p className="email-recovery-result__email">{recoveredEmail}</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onUseEmail(recoveredEmail)}
          >
            Use this email for password reset
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Back
          </button>
        </div>
      ) : (
        <form className="forgot-form" onSubmit={handleVerifyAndRecover}>
          <div className="input-group">
            <label htmlFor="recoveryPhone" className="input-label">Mobile Number</label>
            <input
              id="recoveryPhone"
              type="tel"
              inputMode="numeric"
              className="form-control"
              placeholder="10-digit registered mobile number"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (error) setError('');
              }}
              disabled={sendingOtp || verifying}
              maxLength={15}
            />
            <button
              type="button"
              className="btn-secondary email-recovery-otp-btn"
              onClick={handleSendOtp}
              disabled={sendingOtp || verifying || (otpSent && !canResend)}
            >
              {sendingOtp
                ? 'Sending OTP...'
                : otpSent && !canResend
                  ? `Resend OTP in ${secondsLeft}s`
                  : otpSent
                    ? 'Resend OTP'
                    : 'Send OTP'}
            </button>
            {otpSent && !canResend && (
              <p className="email-recovery-resend-hint">You can resend OTP in {secondsLeft} second{secondsLeft === 1 ? '' : 's'}.</p>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="recoveryOtp" className="input-label">OTP</label>
            <input
              id="recoveryOtp"
              type="text"
              inputMode="numeric"
              className="form-control"
              placeholder="Enter 4-digit OTP"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                if (error) setError('');
              }}
              disabled={verifying}
              maxLength={6}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={verifying}>
            {verifying ? 'Verifying...' : 'Verify & Show Email'}
          </button>
        </form>
      )}

      {!recoveredEmail && (
        <div className="secondary-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Back to email reset
          </button>
        </div>
      )}
    </div>
  );
};

export default FindRegisteredEmailPanel;
