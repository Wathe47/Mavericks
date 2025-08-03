// File validation constants
export const AUDIO_FILE_TYPES = ['.wav'];
export const FACIAL_FILE_TYPES = ['.txt'];
export const TRANSCRIPT_FILE_TYPES = ['.csv'];


// Audio file validation
const validateAudioFile = (file) => {
  if (!file) {
    return 'Please select an audio file';
  }

  const fileName = file.name.toLowerCase();
  const hasValidExtension = AUDIO_FILE_TYPES.some(type => 
    fileName.endsWith(type.toLowerCase())
  );

  if (!hasValidExtension) {
    return `Invalid audio file type. Allowed: ${AUDIO_FILE_TYPES.join(', ')}`;
  }

  return null;
};

// Image/Facial file validation
const validateFacialFile = (file, fieldName) => {
  if (!file) {
    return `Please select a ${fieldName} file`;
  }

  const fileName = file.name.toLowerCase();
  const hasValidExtension = FACIAL_FILE_TYPES.some(type => 
    fileName.endsWith(type.toLowerCase())
  );

  if (!hasValidExtension) {
    return `Invalid ${fieldName} file type. Allowed: ${FACIAL_FILE_TYPES.join(', ')}`;
  }

  return null;
};

// Transcript file validation
const validateTranscriptFile = (file) => {
  if (!file) {
    return 'Please select a transcript file';
  }

  const fileName = file.name.toLowerCase();
  const hasValidExtension = TRANSCRIPT_FILE_TYPES.some(type => 
    fileName.endsWith(type.toLowerCase())
  );

  if (!hasValidExtension) {
    return `Invalid transcript file type. Allowed: ${TRANSCRIPT_FILE_TYPES.join(', ')}`;
  }

  return null;
};

// Individual file validators
export const validateAudio = (file) => {
  const error = validateAudioFile(file);
  return {
    isValid: !error,
    error
  };
};

export const validateFacial1 = (file) => {
  const error = validateFacialFile(file, 'Facial 1');
  return {
    isValid: !error,
    error
  };
};

export const validateFacial2 = (file) => {
  const error = validateFacialFile(file, 'Facial 2');
  return {
    isValid: !error,
    error
  };
};

export const validateFacial3 = (file) => {
  const error = validateFacialFile(file, 'Facial 3');
  return {
    isValid: !error,
    error
  };
};

export const validateTranscript = (file) => {
  const error = validateTranscriptFile(file);
  return {
    isValid: !error,
    error
  };
};

// Main form validation function
export const validateAnxietyForm = (formData) => {
  const errors = {};

  // Validate audio file
  const audioValidation = validateAudio(formData.audio);
  if (!audioValidation.isValid) {
    errors.audio = audioValidation.error;
  }

  // Validate facial files
  const facial1Validation = validateFacial1(formData.facial1);
  if (!facial1Validation.isValid) {
    errors.facial1 = facial1Validation.error;
  }

  const facial2Validation = validateFacial2(formData.facial2);
  if (!facial2Validation.isValid) {
    errors.facial2 = facial2Validation.error;
  }

  const facial3Validation = validateFacial3(formData.facial3);
  if (!facial3Validation.isValid) {
    errors.facial3 = facial3Validation.error;
  }

  // Validate transcript file
  const transcriptValidation = validateTranscript(formData.transcript);
  if (!transcriptValidation.isValid) {
    errors.transcript = transcriptValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Real-time field validation
export const validateField = (fieldName, file) => {
  switch (fieldName) {
    case 'audio':
      return validateAudio(file).error;
    case 'facial1':
      return validateFacial1(file).error;
    case 'facial2':
      return validateFacial2(file).error;
    case 'facial3':
      return validateFacial3(file).error;
    case 'transcript':
      return validateTranscript(file).error;
    default:
      return null;
  }
};

// Get file info for display
export const getFileInfo = (file) => {
  if (!file) return null;

  return {
    name: file.name,
    size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    type: file.name.split('.').pop().toUpperCase(),
    lastModified: new Date(file.lastModified).toLocaleDateString()
  };
};

// Check if all required files are uploaded
export const areAllFilesUploaded = (formData) => {
  return formData.audio && 
         formData.facial1 && 
         formData.facial2 && 
         formData.facial3 && 
         formData.transcript;
};

export const getFileCategory = (file) => {
  if (!file) return null;
  
  const fileName = file.name.toLowerCase();
  
  if (AUDIO_FILE_TYPES.some(type => fileName.endsWith(type))) {
    return 'audio';
  }
  if (FACIAL_FILE_TYPES.some(type => fileName.endsWith(type))) {
    return 'image';
  }
  if (TRANSCRIPT_FILE_TYPES.some(type => fileName.endsWith(type))) {
    return 'transcript';
  }
  
  return 'unknown';
};