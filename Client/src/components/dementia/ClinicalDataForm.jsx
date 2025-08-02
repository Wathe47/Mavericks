const ClinicalDataForm = ({
   formData,
   validationErrors,
   handleChange,
   onShowBMICalculator,
   onShowMMSETest,
   onShowADLTest,
   onShowFATest
}) => {
   return (
      <>
         <form className="space-y-6">
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
               {validationErrors.Age && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.Age}</p>
               )}
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
               {validationErrors.Gender && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.Gender}</p>
               )}
            </div>

            <div >
               <label htmlFor="bmi" className="block text-sm font-semibold mb-1">BMI</label>
               <input
                  id="bmi"
                  type="number"
                  step="0.01"
                  name="clinical.BMI"
                  value={formData.clinical.BMI}
                  onChange={handleChange}
                  required
                  className="w-3/4 rounded-md bg-[#1e293b] border border-[#334155] text-[#ffffff] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ffffff]"
               />
               <button
                  onClick={onShowBMICalculator}
                  type="button"
                  className={`px-4 py-2 rounded-md text-white bg-[#1e293b] ml-4 hover:bg-blue-500 transition-colors`}
               >
                  Calculate
               </button>
               {validationErrors.BMI && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.BMI}</p>
               )}
            </div>

            <div className="flex items-center justify-between">
               <label htmlFor="family-history" className="text-sm font-semibold">
                  Family History of Alzheimer&apos;s
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
                  className="w-3/4 rounded-md bg-[#1e293b] border border-[#334155] text-[#ffffff] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ffffff]"
               />
               <button
                  onClick={onShowMMSETest}
                  type="button"
                  className={`px-3 py-2 rounded-md text-white bg-[#1e293b] ml-4 hover:bg-blue-500 transition-colors`}
               >
                  Test MMSE
               </button>
               {validationErrors.MMSE && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.MMSE}</p>
               )}
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
                  className="w-3/4 rounded-md bg-[#1e293b] border border-[#334155] text-[#ffffff] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ffffff]"
               />
               <button
                  onClick={onShowADLTest}
                  type="button"
                  className={`px-4 py-2 rounded-md text-white bg-[#1e293b] ml-6 hover:bg-blue-500 transition-colors`}
               >
                  Test ADL
               </button>
               {validationErrors.ADL && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.ADL}</p>
               )}
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
                  className="w-3/4 rounded-md bg-[#1e293b] border border-[#334155] text-[#ffffff] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ffffff]"
               />
               <button
                  onClick={onShowFATest}
                  type="button"
                  className={`px-5 py-2 rounded-md text-white bg-[#1e293b] ml-7 hover:bg-blue-500 transition-colors`}
               >
                  Test FA
               </button>
               {validationErrors.FunctionalAssessment && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.FunctionalAssessment}</p>
               )}
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
      </>
   );
};

export default ClinicalDataForm;
