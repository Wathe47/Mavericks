import { useState,useRef } from "react";
import axiosInstance from "../config/axiosConfig";
import Loading from "../components/Loading";
import AnxietyResultsGauge from "../components/AnxietyResultsGauge";
import {
   validateAnxietyForm,
   validateField,
   areAllFilesUploaded,
   getFileInfo
} from "../validations/anxietyValidate";


const AnxietyModule = () => {

   const [formData, setFormData] = useState({
      audio: null,
      facial1: null,
      facial2: null,
      facial3: null,
      transcript: null
   });

   const audioFileRef = useRef(null);
   const facial1FileRef = useRef(null);
   const facial2FileRef = useRef(null);
   const facial3FileRef = useRef(null);
   const transcriptFileRef = useRef(null);

   const [validationErrors, setValidationErrors] = useState({});
   const [showModal, setShowModal] = useState(false);
   const [success, setSuccess] = useState(false);
   const [resultData, setResultData] = useState({});
   const [error, setError] = useState(null);

   const handleChange = (e) => {
      const { name, files } = e.target;
      if (files.length > 0) {
         const file = files[0];

         // Validate the file
         const fieldError = validateField(name, file);

         // Update validation errors
         setValidationErrors(prev => ({
            ...prev,
            [name]: fieldError
         }));

         // Update form data
         setFormData((prevData) => ({
            ...prevData,
            [name]: file
         }));

         // Clear general error if file is valid
         if (!fieldError) {
            setError(null);
         }
      }
   };

   const handleSubmit = (e) => {
      e.preventDefault();

      // Validate the entire form
      const validation = validateAnxietyForm(formData);

      if (!validation.isValid) {
         setValidationErrors(validation.errors);
         setError("Please fix the validation errors before submitting.");
         return;
      }

      // Check if all files are uploaded
      if (!areAllFilesUploaded(formData)) {
         setError("Please upload all required files.");
         return;
      }

      // Clear errors and proceed with submission
      setValidationErrors({});
      setError(null);
      setShowModal(true);

      console.log("Files submitted:", formData);

      // Example: Create FormData for server upload
      const fileData = new FormData();
      fileData.append('audio', formData.audio);
      fileData.append('facial1', formData.facial1);
      fileData.append('facial2', formData.facial2);
      fileData.append('facial3', formData.facial3);
      fileData.append('transcript', formData.transcript);

      const fetchData = async () => {
         try {
            const response = await axiosInstance.post('/anxiety/predict/', fileData, {
               headers: {
                  'Content-Type': 'multipart/form-data'
               }
            });

            if (response.status === 200) {
               console.log("Prediction successful:", response.data);
               setSuccess(true);
               setResultData(response.data);
            }
         } catch (error) {
            console.error("Error uploading file:", error);
            setError("An error occurred while processing your files. Please try again.");
            setShowModal(false);
         }
      };

      fetchData();
   };

   const handleClose = () => {
      setShowModal(false);
      setSuccess(false);
      setResultData({});
   };

   const handleClear = () => {
      setFormData({
         audio: null,
         facial1: null,
         facial2: null,
         facial3: null,
         transcript: null
      });
      setValidationErrors({});
      setError(null);

      if (audioFileRef.current) audioFileRef.current.value = '';
      if (facial1FileRef.current) facial1FileRef.current.value = '';
      if (facial2FileRef.current) facial2FileRef.current.value = '';
      if (facial3FileRef.current) facial3FileRef.current.value = '';
      if (transcriptFileRef.current) transcriptFileRef.current.value = '';
   };

   return (
      <>
         <video
            src={"./src/assets/animations/video5.mp4"}
            autoPlay
            loop
            muted
            playsInline
            className="fixed top-0 left-0 w-screen h-screen object-cover z-0"
            style={{
               width: '100vw',
               height: '100vh',
               objectFit: 'cover',
               objectPosition: 'center center'
            }}
         />
         <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-10 pointer-events-none"></div>

         {showModal && (

            <div className="fixed inset-0 z-50 flex items-center justify-center ">
               <div className="absolute inset-0 bg-black/45 backdrop-blur-sm"></div>
               <div className="relative bg-white rounded-xl shadow-xl p-10 max-w-lg w-full z-10">
                  {success ? (
                     <>
                        <h1 className="text-2xl font-bold mb-4">Prediction Results</h1>
                        <AnxietyResultsGauge
                           resultData={resultData}
                        />
                     </>
                  ) :
                     (
                        <div className="text-center">
                           <Loading large />
                           <p className="text-lg text-gray-500 mt-4">Please wait while we process your files...</p>
                        </div>
                     )}

                  <button
                     className="absolute top-4 right-4 text-2xl text-gray-700 hover:text-red-500 focus:outline-none z-20"
                     onClick={handleClose}
                     aria-label="Close"
                  >
                     &times;
                  </button>
               </div>
            </div>
         )}

         <div className="relative mt-4 z-20">
            <div className="flex flex-col items-center justify-center py-20">
               <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Anxiety Module</h1>
               <p className="text-lg md:text-xl text-white text-center max-w-2xl">
                  This module is designed to help you understand and manage anxiety. It includes resources, exercises, and support to guide you through your journey.
               </p>
            </div>

            <div className="min-h-screen text-[#cbd5e1]">
               <div className="relative z-1 flex items-center w-1/2 h-flex mb-5 p-3 border border-n-1/10 rounded-3xl lg:p-15 xl:h-full m-auto bg-[#032436]/60 rounded-3xl backdrop-blur-sm " >
                  <div className="relative top-0 left-0 w-full h-full p-6 ">
                     <main className="max-w-lg mx-auto">
                        <form onSubmit={handleSubmit} className="space-y-6">
                           <div>
                              <label htmlFor="audio-upload" className="block text-sm font-semibold mb-1 ">Upload Audio File</label>
                              <input
                                 ref={audioFileRef}
                                 id="audio-upload"
                                 type="file"
                                 name="audio"
                                 onChange={handleChange}
                                 required
                                 className="w-full rounded-md bg-[#1e293b] border border-[#334155] text-[#ffffff] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ffffff] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#2563eb] file:text-white hover:file:bg-[#1d4ed8] "
                              />
                              {validationErrors.audio && (
                                 <p className="text-red-400 tex file type. t-sm mt-1">{validationErrors.audio}</p>
                              )}
                              {formData.audio && !validationErrors.audio && (
                                 <div className="text-green-400 text-sm mt-1">
                                    ✓ {getFileInfo(formData.audio)?.name} ({getFileInfo(formData.audio)?.size})
                                 </div>
                              )}
                           </div>
                           <div>
                              <label htmlFor="facial1-upload" className="block text-sm font-semibold mb-1 ">Upload Facial 1 File</label>
                              <input
                                 ref={facial1FileRef}
                                 id="facial1-upload"
                                 type="file"
                                 name="facial1"
                                 onChange={handleChange}
                                 required
                                 className="w-full rounded-md bg-[#1e293b] border border-[#334155] text-[#ffffff] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ffffff] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#2563eb] file:text-white hover:file:bg-[#1d4ed8] "
                              />
                              {validationErrors.facial1 && (
                                 <p className="text-red-400 text-sm mt-1">{validationErrors.facial1}</p>
                              )}
                              {formData.facial1 && !validationErrors.facial1 && (
                                 <div className="text-green-400 text-sm mt-1">
                                    ✓ {getFileInfo(formData.facial1)?.name} ({getFileInfo(formData.facial1)?.size})
                                 </div>
                              )}
                           </div>
                           <div>
                              <label htmlFor="facial2-upload" className="block text-sm font-semibold mb-1 ">Upload Facial 2 File</label>
                              <input
                                 ref={facial2FileRef}
                                 id="facial2-upload"
                                 type="file"
                                 name="facial2"
                                 onChange={handleChange}
                                 required
                                 className="w-full rounded-md bg-[#1e293b] border border-[#334155] text-[#ffffff] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ffffff] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#2563eb] file:text-white hover:file:bg-[#1d4ed8] "
                              />
                              {validationErrors.facial2 && (
                                 <p className="text-red-400 text-sm mt-1">{validationErrors.facial2}</p>
                              )}
                              {formData.facial2 && !validationErrors.facial2 && (
                                 <div className="text-green-400 text-sm mt-1">
                                    ✓ {getFileInfo(formData.facial2)?.name} ({getFileInfo(formData.facial2)?.size})
                                 </div>
                              )}
                           </div>
                           <div>
                              <label htmlFor="facial3-upload" className="block text-sm font-semibold mb-1 ">Upload Facial 3  File</label>
                              <input
                                 ref={facial3FileRef}
                                 id="facial3-upload"
                                 type="file"
                                 name="facial3"
                                 onChange={handleChange}
                                 required
                                 className="w-full rounded-md bg-[#1e293b] border border-[#334155] text-[#ffffff] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ffffff] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#2563eb] file:text-white hover:file:bg-[#1d4ed8] "
                              />
                              {validationErrors.facial3 && (
                                 <p className="text-red-400 text-sm mt-1">{validationErrors.facial3}</p>
                              )}
                              {formData.facial3 && !validationErrors.facial3 && (
                                 <div className="text-green-400 text-sm mt-1">
                                    ✓ {getFileInfo(formData.facial3)?.name} ({getFileInfo(formData.facial3)?.size})
                                 </div>
                              )}
                           </div>
                           <div>
                              <label htmlFor="transcript-upload" className="block text-sm font-semibold mb-1 ">Upload Transcript File</label>
                              <input
                                 ref={transcriptFileRef}
                                 id="transcript-upload"
                                 type="file"
                                 name="transcript"
                                 onChange={handleChange}
                                 required
                                 className="w-full rounded-md bg-[#1e293b] border border-[#334155] text-[#ffffff] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ffffff] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#2563eb] file:text-white hover:file:bg-[#1d4ed8] "
                              />
                              {validationErrors.transcript && (
                                 <p className="text-red-400 text-sm mt-1">{validationErrors.transcript}</p>
                              )}
                              {formData.transcript && !validationErrors.transcript && (
                                 <div className="text-green-400 text-sm mt-1">
                                    ✓ {getFileInfo(formData.transcript)?.name} ({getFileInfo(formData.transcript)?.size})
                                 </div>
                              )}
                           </div>

                        </form>
                        <div className="flex justify-center gap-40 mt-6">
                           <button
                              onClick={handleClear}
                              className="px-4 py-2 bg-[#1e293b] text-white rounded-md hover:bg-red-500 transition-colors"
                           >
                              Clear
                           </button>
                           <button
                              onClick={handleSubmit}
                              className="px-4 py-2 bg-[#1e293b] text-white rounded-md hover:bg-[#38f07b] transition-colors"
                           >
                              Submit
                           </button>
                        </div>
                        <div className="mt-10 text-center">
                           {error && <p className=" text-red-500 text-lg mt-10">{error}</p>}
                           {success && (
                              <p className="text-green-500 mt-10">File submitted successfully!</p>
                           )}
                        </div>
                     </main>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
};

export default AnxietyModule;