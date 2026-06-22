import { FIELD_LIMITS } from './registrationConfig';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validatePassword = (password = '') => ({
  minLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /\d/.test(password),
  hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password),
});

export const isPasswordValid = (password = '') =>
  Object.values(validatePassword(password)).every(Boolean);

const checkMaxLength = (value, fieldKey, errors) => {
  const limit = FIELD_LIMITS[fieldKey];
  if (!limit || !value) {
    return;
  }
  if (value.length > limit.max) {
    errors[fieldKey] = `${limit.label} cannot exceed ${limit.max} characters.`;
  }
};

export const normalizePhoneInput = (phone = '') => {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length > 10) {
    return digits.slice(2);
  }
  return digits;
};

export const isValidPhone = (phone = '') => {
  const cleaned = normalizePhoneInput(phone);
  return cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned);
};

export const validateStepOne = (formData, faceDetected) => {
  const fieldErrors = {};

  if (!formData.first_name?.trim()) {
    fieldErrors.first_name = 'First name is required.';
  } else {
    checkMaxLength(formData.first_name.trim(), 'first_name', fieldErrors);
  }

  if (!formData.last_name?.trim()) {
    fieldErrors.last_name = 'Last name is required.';
  } else {
    checkMaxLength(formData.last_name.trim(), 'last_name', fieldErrors);
  }

  if (!formData.email?.trim()) {
    fieldErrors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
    fieldErrors.email = 'Enter a valid email address.';
  }

  if (!formData.password) {
    fieldErrors.password = 'Password is required.';
  } else if (!isPasswordValid(formData.password)) {
    fieldErrors.password = 'Password does not meet all security requirements.';
  }

  if (!formData.confirmPassword) {
    fieldErrors.confirmPassword = 'Please confirm your password.';
  } else if (formData.password !== formData.confirmPassword) {
    fieldErrors.confirmPassword = 'Passwords do not match.';
  }

  if (!formData.photoFile && !formData.selfieImage) {
    fieldErrors.photo = 'Please upload or take a profile photo.';
  } else if (!faceDetected) {
    fieldErrors.photo = 'Please use a clear photo where your face is visible.';
  }

  return buildResult(fieldErrors);
};

export const validateStepTwo = (formData) => {
  const fieldErrors = {};

  const requiredTextFields = [
    { key: 'companyName', label: 'Company name' },
    { key: 'designation', label: 'Designation' },
    { key: 'college_name', label: 'College / University' },
    { key: 'department_of_study', label: 'Department of study' },
    { key: 'address', label: 'Address' },
  ];

  requiredTextFields.forEach(({ key, label }) => {
    if (!formData[key]?.trim()) {
      fieldErrors[key] = `${label} is required.`;
    } else {
      checkMaxLength(formData[key].trim(), key, fieldErrors);
    }
  });

  if (!formData.year_of_graduation) {
    fieldErrors.year_of_graduation = 'Year of graduation is required.';
  }

  if (!formData.contactNo?.trim()) {
    fieldErrors.contactNo = 'Contact number is required.';
  } else if (!isValidPhone(formData.contactNo)) {
    fieldErrors.contactNo = 'Enter a valid 10-digit Indian mobile number.';
  } else {
    checkMaxLength(formData.contactNo, 'contactNo', fieldErrors);
  }

  return buildResult(fieldErrors);
};

export const validateStepThree = (formData, isContactVerified) => {
  const fieldErrors = {};

  if (!isContactVerified) {
    fieldErrors.otp = 'Please verify your phone number with OTP before registering.';
  }

  if (!formData.terms) {
    fieldErrors.terms = 'You must agree to the Terms and Conditions.';
  }

  return buildResult(fieldErrors);
};

function buildResult(fieldErrors) {
  const messages = Object.values(fieldErrors);
  const firstErrorField = Object.keys(fieldErrors)[0] || null;

  return {
    isValid: messages.length === 0,
    fieldErrors,
    message: messages[0] || '',
    messages,
    firstErrorField,
  };
}

export const applyFieldLimit = (name, value) => {
  const limit = FIELD_LIMITS[name];
  if (!limit) {
    return { value, lengthError: '' };
  }

  const trimmedValue = value.length > limit.max ? value.slice(0, limit.max) : value;
  const lengthError =
    trimmedValue.length >= limit.max
      ? `${limit.label} has reached the maximum of ${limit.max} characters.`
      : '';

  return { value: trimmedValue, lengthError };
};
