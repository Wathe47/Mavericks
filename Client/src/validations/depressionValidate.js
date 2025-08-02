export const ALLOWED_FILE_TYPES = ['.edf', '.mat'];
export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

const validateFile = (file) => {
   if (!file) {
      return 'Please select a file';
   }

   if (file.size > MAX_FILE_SIZE) {
      return 'File is too large. Maximum size is 500MB';
   }

   const fileName = file.name.toLowerCase();
   const hasValidExtension = ALLOWED_FILE_TYPES.some(type =>
      fileName.endsWith(type.toLowerCase())
   );

   if (!hasValidExtension) {
      return `Invalid file type. Allowed: ${ALLOWED_FILE_TYPES.join(', ')}`;
   }

   if (file.size === 0) {
      return 'File is empty';
   }

   return null; 
};


export const validateUploadFile = (file) => {
   const errors = [];

   const fileError = validateFile(file);
   if (fileError) errors.push(fileError);

   return {
      isValid: errors.length === 0,
      errors
   };
};


