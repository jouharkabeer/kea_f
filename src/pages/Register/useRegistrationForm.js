import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  registerUser,
  uploadRegistrationProfilePicture,
  logClientRegistrationError,
  isEmailRegistered,
  isPhoneRegistered,
  cleanPhoneNumber,
} from '../../api/AuthApi';
import { sendOTP, verifyOTP } from '../../api/OtpApi';
import { createRazorpayOrder, verifyPayment, initiateRazorpayCheckout } from '../../api/PaymentApi';
import { useNotification } from '../../contexts/NotificationContext';
import { prepareProfileImageForUpload, prepareDataUrlForUpload } from '../../utils/imageCompression';
import { INITIAL_FORM_DATA } from './registrationConfig';
import {
  validateStepOne,
  validateStepTwo,
  validateStepThree,
} from './registrationValidation';

export function useRegistrationForm() {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const formTopRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [isContactVerified, setIsContactVerified] = useState(false);
  const [emailDuplicateError, setEmailDuplicateError] = useState('');
  const [phoneDuplicateError, setPhoneDuplicateError] = useState('');
  const [userId, setUserId] = useState(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const webcamRef = useRef(null);

  useEffect(() => {
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep]);

  const getNormalizedPhone = useCallback(
    () => cleanPhoneNumber(formData.contactNo) || formData.contactNo?.trim() || '',
    [formData.contactNo]
  );

  const getRegistrationLogContext = useCallback(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return {
      online: navigator.onLine,
      userAgent: navigator.userAgent,
      language: navigator.language,
      connectionType: connection?.effectiveType || null,
      downlinkMbps: connection?.downlink ?? null,
      rttMs: connection?.rtt ?? null,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      emailDomain: formData.email?.split('@')[1] || null,
      hasPhotoFile: Boolean(formData.photoFile),
      hasSelfie: Boolean(formData.selfieImage),
      photoFileSizeKb: formData.photoFile ? Math.round(formData.photoFile.size / 1024) : null,
    };
  }, [formData]);

  const logRegistrationEvent = useCallback(
    (eventName, details = {}, level = 'error') => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        event: eventName,
        step: currentStep,
        level,
        context: getRegistrationLogContext(),
        details,
      };

      const prefix = `[Registration] ${eventName}`;
      if (level === 'info') console.info(prefix, logEntry);
      else if (level === 'warn') console.warn(prefix, logEntry);
      else console.error(prefix, logEntry);

      void logClientRegistrationError(logEntry);
    },
    [currentStep, getRegistrationLogContext]
  );

  const scrollToField = (fieldName) => {
    if (!fieldName) return;
    const el = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const showValidationFailure = (validation) => {
    setFieldErrors(validation.fieldErrors);
    setErrorMessage(validation.message);
    showError(validation.message);
    scrollToField(validation.firstErrorField);
    logRegistrationEvent(
      'STEP_VALIDATION_FAILED',
      { step: currentStep, fieldErrors: validation.fieldErrors },
      'warn'
    );
  };

  const clearFieldError = (name) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (errorMessage) setErrorMessage('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    clearFieldError(name);

    if (name === 'email' && emailDuplicateError) setEmailDuplicateError('');
    if (name === 'contactNo' && phoneDuplicateError) setPhoneDuplicateError('');
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, photoFile: e.target.files[0] }));
    clearFieldError('photo');
  };

  const handleToggleCamera = () => setUseCamera((prev) => !prev);

  const handleCapturePhoto = (imageSrc) => {
    setFormData((prev) => ({ ...prev, selfieImage: imageSrc }));
    clearFieldError('photo');
  };

  const handleFaceDetectionUpdate = (detected) => setIsFaceDetected(detected);

  const handleEmailAvailabilityCheck = async (email) => {
    const duplicateMsg = 'This email is already registered. Please use a different email or log in.';
    const checkFailedMsg = 'Unable to verify email availability. Please check your connection and try again.';

    try {
      const exists = await isEmailRegistered(email);
      if (exists) {
        setEmailDuplicateError(duplicateMsg);
        setFieldErrors((prev) => ({ ...prev, email: duplicateMsg }));
        return false;
      }
      setEmailDuplicateError('');
      return true;
    } catch (error) {
      setEmailDuplicateError(checkFailedMsg);
      setFieldErrors((prev) => ({ ...prev, email: checkFailedMsg }));
      logRegistrationEvent(
        'EMAIL_AVAILABILITY_CHECK_FAILED',
        { emailDomain: email?.split('@')[1], message: error?.message || error?.error },
        'warn'
      );
      return false;
    }
  };

  const handlePhoneAvailabilityCheck = async (phone) => {
    const duplicateMsg = 'This phone number is already registered. Please use a different number or log in.';
    const checkFailedMsg = 'Unable to verify phone number availability. Please check your connection and try again.';
    const normalizedPhone = cleanPhoneNumber(phone) || phone?.trim();

    try {
      const exists = await isPhoneRegistered(normalizedPhone);
      if (exists) {
        setPhoneDuplicateError(duplicateMsg);
        setFieldErrors((prev) => ({ ...prev, contactNo: duplicateMsg }));
        return false;
      }
      setPhoneDuplicateError('');
      return true;
    } catch (error) {
      setPhoneDuplicateError(checkFailedMsg);
      setFieldErrors((prev) => ({ ...prev, contactNo: checkFailedMsg }));
      logRegistrationEvent(
        'PHONE_AVAILABILITY_CHECK_FAILED',
        { message: error?.message || error?.error },
        'warn'
      );
      return false;
    }
  };

  const handleSendOTP = async () => {
    const normalizedPhone = getNormalizedPhone();
    if (!normalizedPhone) {
      const msg = 'Please enter your contact number first.';
      setFieldErrors((prev) => ({ ...prev, contactNo: msg }));
      setErrorMessage(msg);
      showError(msg);
      logRegistrationEvent('OTP_SEND_VALIDATION_FAILED', { reason: 'Missing contact number' }, 'warn');
      return false;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await sendOTP(normalizedPhone);
      if (data.verification_id) setVerificationId(data.verification_id);
      success('OTP sent! Check your phone for the 4-digit code.');
      return true;
    } catch (error) {
      const detail = error?.error || error?.message || 'Failed to send OTP. Please try again.';
      setErrorMessage(detail);
      showError(detail);
      logRegistrationEvent('OTP_SEND_FAILED', { message: detail });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp?.trim()) {
      const msg = 'Please enter the OTP sent to your phone.';
      setFieldErrors((prev) => ({ ...prev, otp: msg }));
      setErrorMessage(msg);
      showError(msg);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const payload = { phone_number: getNormalizedPhone(), otp: formData.otp.trim() };
      if (verificationId) payload.verification_id = verificationId;
      await verifyOTP(payload);
      setIsContactVerified(true);
      clearFieldError('otp');
      success('Phone number verified successfully!');
    } catch (error) {
      const detail = error?.error || error?.message || 'Invalid OTP. Please try again.';
      setFieldErrors((prev) => ({ ...prev, otp: detail }));
      setErrorMessage(detail);
      showError(detail);
      logRegistrationEvent('OTP_VERIFY_FAILED', { message: detail, verificationId });
    } finally {
      setIsLoading(false);
    }
  };

  const generateUsername = (firstName, lastName, email) => {
    let username = `${firstName} ${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 30);
    if (username.length < 3) {
      username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 30);
    }
    return username;
  };

  const handlePaymentVerification = async (paymentResponse) => {
    setIsLoading(true);
    try {
      const responseData = await verifyPayment({
        ...paymentResponse,
        user_id: userId || paymentResponse.user_id,
      });
      if (responseData.user_id && !userId) setUserId(responseData.user_id);
      success('Payment verified! Membership activated. You can download your card from your profile.', 8000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => navigate('/login'), 6000);
    } catch (error) {
      const detail = error?.details || error?.message || 'Payment verification failed';
      setErrorMessage(detail);
      showError(detail);
      logRegistrationEvent('PAYMENT_VERIFICATION_FAILED', { userId, message: detail });
      setIsLoading(false);
    }
  };

  const handleInitiatePayment = async (newUserId) => {
    setIsLoading(true);
    try {
      if (newUserId) setUserId(newUserId);
      const orderData = await createRazorpayOrder(newUserId);
      if (!orderData?.order_id) throw new Error('Invalid order data received from server');

      initiateRazorpayCheckout(
        { ...orderData, user_id: newUserId },
        {
          fullName: `${formData.first_name} ${formData.last_name}`,
          email: formData.email,
          contactNo: getNormalizedPhone(),
        },
        (response) => handlePaymentVerification({ ...response, user_id: newUserId }),
        (errorMsg) => {
          const detail = errorMsg || 'Payment checkout failed';
          setErrorMessage(detail);
          showError(detail);
          logRegistrationEvent('PAYMENT_CHECKOUT_FAILED', { userId: newUserId, message: detail });
          setIsLoading(false);
        }
      );
    } catch (error) {
      const detail = error?.error || error?.message || 'Could not create payment order';
      setErrorMessage(detail);
      showError(detail);
      logRegistrationEvent('PAYMENT_INITIATION_FAILED', { userId: newUserId, message: detail });
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault?.();

    const stepThreeValidation = validateStepThree(formData, isContactVerified);
    if (!stepThreeValidation.isValid) {
      showValidationFailure(stepThreeValidation);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setFieldErrors({});

    const normalizedPhone = getNormalizedPhone();
    const [emailOk, phoneOk] = await Promise.all([
      handleEmailAvailabilityCheck(formData.email.trim()),
      handlePhoneAvailabilityCheck(normalizedPhone),
    ]);

    if (!emailOk || !phoneOk) {
      const msg = !emailOk ? emailDuplicateError : phoneDuplicateError;
      setErrorMessage(msg);
      showError(msg);
      setIsLoading(false);
      return;
    }

    let compressedProfileSizeKb = null;
    let imageUploadStrategy = null;
    let profileFile = null;

    try {
      const validUsername = generateUsername(formData.first_name, formData.last_name, formData.email);
      const hasProfilePicture = formData.photoFile || formData.selfieImage;

      if (hasProfilePicture) {
        let imagePrepResult = null;
        if (formData.photoFile) {
          imagePrepResult = await prepareProfileImageForUpload(formData.photoFile);
        } else if (formData.selfieImage) {
          imagePrepResult = await prepareDataUrlForUpload(formData.selfieImage);
        }

        profileFile = imagePrepResult?.file || null;
        imageUploadStrategy = imagePrepResult?.strategy || null;
        if (profileFile) {
          compressedProfileSizeKb = Math.round(profileFile.size / 1024);
        }
      }

      const payload = {
        user_type: 'member',
        username: validUsername,
        email: formData.email.trim(),
        phone_number: normalizedPhone,
        company_name: formData.companyName || '',
        designation: formData.designation || '',
        address: formData.address || '',
        blood_group: formData.bloodGroup || '',
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        college_name: formData.college_name || '',
        department_of_study: formData.department_of_study || '',
        year_of_graduation: formData.year_of_graduation || '',
        password: formData.password,
      };

      logRegistrationEvent(
        'REGISTER_REQUEST_START',
        {
          uploadType: 'json',
          hasDeferredPhoto: Boolean(profileFile),
          compressedProfileSizeKb,
          imageUploadStrategy,
          phoneNumberLength: normalizedPhone.length,
        },
        'info'
      );

      const response = await registerUser(payload);

      const { data: resData, status } = response || {};

      if (status === 409) {
        const msg = 'This account already exists. Please log in instead.';
        setErrorMessage(msg);
        showError(msg);
        setIsLoading(false);
        return;
      }

      const isPending = status === 200 && resData?.code === 'ACCOUNT_PENDING_PAYMENT';
      const isCreated = status === 201;
      if (isCreated || isPending) {
        const newUserId = resData?.user_id;
        if (!newUserId) throw { message: 'Registration failed: missing user ID in response.' };
        setUserId(newUserId);

        if (profileFile) {
          logRegistrationEvent(
            'REGISTER_PHOTO_UPLOAD_START',
            { compressedProfileSizeKb, imageUploadStrategy },
            'info'
          );

          try {
            await uploadRegistrationProfilePicture({
              userId: newUserId,
              email: formData.email.trim(),
              profileFile,
            });
            logRegistrationEvent('REGISTER_PHOTO_UPLOAD_SUCCESS', { compressedProfileSizeKb }, 'info');
          } catch (photoError) {
            logRegistrationEvent('REGISTER_PHOTO_UPLOAD_FAILED', {
              compressedProfileSizeKb,
              imageUploadStrategy,
              message: photoError.message,
              status: photoError.status,
              attempts: photoError.attempts,
              errorCause: photoError.errorCause,
            });
            info(
              'Account created. Photo upload failed — you can add your profile picture later from your profile. Opening payment...',
              8000
            );
            handleInitiatePayment(newUserId);
            return;
          }
        }

        success('Registration successful! Opening payment...');
        handleInitiatePayment(newUserId);
        return;
      }

      throw { message: 'Registration failed: unexpected server response.' };
    } catch (error) {
      const isNetworkError =
        error.isNetworkError === true ||
        error.status === 'NETWORK_ERROR' ||
        /timeout|network error|failed to fetch/i.test(error.message || '');

      const attempts = error.attempts || 1;
      let userMessage;

      if (isNetworkError) {
        userMessage = /timeout/i.test(error.message || '')
          ? `Registration timed out. Please check your connection and try again.${attempts > 1 ? ` (Tried ${attempts} times)` : ''}`
          : `Network error during registration. Please check your connection and try again.${attempts > 1 ? ` (Tried ${attempts} times)` : ''}`;
      } else if (/image|photo|compression/i.test(error.message || '')) {
        userMessage = 'Unable to process your photo. Please upload a JPG/PNG under 5MB or take a new picture.';
      } else if (error.status >= 500) {
        userMessage = 'Server error. Please try again in a few moments.';
      } else {
        userMessage = error.message || 'Registration failed. Please review your details and try again.';
      }

      setErrorMessage(userMessage);
      showError(userMessage, 10000);
      setIsLoading(false);

      logRegistrationEvent('REGISTER_FAILED', {
        errorType: isNetworkError ? 'Network' : 'Server',
        status: error.status,
        attempts,
        message: error.message,
        errorName: error.errorName || error.name,
        requestTimeoutMs: error.requestTimeoutMs,
        errorCause: error.errorCause || error.originalError?.message,
        uploadType: profileFile ? 'deferred_multipart' : 'json',
        compressedProfileSizeKb,
        imageUploadStrategy,
      });
    }
  };

  const handleNext = async () => {
    setErrorMessage('');
    setFieldErrors({});

    if (currentStep === 1) {
      if (emailDuplicateError) {
        setErrorMessage(emailDuplicateError);
        showError(emailDuplicateError);
        return;
      }

      const validation = validateStepOne(formData, isFaceDetected);
      if (!validation.isValid) {
        showValidationFailure(validation);
        return;
      }

      setIsLoading(true);
      const emailOk = await handleEmailAvailabilityCheck(formData.email.trim());
      setIsLoading(false);
      if (!emailOk) {
        setErrorMessage(emailDuplicateError);
        showError(emailDuplicateError);
        scrollToField('email');
        return;
      }
    }

    if (currentStep === 2) {
      if (phoneDuplicateError) {
        setErrorMessage(phoneDuplicateError);
        showError(phoneDuplicateError);
        return;
      }

      const validation = validateStepTwo(formData);
      if (!validation.isValid) {
        showValidationFailure(validation);
        return;
      }

      const normalizedPhone = getNormalizedPhone();
      setIsLoading(true);
      const [emailOk, phoneOk] = await Promise.all([
        handleEmailAvailabilityCheck(formData.email.trim()),
        handlePhoneAvailabilityCheck(normalizedPhone),
      ]);
      setIsLoading(false);

      if (!emailOk || !phoneOk) {
        const msg = !emailOk ? emailDuplicateError : phoneDuplicateError;
        setErrorMessage(msg);
        showError(msg);
        scrollToField(!emailOk ? 'email' : 'contactNo');
        return;
      }
    }

    setCurrentStep((prev) => prev + 1);
    success(`Step ${currentStep} complete!`);
  };

  const handleBack = () => {
    setErrorMessage('');
    setFieldErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const canProceed =
    !isLoading &&
    !(currentStep === 1 && emailDuplicateError) &&
    !(currentStep === 2 && phoneDuplicateError);

  const canSubmit = !isLoading && isContactVerified && formData.terms;

  return {
    formTopRef,
    currentStep,
    formData,
    fieldErrors,
    errorMessage,
    isLoading,
    isContactVerified,
    emailDuplicateError,
    phoneDuplicateError,
    useCamera,
    webcamRef,
    canProceed,
    canSubmit,
    handleChange,
    handleFileChange,
    handleToggleCamera,
    handleCapturePhoto,
    handleFaceDetectionUpdate,
    handleEmailAvailabilityCheck,
    handlePhoneAvailabilityCheck,
    handleSendOTP,
    handleVerifyOTP,
    handleNext,
    handleBack,
    handleRegister,
  };
}
