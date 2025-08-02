import { useState } from 'react';

const MMSETest = ({ isOpen, onClose, onComplete }) => {
   const [currentSection, setCurrentSection] = useState(0);
   const [scores, setScores] = useState({});
   const [totalScore, setTotalScore] = useState(0);
   const [isCompleted, setIsCompleted] = useState(false);

   const sections = [
      {
         name: 'Orientation to Time',
         maxScore: 5,
         questions: [
            'What is the year?',
            'What is the season?',
            'What is the date?',
            'What is the day of the week?',
            'What is the month?'
         ]
      },
      {
         name: 'Orientation to Place',
         maxScore: 5,
         questions: [
            'What country are we in?',
            'What state/province are we in?',
            'What city are we in?',
            'What building are we in?',
            'What floor are we on?'
         ]
      },
      {
         name: 'Registration',
         maxScore: 3,
         description: 'Name three objects (e.g., apple, penny, table). Ask patient to repeat them.',
         scoreDescription: 'Score 1 point for each object correctly repeated.'
      },
      {
         name: 'Attention and Calculation',
         maxScore: 5,
         description: 'Ask patient to count backwards from 100 by 7s (93, 86, 79, 72, 65) OR spell "WORLD" backwards.',
         scoreDescription: 'Score 1 point for each correct answer.'
      },
      {
         name: 'Recall',
         maxScore: 3,
         description: 'Ask patient to recall the three objects from the registration test.',
         scoreDescription: 'Score 1 point for each object correctly recalled.'
      },
      {
         name: 'Language',
         maxScore: 9,
         questions: [
            'Name a pencil and watch (2 points)',
            'Repeat "No ifs, ands, or buts" (1 point)',
            'Follow 3-stage command: "Take paper, fold it in half, put it on floor" (3 points)',
            'Read and obey "Close your eyes" (1 point)',
            'Write a sentence (1 point)',
            'Copy intersecting pentagons (1 point)'
         ]
      }
   ];

   const handleScoreChange = (score) => {
      const newScores = { ...scores, [currentSection]: parseInt(score) };
      setScores(newScores);
   };

   const nextSection = () => {
      if (currentSection < sections.length - 1) {
         setCurrentSection(currentSection + 1);
      } else {
         calculateTotalScore();
      }
   };

   const previousSection = () => {
      if (currentSection > 0) {
         setCurrentSection(currentSection - 1);
      }
   };

   const calculateTotalScore = () => {
      const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
      setTotalScore(total);
      setIsCompleted(true);
   };

   const getScoreInterpretation = (score) => {
      if (score >= 24) return { interpretation: 'Normal cognition', color: 'text-green-600' };
      if (score >= 18) return { interpretation: 'Mild cognitive impairment', color: 'text-yellow-600' };
      if (score >= 10) return { interpretation: 'Moderate cognitive impairment', color: 'text-orange-600' };
      return { interpretation: 'Severe cognitive impairment', color: 'text-red-600' };
   };

   const handleUse = () => {
      onComplete(totalScore);
      onClose();
   };

   const handleReset = () => {
      setCurrentSection(0);
      setScores({});
      setTotalScore(0);
      setIsCompleted(false);
   };

   if (!isOpen) return null;

   const currentSectionData = sections[currentSection];

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         <div className="absolute inset-0 bg-black/45 backdrop-blur-sm"></div>
         <div className="relative bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full z-10 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-black">MMSE Test</h2>

            {!isCompleted ? (
               <>
                  <div className="mb-4">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">
                           Section {currentSection + 1} of {sections.length}
                        </span>
                        <span className="text-sm font-medium text-gray-600">
                           Max Score: {currentSectionData.maxScore}
                        </span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                           className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                           style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
                        ></div>
                     </div>
                  </div>

                  <div className="mb-6">
                     <h3 className="text-xl font-semibold mb-4 text-black">{currentSectionData.name}</h3>

                     {currentSectionData.questions ? (
                        <div className="space-y-2">
                           {currentSectionData.questions.map((question, idx) => (
                              <p key={idx} className="text-gray-700">• {question}</p>
                           ))}
                        </div>
                     ) : (
                        <>
                           <p className="text-gray-700 mb-2">{currentSectionData.description}</p>
                           <p className="text-sm text-gray-600 italic">{currentSectionData.scoreDescription}</p>
                        </>
                     )}
                  </div>

                  <div className="mb-6">
                     <label className="block text-sm font-semibold mb-2 text-black">
                        Score (0 - {currentSectionData.maxScore})
                     </label>
                     <input
                        type="number"
                        min="0"
                        max={currentSectionData.maxScore}
                        value={scores[currentSection] || ''}
                        onChange={(e) => handleScoreChange(e.target.value)}
                        className="w-full rounded-md bg-gray-100 border border-gray-300 text-black text-sm px-3 py-2"
                        placeholder="Enter score"
                     />
                  </div>

                  <div className="flex gap-3">
                     <button
                        onClick={previousSection}
                        disabled={currentSection === 0}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        Previous
                     </button>
                     <button
                        onClick={nextSection}
                        disabled={scores[currentSection] === undefined || scores[currentSection] === ''}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {currentSection === sections.length - 1 ? 'Calculate Score' : 'Next'}
                     </button>
                  </div>
               </>
            ) : (
               <div className="text-center">
                  <div className="mb-6 p-6 bg-gray-50 rounded-md">
                     <h3 className="text-2xl font-bold text-black mb-2">Total MMSE Score</h3>
                     <p className="text-4xl font-bold text-blue-600 mb-2">{totalScore}/30</p>
                     <p className={`text-lg ${getScoreInterpretation(totalScore).color}`}>
                        {getScoreInterpretation(totalScore).interpretation}
                     </p>
                  </div>

                  <div className="mb-6 text-left">
                     <h4 className="font-semibold text-black mb-2">Section Breakdown:</h4>
                     {sections.map((section, idx) => (
                        <div key={idx} className="flex justify-between py-1">
                           <span className="text-gray-700">{section.name}:</span>
                           <span className="text-black">{scores[idx] || 0}/{section.maxScore}</span>
                        </div>
                     ))}
                  </div>

                  <div className="flex gap-3">
                     <button
                        onClick={handleReset}
                        className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                     >
                        Retake Test
                     </button>
                     <button
                        onClick={handleUse}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                     >
                        Use This Score
                     </button>
                  </div>
               </div>
            )}

            <button
               onClick={onClose}
               className="absolute top-4 right-4 text-2xl text-gray-700 hover:text-red-500 focus:outline-none"
               aria-label="Close"
            >
               &times;
            </button>
         </div>
      </div>
   );
};

export default MMSETest;
