// Validation functions for each field
const validateAge = (age) => {
  if (!age || age === '') return 'Age is required';
  const numAge = Number(age);
  if (isNaN(numAge)) return 'Age must be a number';
  if (numAge < 0) return 'Age cannot be negative';
  if (numAge > 120) return 'Age must be realistic (under 120)';
  if (numAge < 18) return 'Age must be 18 or older';
  return null;
};

const validateGender = (gender) => {
  if (!gender || gender === '') return 'Gender is required';
  if (!['0', '1'].includes(gender)) return 'Please select a valid gender';
  return null;
};

const validateBMI = (bmi) => {
  if (!bmi || bmi === '') return 'BMI is required';
  const numBMI = Number(bmi);
  if (isNaN(numBMI)) return 'BMI must be a number';
  if (numBMI < 10) return 'BMI is too low (minimum 10)';
  if (numBMI > 80) return 'BMI is too high (maximum 80)';
  return null;
};

const validateMMSE = (mmse) => {
  if (!mmse || mmse === '') return 'MMSE Score is required';
  const numMMSE = Number(mmse);
  if (isNaN(numMMSE)) return 'MMSE Score must be a number';
  if (numMMSE < 0) return 'MMSE Score cannot be negative';
  if (numMMSE > 30) return 'MMSE Score cannot exceed 30';
  return null;
};

const validateADL = (adl) => {
  if (!adl || adl === '') return 'ADL Score is required';
  const numADL = Number(adl);
  if (isNaN(numADL)) return 'ADL Score must be a number';
  if (numADL < 0) return 'ADL Score cannot be negative';
  if (numADL > 6) return 'ADL Score cannot exceed 6';
  return null;
};

const validateFunctionalAssessment = (fa) => {
  if (!fa || fa === '') return 'Functional Assessment is required';
  const numFA = Number(fa);
  if (isNaN(numFA)) return 'Functional Assessment must be a number';
  if (numFA < 0) return 'Functional Assessment cannot be negative';
  if (numFA > 8) return 'Functional Assessment cannot exceed 8';
  return null;
};

// Main validation function for clinical data
export const validateClinicalData = (clinical) => {
  const errors = {};

  // Validate each field
  const ageError = validateAge(clinical.Age);
  if (ageError) errors.Age = ageError;

  const genderError = validateGender(clinical.Gender);
  if (genderError) errors.Gender = genderError;

  const bmiError = validateBMI(clinical.BMI);
  if (bmiError) errors.BMI = bmiError;

  const mmseError = validateMMSE(clinical.MMSE);
  if (mmseError) errors.MMSE = mmseError;

  const adlError = validateADL(clinical.ADL);
  if (adlError) errors.ADL = adlError;

  const faError = validateFunctionalAssessment(clinical.FunctionalAssessment);
  if (faError) errors.FunctionalAssessment = faError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Speech validation function
export const validateSpeechData = (audioFiles) => {
  const errors = {};

//   if (!speechTranscripts.Transcript_CTD) {
//     errors.CTD = 'Cookie Theft Test transcript is required';
//   }

//   if (!speechTranscripts.Transcript_PFT) {
//     errors.PFT = 'Phonemic Fluency Test transcript is required';
//   }

//   if (!speechTranscripts.Transcript_SFT) {
//     errors.SFT = 'Semantic Fluency Test transcript is required';
//   }

  if (!audioFiles.CTD) {
    errors.CTD_Audio = 'Cookie Theft Test audio recording is required';
  }

  if (!audioFiles.PFT) {
    errors.PFT_Audio = 'Phonemic Fluency Test audio recording is required';
  }

  if (!audioFiles.SFT) {
    errors.SFT_Audio = 'Semantic Fluency Test audio recording is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Real-time field validation for individual fields
export const validateField = (fieldName, value) => {
  switch (fieldName) {
    case 'Age':
      return validateAge(value);
    case 'Gender':
      return validateGender(value);
    case 'BMI':
      return validateBMI(value);
    case 'MMSE':
      return validateMMSE(value);
    case 'ADL':
      return validateADL(value);
    case 'FunctionalAssessment':
      return validateFunctionalAssessment(value);
    default:
      return null;
  }
};

// Complete form validation
export const validateForm = (formData, audioFiles) => {
  const clinicalValidation = validateClinicalData(formData.clinical);
  const speechValidation = validateSpeechData(audioFiles);

  return {
    isValid: clinicalValidation.isValid && speechValidation.isValid,
    errors: {
      clinical: clinicalValidation.errors,
      speech: speechValidation.errors
    }
  };
};