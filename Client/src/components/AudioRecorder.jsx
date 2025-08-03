/* eslint-disable react/no-unescaped-entities */
import { forwardRef, useImperativeHandle } from "react";
import { useRef, useState } from "react";
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

const AudioRecorder = forwardRef(({onTranscript,onAudioAvailable},ref) => {
   const [recording, setRecording] = useState(false);
   const [audioURL, setAudioURL] = useState(null);
   const [browserTranscript, setBrowserTranscript] = useState('');
   const [backendTranscript, setBackendTranscript] = useState('');
   const mediaRecorderRef = useRef(null);
   const audioChunksRef = useRef([]);
   const recognitionRef = useRef(null);
   const audioBlobRef = useRef(null);
   let finalTranscript = '';


   const startRecording = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
         if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
         }
      };

      mediaRecorderRef.current.onstop = () => {
         const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
         setAudioURL(URL.createObjectURL(audioBlob));
         audioBlobRef.current = audioBlob;
         if (onAudioAvailable) onAudioAvailable(true); 
      };

      mediaRecorderRef.current.start();

      // Browser speech recognition
      if ('webkitSpeechRecognition' in window) {
         recognitionRef.current = new window.webkitSpeechRecognition();
         recognitionRef.current.continuous = true;
         recognitionRef.current.interimResults = true;
         recognitionRef.current.lang = 'en-US';


         recognitionRef.current.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
               if (event.results[i].isFinal) {
                  finalTranscript += event.results[i][0].transcript;
               } else {
                  interimTranscript += event.results[i][0].transcript;
               }
            }
            setBrowserTranscript(finalTranscript + interimTranscript);
         };

         recognitionRef.current.onend = () => {
            if (recording) {
               recognitionRef.current.start();
            }
         };

         recognitionRef.current.start();
      }

      else {
         alert("Your browser does not support speech recognition.");
      }

      setBrowserTranscript('');
      setBackendTranscript('');
      setRecording(true);
   };

   const stopRecording = () => {
      setRecording(false);
      mediaRecorderRef.current.stop();
      if (recognitionRef.current) {
         recognitionRef.current.stop();
      }
   };

   const handleBackendTranscribe = async () => {
      if (!audioBlobRef.current) return;
      setBackendTranscript('');
      try {
         const formData = new FormData();
         formData.append("file", audioBlobRef.current, "audio.webm");
         const res = await fetch("http://localhost:8000/api/dementia/transcribe/", {
            method: "POST",
            body: formData,
         });
         const data = await res.json();
         setBackendTranscript(data.transcript);
               if (onTranscript) onTranscript(data.transcript); // <-- call parent
      } catch (err) {
         setBackendTranscript("Transcription failed.");
               if (onTranscript) onTranscript(""); // or handle error as you wish
      }
   };

   const handleMicClick = async () => {
      if (recording) {
         stopRecording();
         setTimeout(() => {
            handleBackendTranscribe();
         }, 300);
      } else {
         setBrowserTranscript('');
         setBackendTranscript('');
         setAudioURL(null);
         await startRecording();
      }
   };

   const handleClear = () => {
      console.log('Clearing audio recorder state');
      
      // Stop any ongoing recording
      if (recording) {
         setRecording(false);
         if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
         }
      }

      // Clear all states
      setBrowserTranscript('');
      setBackendTranscript('');
      setAudioURL(null);
      
      // Clean up media recorder
      if (mediaRecorderRef.current) {
         if (mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
         }
         mediaRecorderRef.current = null;
      }
      
      // Clean up speech recognition
      if (recognitionRef.current) {
         recognitionRef.current.stop();
         recognitionRef.current = null;
      }
      
      // Clear refs
      audioChunksRef.current = [];
      audioBlobRef.current = null;
      finalTranscript = '';
      
      // Reset parent state
      if (onTranscript) onTranscript('');
      if (onAudioAvailable) onAudioAvailable(false);
   };

   useImperativeHandle(ref, () => ({
      handleClear
   }));

   return (
      <div className="flex flex-col items-center space-y-4">
         <div className="flex items-center space-x-3">
            <button
               type="button"
               onClick={handleMicClick}
               className={`p-2 rounded-full ${recording ? 'bg-red-500' : 'bg-[#1e293b]'} text-white`}
               aria-label={recording ? "Stop Recording" : "Start Recording"}
            >
               {recording ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>
            <span className="text-sm text-[#94a3b8]">
               {recording ? "Listening..." : "Click to speak"}
            </span>
         </div>
         {audioURL && (
            <div className="flex flex-col items-center space-y-2">
               <audio src={audioURL} controls />
               <a href={audioURL} download="recording.webm" className="text-blue-400 underline">
                  Download Recording
               </a>
            </div>
         )}
         {browserTranscript && (
            <div className="w-full bg-[#1e293b] rounded p-2 min-h-[40px]">
               <strong className=" text-[#38f07b]" >Live Transcript:<br /></strong> {browserTranscript}  <br />
               <span className="text-xs text-[#94a3b8]">Note: This is the live transcript from the browser's speech recognition.</span>
            </div>
         )}
         {backendTranscript && (
            <div className="w-full bg-[#1e293b] rounded p-2 min-h-[40px]">
               <strong className="text-[#38f07b]">Processed Transcript:<br /></strong> {backendTranscript}
            </div>
         )}
      </div>
   );
});

AudioRecorder.displayName = 'AudioRecorder';

export default AudioRecorder;