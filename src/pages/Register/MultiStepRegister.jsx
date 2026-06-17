import React from 'react';
import { Link } from 'react-router-dom';
import './MultiStepRegister.css';import { StepOne } from './Step1';
import { StepTwo } from './Step2';
import { StepThree } from './Step3';
import { REGISTRATION_STEPS } from './registrationConfig';
import { useRegistrationForm } from './useRegistrationForm';

function MultiStepRegister() {
  const registration = useRegistrationForm();
  const {
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
  } = registration;

  const activeStep = REGISTRATION_STEPS.find((step) => step.id === currentStep);
  const progressPercent = Math.round((currentStep / REGISTRATION_STEPS.length) * 100);

  return (
    <div className="register-page">
    <div className="multistep-container">      <div ref={formTopRef} className="scroll-target" aria-hidden="true" />

      <header className="form-header">
        <div>
          <h2>Join KEA Bengaluru</h2>
          <p className="form-subtitle">Create your membership account in 3 simple steps</p>
        </div>
        <p className="form-signin">
          Already a member? <Link to="/login">Sign in</Link>
        </p>
      </header>

      <div className="step-progress" aria-label="Registration progress">
        <div className="step-progress__bar">
          <div className="step-progress__fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="step-progress__labels">
          {REGISTRATION_STEPS.map((step) => (
            <div
              key={step.id}
              className={`step-progress__item ${currentStep >= step.id ? 'is-active' : ''} ${currentStep === step.id ? 'is-current' : ''}`}
            >
              <span className="step-progress__number">{step.id}</span>
              <span className="step-progress__text">
                <strong>{step.label}</strong>
                <small>{step.short}</small>
              </span>
            </div>
          ))}
        </div>
      </div>

      {activeStep && (
        <div className="step-banner">
          <span className="step-banner__eyebrow">Step {currentStep} of {REGISTRATION_STEPS.length}</span>
          <h3 className="step-banner__title">{activeStep.label}</h3>
          <p className="step-banner__desc">{activeStep.short}</p>
        </div>
      )}

      {errorMessage && (
        <div className="error-message" role="alert">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleRegister} className="multistep-form" noValidate>
        {currentStep === 1 && (
          <StepOne
            formData={formData}
            fieldErrors={fieldErrors}
            webcamRef={webcamRef}
            useCamera={useCamera}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
            handleToggleCamera={handleToggleCamera}
            handleCapturePhoto={handleCapturePhoto}
            onFaceDetectionUpdate={handleFaceDetectionUpdate}
            emailDuplicateError={emailDuplicateError}
            onEmailAvailabilityCheck={handleEmailAvailabilityCheck}
          />
        )}

        {currentStep === 2 && (
          <StepTwo
            formData={formData}
            fieldErrors={fieldErrors}
            handleChange={handleChange}
            phoneDuplicateError={phoneDuplicateError}
            onPhoneAvailabilityCheck={handlePhoneAvailabilityCheck}
          />
        )}

        {currentStep === 3 && (
          <StepThree
            formData={formData}
            fieldErrors={fieldErrors}
            handleChange={handleChange}
            handleSendOTP={handleSendOTP}
            handleVerifyOTP={handleVerifyOTP}
            isContactVerified={isContactVerified}
            isLoading={isLoading}
          />
        )}

        <div className="form-navigation">
          {currentStep > 1 && (
            <button type="button" className="nav-button back" onClick={handleBack} disabled={isLoading}>
              Back
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              className="nav-button next"
              onClick={handleNext}
              disabled={!canProceed}
            >
              {isLoading ? 'Please wait...' : 'Continue'}
            </button>
          ) : (
            <button type="submit" className="nav-button submit" disabled={!canSubmit}>
              {isLoading ? 'Processing...' : 'Register & Pay'}
            </button>
          )}
        </div>
      </form>
    </div>
    </div>
  );}

export default MultiStepRegister;
