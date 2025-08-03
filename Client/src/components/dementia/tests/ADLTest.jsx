import { useState } from 'react';

const ADLTest = ({ isOpen, onClose, onComplete }) => {
   const [scores, setScores] = useState({});
   const [totalScore, setTotalScore] = useState(0);
   const [isCompleted, setIsCompleted] = useState(false);

   const activities = [
      {
         name: 'Bathing',
         description: 'Ability to wash body and hair',
         options: [
            { score: 1, label: 'Independent (no assistance)' },
            { score: 0, label: 'Needs assistance or unable to bathe' }
         ]
      },
      {
         name: 'Dressing',
         description: 'Getting clothes and putting them on',
         options: [
            { score: 1, label: 'Independent (including buttons, zippers, etc.)' },
            { score: 0, label: 'Needs assistance or unable to dress' }
         ]
      },
      {
         name: 'Toileting',
         description: 'Going to toilet, cleaning self, arranging clothes',
         options: [
            { score: 1, label: 'Independent (able to go to toilet and clean self)' },
            { score: 0, label: 'Needs assistance or unable to use toilet' }
         ]
      },
      {
         name: 'Transferring',
         description: 'Moving in and out of bed/chair',
         options: [
            { score: 1, label: 'Independent (may use assistive device)' },
            { score: 0, label: 'Needs assistance or unable to transfer' }
         ]
      },
      {
         name: 'Continence',
         description: 'Control of urination and bowel movements',
         options: [
            { score: 1, label: 'Fully continent' },
            { score: 0, label: 'Partially or completely incontinent' }
         ]
      },
      {
         name: 'Feeding',
         description: 'Getting food from plate to mouth',
         options: [
            { score: 1, label: 'Independent (food within reach)' },
            { score: 0, label: 'Needs assistance or unable to feed self' }
         ]
      }
   ];

   const handleScoreChange = (activityIndex, score) => {
      const newScores = { ...scores, [activityIndex]: score };
      setScores(newScores);
   };

   const calculateScore = () => {
      const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
      setTotalScore(total);
      setIsCompleted(true);
   };

   const getScoreInterpretation = (score) => {
      if (score === 6) return { interpretation: 'Independent in all ADLs', color: 'text-green-600' };
      if (score >= 4) return { interpretation: 'Mildly dependent', color: 'text-yellow-600' };
      if (score >= 2) return { interpretation: 'Moderately dependent', color: 'text-orange-600' };
      return { interpretation: 'Severely dependent', color: 'text-red-600' };
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

   const allActivitiesCompleted = activities.every((_, index) => scores[index] !== undefined);

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         <div className="absolute inset-0 bg-black/45 backdrop-blur-sm"></div>

         <div
            className="relative bg-white rounded-xl shadow-xl p-8 max-w-3xl z-10 max-h-[90vh] overflow-y-scroll"
            style={{
               scrollbarWidth: 'none',
               msOverflowStyle: 'none'
            }}
         >
            <button
               onClick={onClose}
               className="absolute top-4 right-4 text-2xl text-gray-700 hover:text-red-500 focus:outline-none"
               aria-label="Close"
            >
               &times;
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center text-black">
               Activities of Daily Living (ADL) Assessment
            </h2>

            {!isCompleted ? (
               <>
                  <div className=" mb-6">
                     <p className="text-gray-700 text-center">
                        Assess the patient&apos;s ability to perform basic activities independently
                     </p>
                  </div>

                  <div className="space-y-6">
                     {activities.map((activity, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                           <h3 className="text-lg font-semibold text-black mb-2">{activity.name}</h3>
                           <p className="text-gray-600 mb-3 text-sm">{activity.description}</p>

                           <div className="space-y-2">
                              {activity.options.map((option, optionIndex) => (
                                 <label key={optionIndex} className="flex items-start space-x-3 cursor-pointer">
                                    <input
                                       type="radio"
                                       name={`activity-${index}`}
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
                        disabled={!allActivitiesCompleted}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                     >
                        Calculate ADL Score
                     </button>
                  </div>
               </>
            ) : (
               <div className="text-center">
                  <div className="mb-6 p-6 bg-gray-50 rounded-md">
                     <h3 className="text-2xl font-bold text-black mb-2">Total ADL Score</h3>
                     <p className="text-4xl font-bold text-blue-600 mb-2">{totalScore}/6</p>
                     <p className={`text-lg ${getScoreInterpretation(totalScore).color}`}>
                        {getScoreInterpretation(totalScore).interpretation}
                     </p>
                  </div>

                  <div className="mb-6 text-left">
                     <h4 className="font-semibold text-black mb-3">Assessment Breakdown:</h4>
                     <div className="grid grid-cols-2 gap-3">
                        {activities.map((activity, index) => (
                           <div key={index} className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                              <span className="text-gray-700">{activity.name}:</span>
                              <span className={`font-medium ${scores[index] === 1 ? 'text-green-600' : 'text-red-600'}`}>
                                 {scores[index] || 0}/1
                              </span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="mb-4 p-4 bg-blue-50 rounded-md text-left">
                     <h4 className="font-semibold text-black mb-2">Interpretation Guide:</h4>
                     <ul className="text-sm text-gray-700 space-y-1">
                        <li>• <strong>6 points:</strong> Independent in all ADLs</li>
                        <li>• <strong>4-5 points:</strong> Mildly dependent</li>
                        <li>• <strong>2-3 points:</strong> Moderately dependent</li>
                        <li>• <strong>0-1 points:</strong> Severely dependent</li>
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
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                     >
                        Use This Score
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default ADLTest;
