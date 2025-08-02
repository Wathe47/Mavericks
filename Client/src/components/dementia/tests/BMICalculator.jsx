import { useState, useEffect } from 'react';

const BMICalculator = ({ isOpen, onClose, onCalculate }) => {
   const [height, setHeight] = useState('');
   const [weight, setWeight] = useState('');
   const [unit, setUnit] = useState('metric'); // metric or imperial
   const [result, setResult] = useState(null);

   // Apply blur to all parent content when modal is open
   useEffect(() => {
      if (isOpen) {
         // Find the main app container and apply blur
         const appContainer = document.querySelector('.pt-\\[4\\.75rem\\]') || document.body;
         if (appContainer) {
            appContainer.style.filter = 'blur(3px)';
            appContainer.style.pointerEvents = 'none';
         }
      } else {
         // Remove blur when modal closes
         const appContainer = document.querySelector('.pt-\\[4\\.75rem\\]') || document.body;
         if (appContainer) {
            appContainer.style.filter = 'none';
            appContainer.style.pointerEvents = 'auto';
         }
      }

      // Cleanup function
      return () => {
         const appContainer = document.querySelector('.pt-\\[4\\.75rem\\]') || document.body;
         if (appContainer) {
            appContainer.style.filter = 'none';
            appContainer.style.pointerEvents = 'auto';
         }
      };
   }, [isOpen]);

   const calculateBMI = () => {
      let bmi;

      if (unit === 'metric') {
         // BMI = weight (kg) / height (m)²
         const heightInM = parseFloat(height) / 100;
         bmi = parseFloat(weight) / (heightInM * heightInM);
      } else {
         // BMI = (weight (lbs) / height (inches)²) × 703
         const heightInInches = parseFloat(height);
         bmi = (parseFloat(weight) / (heightInInches * heightInInches)) * 703;
      }

      setResult(bmi.toFixed(2));
   };

   const getBMICategory = (bmi) => {
      if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
      if (bmi < 25) return { category: 'Normal weight', color: 'text-green-600' };
      if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
      return { category: 'Obese', color: 'text-red-600' };
   };

   const handleUse = () => {
      if (result) {
         onCalculate(result);
         onClose();
      }
   };

   const handleReset = () => {
      setHeight('');
      setWeight('');
      setResult(null);
   };

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         <div className="absolute inset-0 bg-black/45"></div>
         <div className="relative bg-white rounded-xl shadow-xl p-8 max-w-md w-full z-10">
            <h2 className="text-2xl font-bold mb-6 text-center text-black">BMI Calculator</h2>

            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-semibold mb-2 text-black">Unit System</label>
                  <select
                     value={unit}
                     onChange={(e) => setUnit(e.target.value)}
                     className="w-full rounded-md bg-gray-100 border border-gray-300 text-black text-sm px-3 py-2"
                  >
                     <option value="metric">Metric (cm, kg)</option>
                     <option value="imperial">Imperial (inches, lbs)</option>
                  </select>
               </div>

               <div>
                  <label className="block text-sm font-semibold mb-2 text-black">
                     Height ({unit === 'metric' ? 'cm' : 'inches'})
                  </label>
                  <input
                     type="number"
                     step="0.1"
                     value={height}
                     onChange={(e) => setHeight(e.target.value)}
                     className="w-full rounded-md bg-gray-100 border border-gray-300 text-black text-sm px-3 py-2"
                     placeholder={unit === 'metric' ? 'e.g., 175' : 'e.g., 69'}
                  />
               </div>

               <div>
                  <label className="block text-sm font-semibold mb-2 text-black">
                     Weight ({unit === 'metric' ? 'kg' : 'lbs'})
                  </label>
                  <input
                     type="number"
                     step="0.1"
                     value={weight}
                     onChange={(e) => setWeight(e.target.value)}
                     className="w-full rounded-md bg-gray-100 border border-gray-300 text-black text-sm px-3 py-2"
                     placeholder={unit === 'metric' ? 'e.g., 70' : 'e.g., 154'}
                  />
               </div>

               <button
                  onClick={calculateBMI}
                  disabled={!height || !weight}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  Calculate BMI
               </button>

               {result && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                     <div className="text-center">
                        <p className="text-lg font-bold text-black">BMI: {result}</p>
                        <p className={`text-sm ${getBMICategory(parseFloat(result)).color}`}>
                           {getBMICategory(parseFloat(result)).category}
                        </p>
                     </div>
                  </div>
               )}
            </div>

            <div className="flex gap-3 mt-6">
               <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-600"
               >
                  Reset
               </button>
               <button
                  onClick={handleUse}
                  disabled={!result}
                  className="flex-1 px-4 py-2 bg-green-400 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  Use This BMI
               </button>

               <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-2xl text-gray-700 hover:text-red-500 focus:outline-none"
                  aria-label="Close"
               >
                  &times;
               </button>
            </div>
         </div>
      </div>
   );
};

export default BMICalculator;
