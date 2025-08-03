import DementiaResultsGauge from '../DementiaResultsGauge';
import Loading from '../Loading';
import Check from '../Check';

const DementiaModal = ({
   showModal,
   success,
   resultData,
   speechTranscripts,
   sendRequest,
   handleFetchData,
   handleClose
}) => {
   if (!showModal) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
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
            ) : (
               <>
                  <h2 className="text-2xl font-bold mb-4 text-center text-black">
                     Loading Data . . .
                  </h2>
                  <div className="relative mb-2 ml-2">
                     <pre className="text-lg mb-2 text-black inline w-3/4">Clinical Data </pre>
                     <p className="absolute inset-y-0 right-0 text-lg mb-2 text-black inline w-1/4">
                        <Check />
                     </p>
                  </div>
                  <div className="relative mb-2 ml-2">
                     <pre className="text-lg mb-2 text-black inline w-3/4">CTD Transcript</pre>
                     <p className="absolute inset-y-0 right-0 text-lg mb-2 text-black inline w-1/4">
                        {speechTranscripts.Transcript_CTD ? <Check /> : <Loading />}
                     </p>
                  </div>
                  <div className="relative mb-2 ml-2">
                     <pre className="text-lg mb-2 text-black inline w-3/4">PFT Transcript</pre>
                     <p className="absolute inset-y-0 right-0 text-lg mb-2 text-black inline w-1/4">
                        {speechTranscripts.Transcript_PFT ? <Check /> : <Loading />}
                     </p>
                  </div>
                  <div className="relative mb-2 ml-2">
                     <pre className="text-lg mb-2 text-black inline w-3/4">SFT Transcript</pre>
                     <p className="absolute inset-y-0 right-0 text-lg mb-2 text-black inline w-1/4">
                        {speechTranscripts.Transcript_SFT ? <Check /> : <Loading />}
                     </p>
                  </div>

                  {sendRequest && (
                     <button
                        className="mt-6 px-6 py-2 bg-[#1e293b] text-white rounded hover:bg-[#38f07b] block mx-auto"
                        onClick={handleFetchData}
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
   );
};

export default DementiaModal;
