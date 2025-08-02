import { useState, useRef, useEffect, useCallback } from 'react';
import axiosInstance from '../config/axiosConfig';
import { validateField, validateForm } from '../validations/dementiaValidate';

const initialState = {
   clinical: {
      Age: '',
      Gender: '',
      BMI: '',
      FamilyHistoryAlzheimers: 0,
      Hypertension: 0,
      CardiovascularDisease: 0,
      MMSE: '',
      ADL: '',
      FunctionalAssessment: '',
      MemoryComplaints: 0,
      BehavioralProblems: 0
   },
   speech: {
      Transcript_CTD: '',
      Transcript_PFT: '',
      Transcript_SFT: ''
   }
};

export const useDementiaForm = () => {
   const [formData, setFormData] = useState(initialState);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [success, setSuccess] = useState(false);
   const [speechTranscripts, setSpeechTranscripts] = useState({
      Transcript_CTD: null,
      Transcript_PFT: null,
      Transcript_SFT: null
   });
   const [audioFiles, setAudioFiles] = useState({
      CTD: false,
      PFT: false,
      SFT: false
   });
   const [sendRequest, setSendRequest] = useState(false);
   const [showModal, setShowModal] = useState(false);
   const [resultData, setResultData] = useState(null);
   const [records, setRecords] = useState(null);
   const [showRecords, setShowRecords] = useState(false);
   const [validationErrors, setValidationErrors] = useState({});

   const ctdRecorderRef = useRef(null);
   const pftRecorderRef = useRef(null);
   const sftRecorderRef = useRef(null);

   const handleChange = (e) => {
      const { name, value } = e.target;
      const [section, field] = name.split('.');
      setFormData((prev) => ({
         ...prev,
         [section]: {
            ...prev[section],
            [field]: value
         }
      }));

      const fieldError = validateField(field, value);
      setValidationErrors(prev => ({
         ...prev,
         [field]: fieldError
      }));
   };

   useEffect(() => {
      if (speechTranscripts.Transcript_CTD && speechTranscripts.Transcript_PFT && speechTranscripts.Transcript_SFT) {
         setSendRequest(true);
      }
   }, [speechTranscripts]);

   const handleFetchData = () => {
      if (!sendRequest) return;
      setLoading(true);
      setError(null);

      const fetchData = async () => {
         try {
            const response = await axiosInstance.post('/dementia/predict', {
               ...formData,
               speech: speechTranscripts
            });
            if (response.status !== 200) {
               throw new Error('Failed to submit data');
            }
            console.log('Response:', response.data);
            setSuccess(true);
            setResultData(response.data);
            setShowModal(true);
         } catch (err) {
            console.error('Error fetching initial data:', err);
            setError('Failed to load initial data. Please try again later.');
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   };

   const handleClear = useCallback(() => {
      console.log('Clearing form data');

      setFormData(initialState);
      setSpeechTranscripts({
         Transcript_CTD: null,
         Transcript_PFT: null,
         Transcript_SFT: null
      });
      setAudioFiles({
         CTD: false,
         PFT: false,
         SFT: false
      });

      if (ctdRecorderRef.current) {
         ctdRecorderRef.current.handleClear();
      }
      if (pftRecorderRef.current) {
         pftRecorderRef.current.handleClear();
      }
      if (sftRecorderRef.current) {
         sftRecorderRef.current.handleClear();
      }

      setSendRequest(false);
      setShowModal(false);
      setSuccess(false);
      setResultData(null);
      setError(null);
      setLoading(false);
      setValidationErrors({});
   }, []);

   const handleClose = () => {
      setShowModal(false);
      setSuccess(false);
      setResultData(null);
      setError(null);
      setShowRecords(false);
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
         const validation = validateForm(formData, audioFiles);

         if (!validation.isValid) {
            setValidationErrors({
               ...validation.errors.clinical,
               speech: validation.errors.speech
            });
            setError("Please fix the validation errors before submitting.");
            setLoading(false);
            return;
         }

         setValidationErrors({});

         if (audioFiles.CTD && audioFiles.PFT && audioFiles.SFT) {
            setError('');
            setShowModal(true);
         } else {
            setError('Please record all speech tasks before submitting.');
            return;
         }
      } catch (err) {
         setError(err);
      } finally {
         setLoading(false);
      }
   };

   const handleFetchRecords = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
         const response = await axiosInstance.get('/dementia/records');
         if (response.status !== 200) {
            throw new Error('Failed to fetch records');
         }
         console.log('Fetched records:', response.data);
         setRecords(response.data);
         setShowRecords(true);
      } catch (err) {
         console.error('Error fetching records:', err);
         setError('Failed to fetch records. Please try again later.');
      } finally {
         setLoading(false);
      }
   };

   return {
      // State
      formData,
      loading,
      error,
      success,
      speechTranscripts,
      audioFiles,
      sendRequest,
      showModal,
      resultData,
      records,
      showRecords,
      validationErrors,

      // Refs
      ctdRecorderRef,
      pftRecorderRef,
      sftRecorderRef,

      // Handlers
      handleChange,
      handleFetchData,
      handleClear,
      handleClose,
      handleSubmit,
      handleFetchRecords,

      // Setters for speech data
      setSpeechTranscripts,
      setAudioFiles,
      setValidationErrors
   };
};
