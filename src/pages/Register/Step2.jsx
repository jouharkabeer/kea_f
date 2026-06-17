import React from 'react';
import { FiBriefcase, FiUser, FiPhone, FiMapPin, FiDroplet, FiBookOpen, FiCalendar } from 'react-icons/fi';
import { BLOOD_GROUPS, FIELD_LIMITS, getGraduationYears } from './registrationConfig';
import { applyFieldLimit } from './registrationValidation';
import { FieldMessage, fieldClassName } from './FieldMessage';

export const StepTwo = ({
  formData,
  fieldErrors = {},
  handleChange,
  phoneDuplicateError = '',
  onPhoneAvailabilityCheck,
}) => {
  const [lengthErrors, setLengthErrors] = React.useState({});
  const [isCheckingPhone, setIsCheckingPhone] = React.useState(false);
  const yearOptions = getGraduationYears();

  const handleLimitedChange = (e) => {
    const { name, value } = e.target;
    const { value: nextValue, lengthError } = applyFieldLimit(name, value);

    setLengthErrors((prev) => {
      if (!lengthError) {
        if (!prev[name]) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return { ...prev, [name]: lengthError };
    });

    if (nextValue !== value) {
      handleChange({ target: { name, value: nextValue } });
      return;
    }

    handleChange(e);
  };

  const getError = (field) => {
    if (field === 'contactNo' && phoneDuplicateError) return phoneDuplicateError;
    return fieldErrors[field] || lengthErrors[field] || '';
  };

  const handleContactBlur = async () => {
    const normalizedPhone = formData.contactNo?.trim();
    if (!normalizedPhone || !onPhoneAvailabilityCheck) return;

    setIsCheckingPhone(true);
    try {
      await onPhoneAvailabilityCheck(normalizedPhone);
    } finally {
      setIsCheckingPhone(false);
    }
  };

  return (
    <div className="form-step">
      <p className="step-intro">Tell us about your work and how we can reach you. Fields marked * are required.</p>

      <div className="form-group">
        <label htmlFor="companyName">
          <FiBriefcase className="field-icon" />
          Company Name
        </label>
        <input
          id="companyName"
          name="companyName"
          type="text"
          className={fieldClassName(getError('companyName'))}
          value={formData.companyName}
          onChange={handleLimitedChange}
          maxLength={FIELD_LIMITS.companyName.max}
          placeholder="Your employer (optional)"
          autoComplete="organization"
        />
        <FieldMessage error={getError('companyName')} />
      </div>

      <div className="form-group">
        <label htmlFor="designation">
          <FiUser className="field-icon" />
          Designation
        </label>
        <input
          id="designation"
          name="designation"
          type="text"
          className={fieldClassName(getError('designation'))}
          value={formData.designation}
          onChange={handleLimitedChange}
          maxLength={FIELD_LIMITS.designation.max}
          placeholder="Your job title (optional)"
          autoComplete="organization-title"
        />
        <FieldMessage error={getError('designation')} />
      </div>

      <div className="form-section">
        <h4 className="section-title">Academic Information</h4>

        <div className="form-group">
          <label htmlFor="college_name">College / University</label>
          <input
            id="college_name"
            name="college_name"
            type="text"
            className={fieldClassName(getError('college_name'))}
            value={formData.college_name || ''}
            onChange={handleLimitedChange}
            maxLength={FIELD_LIMITS.college_name.max}
            placeholder="Institution name (optional)"
            autoComplete="off"
          />
          <FieldMessage error={getError('college_name')} />
        </div>

        <div className="form-group">
          <label htmlFor="department_of_study">
            <FiBookOpen className="field-icon" />
            Department of Study
          </label>
          <input
            id="department_of_study"
            name="department_of_study"
            type="text"
            className={fieldClassName(getError('department_of_study'))}
            value={formData.department_of_study || ''}
            onChange={handleLimitedChange}
            maxLength={FIELD_LIMITS.department_of_study.max}
            placeholder="e.g. Computer Science (optional)"
            autoComplete="off"
          />
          <FieldMessage error={getError('department_of_study')} />
        </div>

        <div className="form-group">
          <label htmlFor="year_of_graduation">
            <FiCalendar className="field-icon" />
            Year of Graduation
          </label>
          <select
            id="year_of_graduation"
            name="year_of_graduation"
            value={formData.year_of_graduation || ''}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Select year (optional)</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="contactNo">
          <FiPhone className="field-icon" />
          Mobile Number *
        </label>
        <input
          id="contactNo"
          name="contactNo"
          type="tel"
          className={fieldClassName(getError('contactNo'))}
          value={formData.contactNo}
          onChange={handleLimitedChange}
          onBlur={handleContactBlur}
          maxLength={FIELD_LIMITS.contactNo.max}
          placeholder="10-digit mobile number"
          autoComplete="tel"
          inputMode="numeric"
        />
        <FieldMessage
          checking={isCheckingPhone ? 'Checking number availability...' : ''}
          error={getError('contactNo')}
          hint={!getError('contactNo') ? 'We will send an OTP to verify this number in the next step.' : ''}
        />
      </div>

      <div className="form-group">
        <label htmlFor="address">
          <FiMapPin className="field-icon" />
          Address
        </label>
        <input
          id="address"
          name="address"
          type="text"
          className={fieldClassName(getError('address'))}
          value={formData.address}
          onChange={handleChange}
          placeholder="Street, city, state (optional)"
          autoComplete="street-address"
        />
        <FieldMessage error={getError('address')} />
      </div>

      <div className="form-group">
        <label htmlFor="bloodGroup">
          <FiDroplet className="field-icon" />
          Blood Group <span className="optional-field">(optional)</span>
        </label>
        <select
          id="bloodGroup"
          name="bloodGroup"
          value={formData.bloodGroup || ''}
          onChange={handleChange}
          className="form-select"
        >
          {BLOOD_GROUPS.map((group) => (
            <option key={group.value || 'empty'} value={group.value}>
              {group.label}
            </option>
          ))}
        </select>
        <FieldMessage hint="Helpful in emergency situations" />
      </div>
    </div>
  );
};
