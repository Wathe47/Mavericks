import { forwardRef } from 'react';
import AudioRecorder from '../AudioRecorder';

const SpeechTaskCard = forwardRef(({
   title,
   purpose,
   timeLimit,
   instruction,
   image,
   onTranscript,
   onAudioAvailable,
   validationError
}, ref) => {
   return (
      <>
         <div className="flex justify-center mb-5 -mt-5 font-medium">
            <h5 className="h5 m-0 text-center">{title}</h5>
         </div>
         <div className="relative z-1 flex items-center w-1/2 h-flex mb-5 p-3 border border-n-1/10 rounded-3xl lg:p-5 xl:h-full m-auto bg-[#0f172ab3] rounded-3xl backdrop-blur-sm">
            <div className="relative top-0 left-0 w-full h-full p-6">
               <div className="mb-2">
                  <span className="text-md italic text-[#94a3b8]">
                     Purpose: {purpose}
                  </span>
               </div>
               {timeLimit && (
                  <div className="mb-6">
                     <span className="text-md italic text-[#94a3b8]">
                        Time limit: {timeLimit}
                     </span>
                  </div>
               )}

               {image && (
                  <img
                     src={image}
                     alt={title}
                     className="w-full h-auto mb-10 rounded-lg"
                  />
               )}

               <h6 className="h7 mb-10 font-semibold">{instruction}</h6>

               <AudioRecorder
                  onTranscript={onTranscript}
                  onAudioAvailable={onAudioAvailable}
                  ref={ref}
               />

               {validationError && (
                  <p className="text-red-400 text-sm text-center mt-4">
                     {validationError}
                  </p>
               )}
            </div>
         </div>
      </>
   );
});

SpeechTaskCard.displayName = 'SpeechTaskCard';

export default SpeechTaskCard;
