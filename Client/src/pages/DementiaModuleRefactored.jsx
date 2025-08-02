/* eslint-disable react/no-unescaped-entities */
import Heading from '../components/Heading';
import ClinicalDataForm from '../components/dementia/ClinicalDataForm';
import SpeechTaskCard from '../components/dementia/SpeechTaskCard';
import DementiaModal from '../components/dementia/DementiaModal';
import RecordsModal from '../components/dementia/RecordsModal';
import { useDementiaForm } from '../hooks/useDementiaForm';

const DementiaModuleRefactored = () => {
   const {
      // State
      formData,
      loading,
      error,
      success,
      speechTranscripts,
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

      // Setters
      setSpeechTranscripts,
      setAudioFiles,
      setValidationErrors
   } = useDementiaForm();

   return (
      <>
         <video
            src={"./src/assets/animations/video3.mp4"}
            autoPlay
            loop
            muted
            playsInline
            className="fixed top-0 left-0 w-full h-full object-cover z-0"
            style={{ minHeight: '100vh', minWidth: '100vw' }}
         />
         <div className="fixed top-0 left-0 w-full h-full bg-black/10 z-10 pointer-events-none"></div>

         <DementiaModal
            showModal={showModal}
            success={success}
            resultData={resultData}
            speechTranscripts={speechTranscripts}
            sendRequest={sendRequest}
            handleFetchData={handleFetchData}
            handleClose={handleClose}
         />

         <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-10 pointer-events-none"></div>

         <RecordsModal
            showRecords={showRecords}
            records={records}
            handleClose={handleClose}
         />

         <div className="relative z-10 min-h-screen p-6 mt-0 text-[#cbd5e1]">
            <div className="flex flex-col items-center justify-center py-20">
               <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  Dementia Module
               </h1>
               <p className="text-lg md:text-xl text-white text-center max-w-2xl">
                  This module is designed to assist in the early detection and classification of dementia by analyzing both clinical data and patient speech
               </p>
            </div>

            <div className='flex justify-center mt-5 mb-10'>
               <div className="w-1/2 flex justify-end">
                  <button
                     onClick={handleFetchRecords}
                     className={`flex items-center justify-center gap-2 px-6 py-3 rounded-md text-white bg-[#1e293b] hover:bg-[#38f07b] transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                     <img src="./src/assets/history-icon.png" alt="history" className="w-5 h-4" />
                     Previous Records
                  </button>
               </div>
            </div>

            <Heading title="Clinical Data Submission" />
            <div className="relative z-1 flex items-center -mt-10 w-1/2 h-flex mb-5 p-3 border border-n-1/10 rounded-3xl lg:p-15 xl:h-full m-auto bg-[#0f172ab3] rounded-3xl backdrop-blur-sm">
               <div className="relative top-0 left-0 w-full h-full p-6">
                  <main className="max-w-lg mx-auto">
                     <ClinicalDataForm
                        formData={formData}
                        validationErrors={validationErrors}
                        handleChange={handleChange}
                     />
                  </main>
               </div>
            </div>

            {/* Speech Data Section */}
            <div className="h-20"></div>
            <Heading title="Speech Data Submission" />

            {/* Cookie Theft Task */}
            <SpeechTaskCard
               title="Cookie Theft Test"
               purpose="Assesses narrative discourse, visuospatial processing, and executive function through story organization"
               instruction="Tell me everything you see going on in this picture:"
               image="./src/assets/ct-image.ppm"
               onTranscript={transcript => setSpeechTranscripts(prev => ({ ...prev, Transcript_CTD: transcript }))}
               onAudioAvailable={isAudio => {
                  setAudioFiles(prev => ({ ...prev, CTD: isAudio }));
                  if (isAudio) {
                     setValidationErrors(prev => ({ ...prev, speech: { ...prev.speech, CTD_Audio: '' } }));
                  }
               }}
               validationError={validationErrors.speech?.CTD_Audio}
               ref={ctdRecorderRef}
            />

            <div className="h-20"></div>

            {/* Phonemic Fluency Task */}
            <SpeechTaskCard
               title="Phonemic Verbal Fluency Task"
               purpose="Evaluates phonemic fluency, executive function, and language processing through word generation"
               timeLimit="Typically 60 seconds"
               instruction='Name as many words as possible starting with the letter "P":'
               onTranscript={transcript => setSpeechTranscripts(prev => ({ ...prev, Transcript_PFT: transcript }))}
               onAudioAvailable={isAudio => {
                  setAudioFiles(prev => ({ ...prev, PFT: isAudio }));
                  if (isAudio) {
                     setValidationErrors(prev => ({ ...prev, speech: { ...prev.speech, PFT_Audio: '' } }));
                  }
               }}
               validationError={validationErrors.speech?.PFT_Audio}
               ref={pftRecorderRef}
            />

            <div className="h-20"></div>

            {/* Semantic Fluency Task */}
            <SpeechTaskCard
               title="Semantic Verbal Fluency Task"
               purpose="Assesses semantic fluency, executive function, and language processing through category-based word generation"
               timeLimit="Typically 60 seconds"
               instruction="Name as many animal names as possible:"
               onTranscript={transcript => setSpeechTranscripts(prev => ({ ...prev, Transcript_SFT: transcript }))}
               onAudioAvailable={isAudio => {
                  setAudioFiles(prev => ({ ...prev, SFT: isAudio }));
                  if (isAudio) {
                     setValidationErrors(prev => ({ ...prev, speech: { ...prev.speech, SFT_Audio: '' } }));
                  }
               }}
               validationError={validationErrors.speech?.SFT_Audio}
               ref={sftRecorderRef}
            />

            {/* Action Buttons */}
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

            {/* Status Messages */}
            <div className="flex justify-center mt-5 text-lg font-semibold">
               {error && <p className="text-red-500">{error}</p>}
               {success && <p className="text-green-500">Data submitted successfully!</p>}
            </div>
         </div>
      </>
   );
};

export default DementiaModuleRefactored;
