import React from 'react';
import { FiBriefcase, FiUser, FiPhone, FiMapPin, FiDroplet, FiBookOpen, FiCalendar,  } from 'react-icons/fi';

const FIELD_LIMITS = {
  companyName: { max: 50, label: 'Company Name' },
  designation: { max: 50, label: 'Designation' },
  college_name: { max: 50, label: 'College/University Name' },
  department_of_study: { max: 30, label: 'Department of Study' },
  contactNo: { max: 15, label: 'Contact Number' },
};

export const StepTwo = ({ formData, handleChange, phoneDuplicateError = '', onPhoneAvailabilityCheck }) => {
  const [lengthErrors, setLengthErrors] = React.useState({});
  const [isCheckingPhone, setIsCheckingPhone] = React.useState(false);
  const bloodGroups = [
    { value: '', label: 'Select Blood Group' },
    { value: 'A+', label: 'A+ (A Positive)' },
    { value: 'A-', label: 'A- (A Negative)' },
    { value: 'B+', label: 'B+ (B Positive)' },
    { value: 'B-', label: 'B- (B Negative)' },
    { value: 'AB+', label: 'AB+ (AB Positive)' },
    { value: 'AB-', label: 'AB- (AB Negative)' },
    { value: 'O+', label: 'O+ (O Positive)' },
    { value: 'O-', label: 'O- (O Negative)' },
  ];

  // Generate year options (current year to 50 years back)
  const currentYear = new Date().getFullYear() + 4;
  const yearOptions = [];
  for (let year = currentYear; year >= currentYear - 79; year--) {
    yearOptions.push(year);
  }

  const handleLimitedChange = (e) => {
    const { name, value } = e.target;
    const limit = FIELD_LIMITS[name];

    if (!limit) {
      handleChange(e);
      return;
    }

    const trimmedValue = value.length > limit.max ? value.slice(0, limit.max) : value;

    if (trimmedValue.length >= limit.max) {
      setLengthErrors((prev) => ({
        ...prev,
        [name]: `${limit.label} has reached the maximum of ${limit.max} characters.`,
      }));
    } else {
      setLengthErrors((prev) => {
        if (!prev[name]) {
          return prev;
        }
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (trimmedValue !== value) {
      handleChange({ target: { name, value: trimmedValue } });
      return;
    }

    handleChange(e);
  };

  const renderLengthError = (fieldName) =>
    lengthErrors[fieldName] ? (
      <small className="input-error" style={{ color: 'red' }}>{lengthErrors[fieldName]}</small>
    ) : null;

  const handleContactBlur = async () => {
    const normalizedPhone = formData.contactNo?.trim();
    if (!normalizedPhone || !onPhoneAvailabilityCheck) {
      return;
    }

    setIsCheckingPhone(true);
    try {
      await onPhoneAvailabilityCheck(normalizedPhone);
    } finally {
      setIsCheckingPhone(false);
    }
  };

  return (
    <div className="form-step">
      <h3>Contact Details</h3>
      
      <div className="form-group">
        <label htmlFor="companyName">
          <FiBriefcase className="field-icon" />
          Company Name
        </label>
        <input
          id="companyName"
          name="companyName"
          type="text"
          value={formData.companyName}
          onChange={handleLimitedChange}
          maxLength={FIELD_LIMITS.companyName.max}
          placeholder="Enter Company Name"
          autoComplete="organization"
        />
        {renderLengthError('companyName')}
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
          value={formData.designation}
          onChange={handleLimitedChange}
          maxLength={FIELD_LIMITS.designation.max}
          placeholder="Enter Your Job Title"
          autoComplete="organization-title"
        />
        {renderLengthError('designation')}
      </div>

      {/* Academic Information Section */}
      <div className="form-section">
        <h4 className="section-title">Academic Information</h4>
        
        <div className="form-group">
          <label htmlFor="college_name">
            {/* <FiGraduationCa className="field-icon" /> */}
            College/University Name
          </label>
          <input
            id="college_name"
            name="college_name"
            type="text"
            value={formData.college_name || ''}
            onChange={handleLimitedChange}
            maxLength={FIELD_LIMITS.college_name.max}
            placeholder="Enter your college or university name"
            autoComplete="off"
          />
          {renderLengthError('college_name')}
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
            value={formData.department_of_study || ''}
            onChange={handleLimitedChange}
            maxLength={FIELD_LIMITS.department_of_study.max}
            placeholder="e.g., Computer Science, Mechanical Engineering, Business Administration"
            autoComplete="off"
          />
          {renderLengthError('department_of_study')}
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
            <option value="">Select Graduation Year</option>
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
          Contact Number
        </label>
        <input
          id="contactNo"
          name="contactNo"
          type="tel"
          value={formData.contactNo}
          onChange={handleLimitedChange}
          onBlur={handleContactBlur}
          maxLength={FIELD_LIMITS.contactNo.max}
          placeholder="Enter Your Phone Number"
          autoComplete="tel"
        />
        {renderLengthError('contactNo')}
        {isCheckingPhone && <small className="input-hint">Checking phone number availability...</small>}
        {phoneDuplicateError && <small className="input-error" style={{ color: 'red' }}>{phoneDuplicateError}</small>}
        <small className="input-hint">We'll send a verification code to this number</small>
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
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter Street, City, Country"
          autoComplete="street-address"
        />
      </div>
      
      {/* Blood Group Field */}
      <div className="form-group">
        <label htmlFor="bloodGroup">
          <FiDroplet className="field-icon" />
          Blood Group
          <span className="optional-field"> (Optional)</span>
        </label>
        <select
          id="bloodGroup"
          name="bloodGroup"
          value={formData.bloodGroup || ''}
          onChange={handleChange}
          className="form-select"
        >
          {bloodGroups.map((group) => (
            <option key={group.value} value={group.value}>
              {group.label}
            </option>
          ))}
        </select>
        <small className="input-hint">This information may be helpful for emergency situations</small>
      </div>
    </div>
  );
};