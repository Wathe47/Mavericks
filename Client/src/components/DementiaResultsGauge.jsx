import { useState } from 'react';
import GaugeChart from 'react-gauge-chart';
import XAIReportDisplay from './XAIReportDisplay';
import { IoDocumentText } from 'react-icons/io5';

const severityMap = {
   0: 'Healthy',
   1: 'Mild',
   2: 'Moderate',
   3: 'Severe',
};

const colorMap = {
   0: '#38f07b',
   1: '#f7e967',
   2: '#ffb347',
   3: '#FF5F6D',
};

export default function DementiaResultsGauge({ resultData }) {
   const [showXAIReport, setShowXAIReport] = useState(false);

   if (!resultData) return null;

   const clinicalValue = resultData.clinical_proba * 100;
   const clinicalSeverity = severityMap[resultData.clinical_pred];
   const clinicalColor = colorMap[resultData.clinical_pred];

   const speechValue = resultData.speech_proba * 100;
   const speechSeverity = severityMap[resultData.speech_pred];
   const speechColor = colorMap[resultData.speech_pred];

   const metaValue = resultData.meta_proba * 100;
   const metaSeverity = severityMap[resultData.meta_pred];
   const metaColor = colorMap[resultData.meta_pred];

   const percent = metaValue / 100;
   const coloredStops = Math.ceil(percent * 20);
   const colors = [
      ...Array(coloredStops).fill(metaColor),
      ...Array(20 - coloredStops).fill('#e5e7eb')
   ];

   return (
      <>
         <h2 className="text-2xl font-bold mt-6 text-center text-black">Prediction Results</h2>
         <div className="flex flex-col items-center p-4">
            <h2 className="text-lg font-semibold mb-2">Overall Prediction</h2>
            <div className="flex items-center gap-4 mb-2">
               <span className="text-2xl font-bold text-black">{metaValue.toFixed(2)}%</span>
               <span className="px-3 py-1 rounded-full text-white text-xl font-semibold" style={{ background: metaColor }}>
                  {metaSeverity}
               </span>
            </div>
            <GaugeChart
               id="gauge-chart-meta"
               nrOfLevels={20}
               percent={percent}
               arcPadding={0.02}
               colors={colors}
               arcWidth={0.3}
               cornerRadius={3}
               needleColor="#464A4F"
               needleBaseColor="#464A4F"
               textColor="#000000"
               hideText={true}
            />
         </div>

         {/* Clinical Prediction */}
         <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
               <span className="text-base font-semibold text-black">Clinical Prediction</span>
               <span className={`text-sm font-bold`} style={{ color: clinicalColor }}>{clinicalSeverity}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
               <div
                  className="h-4 rounded-full transition-all duration-500"
                  style={{ width: `${clinicalValue}%`, background: clinicalColor }}
               ></div>
            </div>
            <div className="text-right text-xs text-black mt-1">{clinicalValue.toFixed(2)}%</div>
         </div>

         {/* Speech Prediction */}
         <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
               <span className="text-base font-semibold text-black">Speech Prediction</span>
               <span className={`text-sm font-bold`} style={{ color: speechColor }}>{speechSeverity}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
               <div
                  className="h-4 rounded-full transition-all duration-500"
                  style={{ width: `${speechValue}%`, background: speechColor }}
               ></div>
            </div>
            <div className="text-right text-xs text-black mt-1">{speechValue.toFixed(2)}%</div>
         </div>

         {/* XAI Report Section */}
         {resultData.xai_explanations && (
            <div className="mt-8">
               <div className="flex justify-center">
                  <button
                     onClick={() => setShowXAIReport(!showXAIReport)}
                     className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                     <IoDocumentText className="w-4 h-4" />
                     {showXAIReport ? 'Hide' : 'View'} AI Explanation Report
                  </button>
               </div>

               {showXAIReport && (
                  <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                     <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-full overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-3 flex justify-between items-center">
                           <h3 className="text-lg font-semibold text-gray-900">AI Explanation Report</h3>
                           <button
                              onClick={() => setShowXAIReport(false)}
                              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                           >
                              ×
                           </button>
                        </div>
                        <div className="p-6">
                           <XAIReportDisplay
                              xaiData={resultData.xai_explanations}
                              resultData={resultData}
                           />
                        </div>
                     </div>
                  </div>
               )}
            </div>
         )}
      </>
   );
}