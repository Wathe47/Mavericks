/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from 'react';
import axiosInstance from '../config/axiosConfig';
import Heading from '../components/Heading';
import AudioRecorder from '../components/AudioRecorder';
import Loading from '../components/Loading';
import Check from '../components/Check';
import DementiaResultsGauge from '../components/DementiaResultsGauge';

const initialState = {
   clinical: {
      Age: null,
      Gender: null,
      BMI: null,
      FamilyHistoryAlzheimers: 0,
      Hypertension: 0,
      CardiovascularDisease: 0,
      MMSE: null,
      ADL: null,
      FunctionalAssessment: null,
      MemoryComplaints: 0,
      BehavioralProblems: 0
   },
   speech: {
      Transcript_CTD: null,
      Transcript_PFT: null,
      Transcript_SFT: null
   }
};

const DementiaModule = () => {

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
   const [showRecords, setShowRecords] = useState(false)

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
         }
      };
      fetchData();
      setLoading(false);
   };

   function validateClinicalData(clinical) {
      return Object.values(clinical).every(
         value => value !== null && value !== "" && !(typeof value === "number" && isNaN(value))
      );
   }

   const handleClear = () => {
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
      setSendRequest(false);
      setShowModal(false);
      setSuccess(false);
      setResultData(null);
      setError(null);
   };

   const handleClose = () => {
      setShowModal(false);
      setSuccess(false);
      setResultData(null);
      setError(null);
      setShowRecords(null)
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      try {
         if (!validateClinicalData(formData.clinical)) {
            setError("Please fill in all clinical data fields.");
            setLoading(false);
            return;
         }
         if (audioFiles.CTD && audioFiles.PFT && audioFiles.SFT) {
            setError('');
            setShowModal(true)
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
         setShowRecords(true)
      } catch (err) {
         console.error('Error fetching records:', err);
         setError('Failed to fetch records. Please try again later.');
      } finally {
         setLoading(false);
      }
   };



   return (
      <>
         <video
            src={"./src/assets/animations/video3.mp4"}
            autoPlay
            loop
            muted
            playsInline
            className="fixed top-0 left-0 w-full h-full object-cover z-0 "
            style={{ minHeight: '100vh', minWidth: '100vw' }}
         />
         <div className="fixed top-0 left-0 w-full h-full bg-black/10 z-10 pointer-events-none"></div>
         {showModal && (

            <div className="fixed inset-0 z-50 flex items-center justify-center ">
               <div className="absolute inset-0 bg-black/45 backdrop-blur-sm"></div>
               <div className="relative bg-white rounded-xl shadow-xl p-10 max-w-lg w-full z-10">
                  {success ? (
                     <DementiaResultsGauge
                        name="Clinical Data"
                        value={67.89}
                        color="#FF5F6D"
                        severity="Severe"
                        resultData={resultData}
                     />
                  ) :
                     (
                        <>
                           <h2 className="text-2xl font-bold mb-4 text-center text-black">Loading Data . . .</h2>
                           <div className="relative mb-2 ml-2">
                              <pre className="text-lg mb-2 text-black inline w-3/4">Clinical Data </pre>
                              <p className="absolute inset-y-0 right-0 text-lg  mb-2 text-black inline w-1/4"><Check /></p>
                           </div>
                           <div className="relative mb-2 ml-2">
                              <pre className="text-lg mb-2 text-black inline w-3/4">CTD Transcript</pre>
                              <p className="absolute inset-y-0 right-0 text-lg  mb-2 text-black inline w-1/4">{speechTranscripts.Transcript_CTD ? <Check /> : <Loading />}</p>
                           </div>
                           <div className="relative mb-2 ml-2">
                              <pre className="text-lg mb-2 text-black inline w-3/4">PFT Transcript</pre>
                              <p className="absolute inset-y-0 right-0 text-lg  mb-2 text-black inline w-1/4">{speechTranscripts.Transcript_PFT ? <Check /> : <Loading />}</p>
                           </div>
                           <div className="relative mb-2 ml-2">
                              <pre className="text-lg mb-2 text-black inline w-3/4">SFT Transcript</pre>
                              <p className="absolute inset-y-0 right-0 text-lg  mb-2 text-black inline w-1/4">{speechTranscripts.Transcript_SFT ? <Check /> : <Loading />}</p>
                           </div>

                           {sendRequest && (
                              <button
                                 className="mt-6 px-6 py-2 bg-[#1e293b] text-white rounded hover:bg-[#38f07b] block mx-auto"
                                 onClick={() => handleFetchData()}
                              >
                                 Submit
                              </button>
                           )}

                        </>
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

         <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-10 pointer-events-none"></div>
         {showRecords && (

            <div className="fixed inset-0 z-50 flex items-center justify-center ">
               <div className="absolute inset-0 bg-black/45 backdrop-blur-sm"></div>
               <div className="relative bg-white rounded-xl shadow-xl p-10 max-w-5xl w-full z-10"> {/* Increased max width */}

                  {records && Array.isArray(records) && records.length > 0 ? (
                     <div>
                        <h2 className="text-xl font-bold mb-4 text-center text-black">Previous Records</h2>
                        <div className="overflow-x-auto overflow-y-auto max-h-[500px]"> {/* Added horizontal scroll and increased height */}
                           <table className="min-w-full text-left text-sm">
                              <thead>
                                 <tr>
                                    {Object.keys(records[0]).map((key) => (
                                       <th key={key} className="px-4 py-2 border-b font-semibold text-black whitespace-nowrap">{key}</th>
                                    ))}
                                 </tr>
                              </thead>
                              <tbody>
                                 {records.map((record, idx) => (
                                    <tr key={idx} className="hover:bg-gray-100">
                                       {Object.values(record).map((value, i) => (
                                          <td key={i} className="px-4 py-2 border-b text-black whitespace-nowrap">{String(value)}</td>
                                       ))}
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  ) : (
                     <p className="text-center text-black">No records found.</p>
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

         <div className="relative z-10 min-h-screen p-6 mt-16 text-[#cbd5e1]">
            <Heading
               title="Clinical Data Submission"
            />
            <div className='flex justify-center mt-5 mb-10'>
               <button
                  onClick={handleFetchRecords}
                  className={`px-6 py-3 rounded-md text-white bg-[#1e293b] hover:bg-[#38f07b] transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
               >
                  Previous Records
               </button>
            </div>
            <div className="relative z-1 flex items-center w-1/2 h-flex mb-5 p-3 border border-n-1/10 rounded-3xl lg:p-15 xl:h-full m-auto bg-[#0f172ab3] rounded-3xl backdrop-blur-sm " >
               <div className="relative top-0 left-0 w-full h-full  p-6 ">
                  <main className="max-w-lg mx-auto">
                     <form onSubmit={handleSubmit} className="space-y-6">

                        <div>
                           <label htmlFor="age" className="block text-sm font-semibold mb-1">Age</label>
                           <input
                              id="age"
                              type="number"
                              name="clinical.Age"
                              value={formData.clinical.Age}
                              onChange={handleChange}
                              required
                              className="w-full rounded-md bg-[#1e293b] border border-[#334155] text-[#ffffff] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ffffff]"
                           />
                        </div>
                        <div>
                           <label htmlFor="gender" className="block text-sm font-semibold mb-1">Gender</label>
                           <select
                              id="gender"
                              name="clinical.Gender"
                              value={formData.clinical.Gender}
                              onChange={handleChange}
                              required
                              className="w-full rounded-md bg-[#1e293b] border border-[#334155] text-[#ffffff] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ffffff]"
                           >
                              <option value="">Select</option>
                              <option value="0">Male</option>
                              <option value="1">Female</option>
                           </select>
                        </div>
                        <div>
                           <label htmlFor="bmi" className="block text-sm font-semibold mb-1">BMI</label>
                           <input
                              id="bmi"
                              type="number"
                              step="0.01"
                              name="clinical.BMI"
                              value={formData.clinical.BMI}
                              onChange={handleChange}
                              required
                              className="w-full rounded-md bg-[#1e293b] border border-[#334155] text-[#ffffff] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ffffff]"
                           />
                        </div>
                        <div className="flex items-center justify-between">
                           <label htmlFor="family-history" className="text-sm font-semibold">
                              Family History of Alzheimer's
                           </label>
                           <div className="flex items-center space-x-2">
                              <input
                                 id="family-history"
                                 type="checkbox"
                                 name="clinical.FamilyHistoryAlzheimers"
                                 checked={formData.clinical.FamilyHistoryAlzheimers === 1}
                                 onChange={(e) =>
                                    handleChange({
                                       target: {
                                          name: "clinical.FamilyHistoryAlzheimers",
                                          value: e.target.checked ? 1 : 0,
                                       },
                                    })
                                 }
                                 className="rounded-md bg-[#1e293b] border border-[#334155] text-[#64748b] focus:ring-1 focus:ring-[#64748b]"
                              />
                              <span className="text-sm text-[#94a3b8]">Yes</span>
                           </div>
                        </div>

                        <div className="flex items-center justify-between">
                           <label htmlFor="hypertension" className="text-sm font-semibold">
                              Hypertension
                           </label>
                           <div className="flex items-center space-x-2">
                              <input
                                 id="hypertension"
                                 type="checkbox"
                                 name="clinical.Hypertension"
                                 checked={formData.clinical.Hypertension === 1}
                                 onChange={(e) =>
                                    handleChange({
                                       target: {
                                          name: "clinical.Hypertension",
                                          value: e.target.checked ? 1 : 0,
                                       },
                                    })
                                 }
                                 className="rounded-md bg-[#1e293b] border border-[#334155] text-[#64748b] focus:ring-1 focus:ring-[#64748b]"
                              />
                              <span className="text-sm text-[#94a3b8]">Yes</span>
                           </div>
                        </div>
                        <div className="flex items-center justify-between">
                           <label htmlFor="cardiovascular-disease" className="text-sm font-semibold">
                              Cardiovascular Disease
                           </label>
                           <div className="flex items-center space-x-2">
                              <input
                                 id="cardiovascular-disease"
                                 type="checkbox"
                                 name="clinical.CardiovascularDisease"
                                 checked={formData.clinical.CardiovascularDisease === 1}
                                 onChange={(e) =>
                                    handleChange({
                                       target: {
                                          name: "clinical.CardiovascularDisease",
                                          value: e.target.checked ? 1 : 0,
                                       },
                                    })
                                 }
                                 className="rounded-md bg-[#1e293b] border border-[#334155] text-[#64748b] focus:ring-1 focus:ring-[#64748b]"
                              />
                              <span className="text-sm text-[#94a3b8]">Yes</span>
                           </div>
                        </div>
                        <div>
                           <label htmlFor="mmse" className="block text-sm font-semibold mb-1">MMSE Score</label>
                           <input
                              id="mmse"
                              type="number"
                              name="clinical.MMSE"
                              value={formData.clinical.MMSE}
                              onChange={handleChange}
                              required
                              className="w-full rounded-md bg-[#1e293b] border border-[#334155] text-[#ffffff] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ffffff]"
                           />
                        </div>
                        <div>
                           <label htmlFor="adl" className="block text-sm font-semibold mb-1">ADL Score</label>
                           <input
                              id="adl"
                              type="number"
                              name="clinical.ADL"
                              value={formData.clinical.ADL}
                              onChange={handleChange}
                              required
                              className="w-full rounded-md bg-[#1e293b] border border-[#334155] text-[#ffffff] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ffffff]"
                           />
                        </div>
                        <div>
                           <label htmlFor="functional-assessment" className="block text-sm font-semibold mb-1">Functional Assessment</label>
                           <input
                              id="functional-assessment"
                              type="number"
                              name="clinical.FunctionalAssessment"
                              value={formData.clinical.FunctionalAssessment}
                              onChange={handleChange}
                              required
                              className="w-full rounded-md bg-[#1e293b] border border-[#334155] text-[#ffffff] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ffffff]"
                           />
                        </div>
                        <div className="flex items-center justify-between">
                           <label htmlFor="memory-complaints" className="text-sm font-semibold">
                              Memory Complaints
                           </label>
                           <div className="flex items-center space-x-2">
                              <input
                                 id="memory-complaints"
                                 type="checkbox"
                                 name="clinical.MemoryComplaints"
                                 checked={formData.clinical.MemoryComplaints === 1}
                                 onChange={(e) =>
                                    handleChange({
                                       target: {
                                          name: "clinical.MemoryComplaints",
                                          value: e.target.checked ? 1 : 0,
                                       },
                                    })
                                 }
                                 className="rounded-md bg-[#1e293b] border border-[#334155] text-[#64748b] focus:ring-1 focus:ring-[#64748b]"
                              />
                              <span className="text-sm text-[#94a3b8]">Yes</span>
                           </div>
                        </div>
                        <div className="flex items-center justify-between">
                           <label htmlFor="behavioral-problems" className="text-sm font-semibold">
                              Behavioral Problems
                           </label>
                           <div className="flex items-center space-x-2">
                              <input
                                 id="behavioral-problems"
                                 type="checkbox"
                                 name="clinical.BehavioralProblems"
                                 checked={formData.clinical.BehavioralProblems === 1}
                                 onChange={(e) =>
                                    handleChange({
                                       target: {
                                          name: "clinical.BehavioralProblems",
                                          value: e.target.checked ? 1 : 0,
                                       },
                                    })
                                 }
                                 className="rounded-md bg-[#1e293b] border border-[#334155] text-[#64748b] focus:ring-1 focus:ring-[#64748b]"
                              />
                              <span className="text-sm text-[#94a3b8]">Yes</span>
                           </div>
                        </div>

                     </form>
                  </main>
               </div>
            </div>

            <div className="h-20"></div>
            <Heading
               title="Speech Data Submission"
            />
            <div className="flex justify-center mb-5 -mt-5 font-medium">
               <h5 className="h5 m-0 text-center">Cookie Theft Test</h5>
            </div>
            <div className="relative z-1 flex items-center w-1/2  mb-5 p-3 border border-n-1/10 rounded-3xl lg:p-5 m-auto bg-[#0f172ab3] rounded-3xl backdrop-blur-sm " >
               <div className="relative top-0 left-0 w-full h-full  p-6 ">
                  <div className='mb-6'><span className="text-md italic text-[#94a3b8]">Purpose: Assesses narrative discourse, visuospatial processing, and executive function through story organization</span>
                  </div>
                  <img src="./src/assets/ct-image.ppm" alt="Cookie Theft Test" className="w-full h-auto mb-10 rounded-lg" />
                  <h6 className="h7 mb-10 font-semibold ">Tell me everything you see going on in this picture:</h6>
                  <AudioRecorder onTranscript={transcript => setSpeechTranscripts(prev => ({ ...prev, Transcript_CTD: transcript }))} onAudioAvailable={isAudio => setAudioFiles(prev => ({ ...prev, CTD: isAudio }))} />
               </div>
            </div>
            <div className="h-20"></div>
            <div className="flex justify-center mb-5 -mt-5 font-medium">
               <h5 className="h5 m-0 text-center">Phonemic Verbal Fluency Task</h5>
            </div>
            <div className="relative z-1 flex items-center w-1/2 h-flex mb-5 p-3 border border-n-1/10 rounded-3xl lg:p-5 xl:h-full m-auto bg-[#0f172ab3] rounded-3xl backdrop-blur-sm " >
               <div className="relative top-0 left-0 w-full h-full  p-6 ">
                  <div className='mb-2'><span className="text-md italic text-[#94a3b8]">Purpose: Evaluates phonemic fluency, executive function, and language processing through word generation</span>
                  </div>
                  <div className='mb-6'><span className="text-md italic text-[#94a3b8]">Time limit: Typically 60 seconds</span>
                  </div>
                  <h6 className="h7 mb-10 font-semibold ">Name as many words as possible starting with the letter "P":</h6>

                  <AudioRecorder onTranscript={transcript => setSpeechTranscripts(prev => ({ ...prev, Transcript_PFT: transcript }))} onAudioAvailable={isAudio => setAudioFiles(prev => ({ ...prev, PFT: isAudio }))} />
               </div>
            </div>
            <div className="h-20"></div>
            <div className="flex justify-center mb-5 -mt-5 font-medium">
               <h5 className="h5 m-0 text-center">Semantic Verbal Fluency Task</h5>
            </div>
            <div className="relative z-1 flex items-center w-1/2 h-flex mb-5 p-3 border border-n-1/10 rounded-3xl lg:p-5 xl:h-full m-auto bg-[#0f172ab3] rounded-3xl backdrop-blur-sm " >
               <div className="relative top-0 left-0 w-full h-full  p-6 ">
                  <div className='mb-2'><span className="text-md italic text-[#94a3b8]">Purpose: Assesses semantic fluency, executive function, and language processing through category-based word generation </span>
                  </div>
                  <div className='mb-6'><span className="text-md italic text-[#94a3b8]">Time limit: Typically 60 seconds</span>
                  </div>
                  <h6 className="h7 mb-10 font-semibold "> Name as many animal names as possible:</h6>

                  <AudioRecorder onTranscript={transcript => setSpeechTranscripts(prev => ({ ...prev, Transcript_SFT: transcript }))} onAudioAvailable={isAudio => setAudioFiles(prev => ({ ...prev, SFT: isAudio }))} />               </div>
            </div>
            <div className="flex justify-center gap-40 mt-20">
               <button
                  onClick={handleClear}
                  className={`px-6 py-3 rounded-md text-white bg-[#1e293b] hover:bg-red-500 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
               >
                  Clear Data
               </button>
               <button
                  onClick={handleSubmit}
                  className={`px-6 py-3 rounded-md text-white bg-[#1e293b] hover:bg-[#38f07b] transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
               >
                  {loading ? 'Submitting...' : 'Submit Data'}
               </button>

            </div>
            <div className="flex justify-center mt-5 text-lg font-semibold">
               {error && <p className="text-red-500"> {error}</p>}
               {success && <p className="text-green-500">Data submitted successfully!</p>}
            </div>



         </div>
      </>
   );
};

export default DementiaModule;