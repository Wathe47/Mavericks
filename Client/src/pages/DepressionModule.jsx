import { useState, useRef } from "react";
import axiosInstance from "../config/axiosConfig";
import Loading from "../components/Loading";
import DepressionResultsGauge from "../components/DepressionResultsGauge";
import {
   validateUploadFile,
   ALLOWED_FILE_TYPES,
   MAX_FILE_SIZE
} from '../validations/depressionValidate';

const DepressionModule = () => {

   const [formData, setFormData] = useState({
      file: null
   });
   const fileInputRef = useRef(null);

   const [showModal, setShowModal] = useState(false);
   const [success, setSuccess] = useState(false);
   const [resultData, setResultData] = useState({});
   const [errors, setErrors] = useState(null);
   const [fileInfo, setFileInfo] = useState({
      name: '',
      size: '',
   });

   const handleChange = (e) => {
      const { name, files } = e.target;
      if (name === 'file') {
         const selectedFile = files[0];

         setFormData((prevData) => ({
            ...prevData,
            file: selectedFile
         }));

         // Real-time validation
         if (selectedFile) {
            const fileError = validateUploadFile(selectedFile);
            setErrors(fileError.errors[0]);

            // Set file info for display
            setFileInfo({
               name: selectedFile.name,
               size: selectedFile.size ? selectedFile.size > 1024 * 1024 ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : `${selectedFile.size / 1024} KB` : '',
            });

         } else {
            setErrors(null);
            setFileInfo({
               name: '',
               size: '',
            });
         }
      }
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      // Handle form submission logic here

      if (!formData.file) {
         setErrors("Please upload a file.");
      } else {

         const fileError = validateUploadFile(formData.file);

         if (!fileError.isValid) {
            setErrors(fileError.errors[0]);
            return;
         }

         setShowModal(true);
         setErrors(null);

         console.log("File submitted:", formData.file);
         console.log("File name:", formData.file.name);

         const fileData = new FormData();
         fileData.append('file', formData.file);

         const fetchData = async () => {
            try {
               const response = await axiosInstance.post('/depression/predict/', fileData, {
                  headers: {
                     'Content-Type': 'multipart/form-data'
                  }
               });

               if (response.status === 200) {
                  setSuccess(true);
                  setResultData(response.data);
               }
            } catch (error) {
               console.error("Error uploading file:", error);
            }
         };

         fetchData();
      }
   };

   const handleClose = () => {
      setShowModal(false);
      setSuccess(false);
      setResultData({});
   };

   const handleClear = () => {
      setFormData({ file: null });
      console.log(formData);
      setErrors(null);
      setFileInfo({
         name: '',
         size: '',
      });

      if (fileInputRef.current) {
         fileInputRef.current.value = '';
      }
   };

   return (
      <>
         <video
            src={"./src/assets/animations/video7.mp4"}
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
                     <DepressionResultsGauge
                        name="Clinical Data"
                        value={67.89}
                        color="#FF5F6D"
                        severity="Severe"
                        resultData={resultData}
                     />
                  ) :
                     (
                        <div className="text-center">
                           <Loading large />
                           <p className="text-lg text-gray-500 mt-4">Please wait while we process your file...</p>
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
               <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Depression Module</h1>
               <p className="text-lg md:text-xl text-white text-center max-w-2xl">
                  This module is designed to help you understand and manage depression. It includes resources, exercises, and support to guide you through your journey.
               </p>
            </div>

            <div className="min-h-screen text-[#cbd5e1]">
               <div className="relative z-1 flex items-center w-1/2 h-flex mb-5 p-3 border border-n-1/10 rounded-3xl lg:p-15 xl:h-full m-auto bg-[#032436]/60 rounded-3xl backdrop-blur-sm " >
                  <div className="relative top-0 left-0 w-full h-full p-6 ">
                     <main className="max-w-lg mx-auto">
                        <form onSubmit={handleSubmit} className="space-y-6">
                           <div>
                              <label htmlFor="file-upload" className="block text-sm font-semibold mb-1">
                                 Upload EEG File (.edf or .mat)
                              </label>
                              <div className="mb-2 text-xs mb-5 text-gray-400">
                                 Accepted formats: {ALLOWED_FILE_TYPES.join(', ')} |
                                 Max size: {(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB
                              </div>
                              <input
                                 ref={fileInputRef}
                                 id="file-upload"
                                 type="file"
                                 name="file"
                                 onChange={handleChange}
                                 required
                                 className={`w-full rounded-md bg-[#1e293b] border ${errors?.file ? 'border-red-500' : 'border-[#334155]'
                                    } text-[#ffffff] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ffffff] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#2563eb] file:text-white hover:file:bg-[#1d4ed8]`}
                              />

                              {errors && (
                                 <p className="text-red-400 text-sm mt-1">{errors}</p>
                              )}

                              {(fileInfo.name !== '' && fileInfo.size !== '') && !errors && (
                                 <div className="text-green-400 text-sm mt-1">
                                    ✓ {fileInfo?.name} ({fileInfo?.size})
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

export default DepressionModule;