import { useState } from 'react';

const FunctionalAssessmentTest = ({ isOpen, onClose, onComplete }) => {
   const [scores, setScores] = useState({});
   const [totalScore, setTotalScore] = useState(0);
   const [isCompleted, setIsCompleted] = useState(false);

   const domains = [
      {
         name: 'Shopping',
         description: 'Plan and execute shopping for necessities',
         options: [
            { score: 1, label: 'Independent - Can plan and shop without assistance' },
            { score: 0.5, label: 'Needs minimal assistance or supervision' },
            { score: 0, label: 'Cannot shop independently' }
         ]
      },
      {
         name: 'Housekeeping',
         description: 'Maintain household cleanliness and organization',
         options: [
            { score: 1, label: 'Independent - Maintains clean, organized home' },
            { score: 0.5, label: 'Needs some assistance with complex tasks' },
            { score: 0, label: 'Cannot perform housekeeping tasks' }
         ]
      },
      {
         name: 'Accounting',
         description: 'Manage finances and keep records',
         options: [
            { score: 1, label: 'Independent - Manages finances completely' },
            { score: 0.5, label: 'Needs assistance with complex financial tasks' },
            { score: 0, label: 'Cannot manage finances' }
         ]
      },
      {
         name: 'Food Preparation',
         description: 'Plan and prepare adequate meals',
         options: [
            { score: 1, label: 'Independent - Plans and prepares meals' },
            { score: 0.5, label: 'Can prepare simple meals, needs help with complex cooking' },
            { score: 0, label: 'Cannot prepare meals safely' }
         ]
      },
      {
         name: 'Transportation',
         description: 'Travel independently using public or private transport',
         options: [
            { score: 1, label: 'Independent - Drives or uses public transport safely' },
            { score: 0.5, label: 'Needs assistance or uses limited transportation' },
            { score: 0, label: 'Cannot travel independently' }
         ]
      },
      {
         name: 'Medication Management',
         description: 'Responsible handling of medications',
         options: [
            { score: 1, label: 'Independent - Takes medications correctly without prompting' },
            { score: 0.5, label: 'Needs reminders or pill organizer' },
            { score: 0, label: 'Cannot manage medications safely' }
         ]
      },
      {
         name: 'Communication',
         description: 'Use telephone and handle correspondence',
         options: [
            { score: 1, label: 'Independent - Uses phone and handles mail appropriately' },
            { score: 0.5, label: 'Some difficulty with complex communication tasks' },
            { score: 0, label: 'Cannot use communication devices effectively' }
         ]
      },
      {
         name: 'Laundry',
         description: 'Wash and care for clothes',
         options: [
            { score: 1, label: 'Independent - Does laundry completely' },
            { score: 0.5, label: 'Needs assistance with some aspects' },
            { score: 0, label: 'Cannot do laundry' }
         ]
      }
   ];

   const handleScoreChange = (domainIndex, score) => {
      const newScores = { ...scores, [domainIndex]: score };
      setScores(newScores);
   };

   const calculateScore = () => {
      const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
      setTotalScore(Number(total.toFixed(1)));
      setIsCompleted(true);
   };

   const getScoreInterpretation = (score) => {
      if (score >= 7) return { interpretation: 'Independent in most IADLs', color: 'text-green-600' };
      if (score >= 5) return { interpretation: 'Mild impairment', color: 'text-yellow-600' };
      if (score >= 3) return { interpretation: 'Moderate impairment', color: 'text-orange-600' };
      return { interpretation: 'Severe impairment', color: 'text-red-600' };
   };

   const handleUse = () => {
      onComplete(totalScore);
      onClose();
   };

   const handleReset = () => {
      setScores({});
      setTotalScore(0);
      setIsCompleted(false);
   };

   const allDomainsCompleted = domains.every((_, index) => scores[index] !== undefined);

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         <div className="absolute inset-0 bg-black/45 backdrop-blur-sm"></div>
         <div className="relative bg-white rounded-xl shadow-xl p-8 max-w-4xl w-full z-10 max-h-[90vh] overflow-y-auto"
            style={{
               scrollbarWidth: 'none',
               msOverflowStyle: 'none'
            }}
         >
            <h2 className="text-2xl font-bold mb-6 text-center text-black">
               Instrumental Activities of Daily Living (IADL) Assessment
            </h2>

            {!isCompleted ? (
               <>
                  <div className="mb-6">
                     <p className="text-gray-700 text-center">
                        Assess the patient&apos;s ability to perform complex activities needed for independent living
                     </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {domains.map((domain, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                           <h3 className="text-lg font-semibold text-black mb-2">{domain.name}</h3>
                           <p className="text-gray-600 mb-3 text-sm">{domain.description}</p>

                           <div className="space-y-2">
                              {domain.options.map((option, optionIndex) => (
                                 <label key={optionIndex} className="flex items-start space-x-3 cursor-pointer">
                                    <input
                                       type="radio"
                                       name={`domain-${index}`}
                                       value={option.score}
                                       checked={scores[index] === option.score}
                                       onChange={() => handleScoreChange(index, option.score)}
                                       className="mt-1 w-4 h-4 appearance-none border-2 border-blue-600 rounded-full bg-white checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-400 transition-colors duration-150"
                                       style={{
                                          boxShadow: scores[index] === option.score
                                             ? '0 0 0 2px #2563eb inset'
                                             : undefined
                                       }}
                                    />
                                    <div>
                                       <span className="text-black font-medium">
                                          {option.score} point{option.score !== 1 ? 's' : ''}
                                       </span>
                                       <p className="text-gray-700 text-sm">{option.label}</p>
                                    </div>
                                 </label>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="mt-8 flex gap-3">
                     <button
                        onClick={calculateScore}
                        disabled={!allDomainsCompleted}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                     >
                        Calculate Functional Assessment Score
                     </button>
                  </div>
               </>
            ) : (
               <div className="text-center">
                  <div className="mb-6 p-6 bg-gray-50 rounded-md">
                     <h3 className="text-2xl font-bold text-black mb-2">Total Functional Assessment Score</h3>
                     <p className="text-4xl font-bold text-blue-600 mb-2">{totalScore}/8</p>
                     <p className={`text-lg ${getScoreInterpretation(totalScore).color}`}>
                        {getScoreInterpretation(totalScore).interpretation}
                     </p>
                  </div>

                  <div className="mb-6 text-left">
                     <h4 className="font-semibold text-black mb-3">Assessment Breakdown:</h4>
                     <div className="grid grid-cols-2 gap-3">
                        {domains.map((domain, index) => (
                           <div key={index} className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                              <span className="text-gray-700">{domain.name}:</span>
                              <span className={`font-medium ${scores[index] === 1 ? 'text-green-600' :
                                 scores[index] === 0.5 ? 'text-yellow-600' : 'text-red-600'
                                 }`}>
                                 {scores[index] || 0}/1
                              </span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="mb-4 p-4 bg-blue-50 rounded-md text-left">
                     <h4 className="font-semibold text-black mb-2">Interpretation Guide:</h4>
                     <ul className="text-sm text-gray-700 space-y-1">
                        <li>• <strong>7-8 points:</strong> Independent in most complex activities</li>
                        <li>• <strong>5-6.5 points:</strong> Mild functional impairment</li>
                        <li>• <strong>3-4.5 points:</strong> Moderate functional impairment</li>
                        <li>• <strong>0-2.5 points:</strong> Severe functional impairment</li>
                     </ul>
                  </div>

                  <div className="flex gap-3">
                     <button
                        onClick={handleReset}
                        className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                     >
                        Retake Assessment
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

export default FunctionalAssessmentTest;
