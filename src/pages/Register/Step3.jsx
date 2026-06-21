import { useState } from 'react';
import { FiSend, FiCheckCircle, FiShield, FiInfo, FiLock, FiFileText } from 'react-icons/fi';
import { FieldMessage } from './FieldMessage';
import { useOtpResendTimer } from '../../utils/useOtpResendTimer';

export const StepThree = ({
  formData,
  fieldErrors = {},
  handleChange,
  handleSendOTP,
  handleVerifyOTP,
  isContactVerified,
  isLoading: parentIsLoading,
}) => {
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { secondsLeft, canResend, startTimer } = useOtpResendTimer(60);

  const onSendOTP = async () => {
    if (isSendingOTP || isContactVerified || (otpSent && !canResend)) return;
    setIsSendingOTP(true);
    try {
      const sent = await handleSendOTP();
      if (sent) {
        setOtpSent(true);
        startTimer();
      }
    } finally {
      setIsSendingOTP(false);
    }
  };

  const onVerifyOTP = async () => {
    if (isVerifyingOTP || isContactVerified) return;
    setIsVerifyingOTP(true);
    try {
      await handleVerifyOTP();
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  return (
    <div className="form-step">
      <p className="step-intro">Verify your mobile number, accept the terms, then complete registration and payment.</p>

      <div className="verification-section">
        <div className="verification-info">
          <FiShield size={20} />
          <span>OTP verification keeps your membership account secure.</span>
        </div>

        <div className="contact-display">
          <label>Mobile number</label>
          <span className="contact-number">{formData.contactNo || '—'}</span>
          <button
            type="button"
            className={`otp-button ${isContactVerified ? 'otp-sent' : ''}`}
            onClick={onSendOTP}
            disabled={isSendingOTP || isContactVerified || parentIsLoading || (otpSent && !canResend)}
          >
            {isSendingOTP ? (
              'Sending...'
            ) : isContactVerified ? (
              <span><FiCheckCircle size={16} /> Verified</span>
            ) : otpSent && !canResend ? (
              `Resend OTP in ${secondsLeft}s`
            ) : otpSent ? (
              <span><FiSend size={16} /> Resend OTP</span>
            ) : (
              <span><FiSend size={16} /> Send OTP</span>
            )}
          </button>
        </div>

        <div className="otp-input-container">
          <label htmlFor="otp">Enter 4-digit OTP</label>
          <div className="otp-verification-row">
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.otp}
              onChange={handleChange}
              placeholder="• • • •"
              autoComplete="one-time-code"
              maxLength="4"
              disabled={isContactVerified}
              className={isContactVerified ? 'input-verified field-input' : `field-input ${fieldErrors.otp ? 'field-input--error' : ''}`}
            />
            <button
              type="button"
              className={`otp-button verify-button ${isContactVerified ? 'button-verified' : ''}`}
              onClick={onVerifyOTP}
              disabled={isVerifyingOTP || !formData.otp || isContactVerified || parentIsLoading}
            >
              {isVerifyingOTP ? 'Verifying...' : isContactVerified ? (
                <span><FiCheckCircle size={16} /> Done</span>
              ) : (
                'Verify'
              )}
            </button>
          </div>
          <FieldMessage
            error={fieldErrors.otp}
            hint={
              !fieldErrors.otp && !isContactVerified
                ? otpSent && !canResend
                  ? `You can resend OTP in ${secondsLeft} second${secondsLeft === 1 ? '' : 's'}.`
                  : otpSent
                    ? 'Did not receive it? Tap Resend OTP.'
                    : 'Tap Send OTP to receive a 4-digit code on your mobile.'
                : ''
            }
          />
        </div>

        {isContactVerified && (
          <div className="verification-success">
            <p className="verified-text">Phone verified</p>
            <p>You can now register and proceed to membership payment.</p>
          </div>
        )}

        <div className="verification-note">
          <p><FiInfo size={14} /> OTP is sent to the mobile number you entered in the previous step.</p>
        </div>
      </div>

      <div className={`terms-agreement ${fieldErrors.terms ? 'has-error' : ''}`}>
        <input
          type="checkbox"
          id="terms"
          name="terms"
          checked={formData.terms}
          onChange={handleChange}
        />
        <label htmlFor="terms">
          <FiFileText size={14} style={{ marginRight: '6px' }} />
          I agree to the{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
          {' '}and{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
        </label>
      </div>
      <FieldMessage error={fieldErrors.terms} />

      <div className="register-summary">
        <h4><FiLock size={16} /> Ready to complete?</h4>
        <ul>
          <li>{formData.first_name} {formData.last_name}</li>
          <li>{formData.email}</li>
          <li>{formData.contactNo}</li>
        </ul>
        <p className="register-summary__note">Tap <strong>Register & Pay</strong> below to create your account and open secure payment.</p>
      </div>
    </div>
  );
};
