export const REGISTRATION_STEPS = [
  { id: 1, label: 'Account', short: 'Personal info & photo' },
  { id: 2, label: 'Profile', short: 'Work & contact details' },
  { id: 3, label: 'Verify', short: 'OTP & payment' },
];

export const FIELD_LIMITS = {
  first_name: { max: 30, label: 'First Name' },
  last_name: { max: 30, label: 'Last Name' },
  companyName: { max: 50, label: 'Company Name' },
  designation: { max: 50, label: 'Designation' },
  college_name: { max: 50, label: 'College/University Name' },
  department_of_study: { max: 30, label: 'Department of Study' },
  contactNo: { max: 15, label: 'Contact Number' },
  address: { max: 255, label: 'Address' },
};

export const INITIAL_FORM_DATA = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirmPassword: '',
  photoFile: null,
  selfieImage: null,
  companyName: '',
  designation: '',
  contactNo: '',
  address: '',
  college_name: '',
  department_of_study: '',
  year_of_graduation: '',
  bloodGroup: '',
  otp: '',
  terms: false,
};

export const BLOOD_GROUPS = [
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

export const getGraduationYears = () => {
  const currentYear = new Date().getFullYear() + 4;
  const years = [];
  for (let year = currentYear; year >= currentYear - 79; year -= 1) {
    years.push(year);
  }
  return years;
};
