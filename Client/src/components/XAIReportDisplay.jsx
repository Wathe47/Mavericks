import { useState } from 'react';
import {
   IoChevronDown,
   IoChevronUp,
   IoDownload,
   IoWarning,
   IoCheckmarkCircle,
   IoInformationCircle
} from 'react-icons/io5';

const XAIReportDisplay = ({ xaiData, resultData }) => {
   const [expandedSections, setExpandedSections] = useState({
      clinical: false,
      speech: false,
      meta: true, // Default to expanded
      summary: true
   });

   if (!xaiData || !resultData) {
      return (
         <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-600">No explanation data available</p>
         </div>
      );
   }

   const toggleSection = (section) => {
      setExpandedSections(prev => ({
         ...prev,
         [section]: !prev[section]
      }));
   };

   const getConfidenceIcon = (level) => {
      switch (level) {
         case 'high':
            return <IoCheckmarkCircle className="w-5 h-5 text-green-500" />;
         case 'moderate':
            return <IoInformationCircle className="w-5 h-5 text-yellow-500" />;
         case 'low':
            return <IoWarning className="w-5 h-5 text-red-500" />;
         default:
            return <IoInformationCircle className="w-5 h-5 text-gray-500" />;
      }
   };

   const getConfidenceColor = (level) => {
      switch (level) {
         case 'high':
            return 'bg-green-100 text-green-800 border-green-300';
         case 'moderate':
            return 'bg-yellow-100 text-yellow-800 border-yellow-300';
         case 'low':
            return 'bg-red-100 text-red-800 border-red-300';
         default:
            return 'bg-gray-100 text-gray-800 border-gray-300';
      }
   };

   const severityMap = {
      0: 'No Dementia',
      1: 'Mild Dementia',
      2: 'Moderate Dementia',
      3: 'Severe Dementia'
   };

   const downloadReport = async () => {
      try {
         // Create a comprehensive text report
         const report = generateTextReport(xaiData, resultData);

         // Create a blob and download
         const blob = new Blob([report], { type: 'text/plain' });
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `dementia_analysis_report_${new Date().toISOString().split('T')[0]}.txt`;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         window.URL.revokeObjectURL(url);
      } catch (error) {
         console.error('Error generating report:', error);
      }
   };

   const generateTextReport = (xaiData, resultData) => {
      const timestamp = new Date().toLocaleString();
      const summary = xaiData.summary || {};

      return `
DEMENTIA ASSESSMENT ANALYSIS REPORT
Generated: ${timestamp}

========================================
EXECUTIVE SUMMARY
========================================

Final Prediction: ${severityMap[summary.final_prediction] || 'Unknown'}
Confidence Level: ${summary.confidence_level || 'Unknown'} (${(summary.final_confidence * 100).toFixed(1)}%)
Model Agreement: ${summary.model_agreement ? 'Yes' : 'No'}

${summary.clinical_recommendations ?
            `RECOMMENDATIONS:
${summary.clinical_recommendations.map(rec => `• ${rec}`).join('\n')}` : ''}

========================================
DETAILED ANALYSIS
========================================

${xaiData.clinical_explanation ? `
CLINICAL MODEL ANALYSIS:
${xaiData.clinical_explanation.clinical_interpretation}

Top Contributing Clinical Factors:
${xaiData.clinical_explanation.top_contributing_factors ?
               xaiData.clinical_explanation.top_contributing_factors.slice(0, 5).map(factor =>
                  `• ${factor.feature}: ${factor.direction} prediction (${factor.magnitude} impact)
      ${factor.interpretation}`
               ).join('\n') : 'No SHAP data available'}
` : ''}

${xaiData.speech_explanation ? `
SPEECH ANALYSIS:
${xaiData.speech_explanation.clinical_interpretation}

Speech Pattern Summary:
${xaiData.speech_explanation.speech_patterns ?
               Object.entries(xaiData.speech_explanation.speech_patterns).map(([category, data]) =>
                  `${category.replace(/_/g, ' ').toUpperCase()}:
${Object.entries(data).map(([key, value]) => `  ${key}: ${value}`).join('\n')}`
               ).join('\n\n') : 'No speech pattern data available'}
` : ''}

${xaiData.meta_explanation ? `
ENSEMBLE MODEL ANALYSIS:
${xaiData.meta_explanation.clinical_interpretation}

Model Consensus Details:
• Clinical Model Confidence: ${(xaiData.meta_explanation.ensemble_reasoning?.clinical_confidence * 100 || 0).toFixed(1)}%
• Speech Model Confidence: ${(xaiData.meta_explanation.ensemble_reasoning?.speech_confidence * 100 || 0).toFixed(1)}%
• Models Agree: ${xaiData.meta_explanation.model_agreement ? 'Yes' : 'No'}
• Reasoning: ${xaiData.meta_explanation.ensemble_reasoning?.reasoning || 'Not available'}
` : ''}

========================================
TECHNICAL DETAILS
========================================

Clinical Model Prediction: ${severityMap[resultData.clinical_pred]} (${(resultData.clinical_proba * 100).toFixed(1)}% confidence)
Speech Model Prediction: ${severityMap[resultData.speech_pred]} (${(resultData.speech_proba * 100).toFixed(1)}% confidence)
Final Meta-Model Prediction: ${severityMap[resultData.meta_pred]} (${(resultData.meta_proba * 100).toFixed(1)}% confidence)

========================================
DISCLAIMER
========================================

This AI assessment is designed to assist healthcare professionals and should not replace clinical judgment. 
All predictions should be interpreted in conjunction with comprehensive clinical evaluation and professional medical assessment.
    `.trim();
   };

   return (
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">AI Explanation Report</h2>
            <button
               onClick={downloadReport}
               className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
               <IoDownload className="w-5 h-5" />
               Download Report
            </button>
         </div>

         {/* Summary Section */}
         <div className="mb-6">
            <div
               className="flex items-center justify-between cursor-pointer p-4 bg-blue-50 rounded-lg"
               onClick={() => toggleSection('summary')}
            >
               <h3 className="text-lg font-semibold text-blue-900">Executive Summary</h3>
               {expandedSections.summary ?
                  <IoChevronUp className="w-5 h-5 text-blue-600" /> :
                  <IoChevronDown className="w-5 h-5 text-blue-600" />
               }
            </div>

            {expandedSections.summary && (
               <div className="mt-4 p-4 border border-blue-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div className="flex items-center gap-2">
                        <span className="font-medium">Final Prediction:</span>
                        <span className="font-bold text-blue-600">
                           {severityMap[xaiData.summary?.final_prediction] || 'Unknown'}
                        </span>
                     </div>
                     <div className="flex items-center gap-2">
                        {getConfidenceIcon(xaiData.summary?.confidence_level)}
                        <span className="font-medium">Confidence:</span>
                        <span className={`px-2 py-1 rounded border text-sm ${getConfidenceColor(xaiData.summary?.confidence_level)}`}>
                           {xaiData.summary?.confidence_level || 'Unknown'} ({((xaiData.summary?.final_confidence || 0) * 100).toFixed(1)}%)
                        </span>
                     </div>
                  </div>

                  <div className="mb-4">
                     <span className="font-medium">Model Agreement: </span>
                     <span className={`px-2 py-1 rounded text-sm ${xaiData.summary?.model_agreement
                           ? 'bg-green-100 text-green-800'
                           : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {xaiData.summary?.model_agreement ? 'Models Agree' : 'Models Disagree'}
                     </span>
                  </div>

                  {xaiData.summary?.clinical_recommendations && (
                     <div>
                        <h4 className="font-medium mb-2">Clinical Recommendations:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                           {xaiData.summary.clinical_recommendations.map((rec, index) => (
                              <li key={index} className="text-gray-700">{rec}</li>
                           ))}
                        </ul>
                     </div>
                  )}
               </div>
            )}
         </div>

         {/* Clinical Explanation */}
         {xaiData.clinical_explanation && (
            <div className="mb-6">
               <div
                  className="flex items-center justify-between cursor-pointer p-4 bg-green-50 rounded-lg"
                  onClick={() => toggleSection('clinical')}
               >
                  <h3 className="text-lg font-semibold text-green-900">Clinical Model Analysis</h3>
                  {expandedSections.clinical ?
                     <IoChevronUp className="w-5 h-5 text-green-600" /> :
                     <IoChevronDown className="w-5 h-5 text-green-600" />
                  }
               </div>

               {expandedSections.clinical && (
                  <div className="mt-4 p-4 border border-green-200 rounded-lg">
                     <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                           {getConfidenceIcon(xaiData.clinical_explanation.confidence_level)}
                           <span className="font-medium">Prediction:</span>
                           <span className="font-bold">{severityMap[xaiData.clinical_explanation.prediction]}</span>
                           <span className={`px-2 py-1 rounded text-sm ${getConfidenceColor(xaiData.clinical_explanation.confidence_level)}`}>
                              {((xaiData.clinical_explanation.confidence || 0) * 100).toFixed(1)}% confidence
                           </span>
                        </div>
                     </div>

                     {xaiData.clinical_explanation.top_contributing_factors && (
                        <div className="mb-4">
                           <h4 className="font-medium mb-2">Key Contributing Factors:</h4>
                           <div className="space-y-2">
                              {xaiData.clinical_explanation.top_contributing_factors.slice(0, 5).map((factor, index) => (
                                 <div key={index} className="bg-gray-50 p-3 rounded">
                                    <div className="flex justify-between items-center mb-1">
                                       <span className="font-medium">{factor.feature}</span>
                                       <span className={`text-sm px-2 py-1 rounded ${factor.direction === 'increases' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                          }`}>
                                          {factor.direction} risk
                                       </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{factor.interpretation}</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     <div className="bg-blue-50 p-3 rounded">
                        <h4 className="font-medium mb-2">Clinical Interpretation:</h4>
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                           {xaiData.clinical_explanation.clinical_interpretation}
                        </pre>
                     </div>
                  </div>
               )}
            </div>
         )}

         {/* Speech Explanation */}
         {xaiData.speech_explanation && (
            <div className="mb-6">
               <div
                  className="flex items-center justify-between cursor-pointer p-4 bg-purple-50 rounded-lg"
                  onClick={() => toggleSection('speech')}
               >
                  <h3 className="text-lg font-semibold text-purple-900">Speech Analysis</h3>
                  {expandedSections.speech ?
                     <IoChevronUp className="w-5 h-5 text-purple-600" /> :
                     <IoChevronDown className="w-5 h-5 text-purple-600" />
                  }
               </div>

               {expandedSections.speech && (
                  <div className="mt-4 p-4 border border-purple-200 rounded-lg">
                     <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                           {getConfidenceIcon(xaiData.speech_explanation.confidence_level)}
                           <span className="font-medium">Prediction:</span>
                           <span className="font-bold">{severityMap[xaiData.speech_explanation.prediction]}</span>
                           <span className={`px-2 py-1 rounded text-sm ${getConfidenceColor(xaiData.speech_explanation.confidence_level)}`}>
                              {((xaiData.speech_explanation.confidence || 0) * 100).toFixed(1)}% confidence
                           </span>
                        </div>
                     </div>

                     {xaiData.speech_explanation.speech_patterns && (
                        <div className="mb-4">
                           <h4 className="font-medium mb-2">Speech Pattern Analysis:</h4>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {Object.entries(xaiData.speech_explanation.speech_patterns).map(([category, data]) => (
                                 <div key={category} className="bg-gray-50 p-3 rounded">
                                    <h5 className="font-medium mb-2 capitalize">
                                       {category.replace(/_/g, ' ')}
                                    </h5>
                                    {Object.entries(data).map(([key, value]) => (
                                       <div key={key} className="text-sm mb-1">
                                          <span className="text-gray-600">{key.replace(/_/g, ' ')}:</span>
                                          <span className="ml-2 font-medium">{value}</span>
                                       </div>
                                    ))}
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     <div className="bg-purple-50 p-3 rounded">
                        <h4 className="font-medium mb-2">Speech Analysis Interpretation:</h4>
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                           {xaiData.speech_explanation.clinical_interpretation}
                        </pre>
                     </div>
                  </div>
               )}
            </div>
         )}

         {/* Meta Explanation */}
         {xaiData.meta_explanation && (
            <div className="mb-6">
               <div
                  className="flex items-center justify-between cursor-pointer p-4 bg-orange-50 rounded-lg"
                  onClick={() => toggleSection('meta')}
               >
                  <h3 className="text-lg font-semibold text-orange-900">Ensemble Model Decision</h3>
                  {expandedSections.meta ?
                     <IoChevronUp className="w-5 h-5 text-orange-600" /> :
                     <IoChevronDown className="w-5 h-5 text-orange-600" />
                  }
               </div>

               {expandedSections.meta && (
                  <div className="mt-4 p-4 border border-orange-200 rounded-lg">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                           <span className="font-medium">Clinical Model:</span>
                           <div className="text-sm text-gray-600">
                              {severityMap[xaiData.meta_explanation.clinical_prediction]}
                              ({((xaiData.meta_explanation.ensemble_reasoning?.clinical_confidence || 0) * 100).toFixed(1)}%)
                           </div>
                        </div>
                        <div>
                           <span className="font-medium">Speech Model:</span>
                           <div className="text-sm text-gray-600">
                              {severityMap[xaiData.meta_explanation.speech_prediction]}
                              ({((xaiData.meta_explanation.ensemble_reasoning?.speech_confidence || 0) * 100).toFixed(1)}%)
                           </div>
                        </div>
                     </div>

                     <div className="mb-4">
                        <span className="font-medium">Ensemble Reasoning: </span>
                        <p className="text-sm text-gray-700 mt-1">
                           {xaiData.meta_explanation.ensemble_reasoning?.reasoning}
                        </p>
                     </div>

                     <div className="bg-orange-50 p-3 rounded">
                        <h4 className="font-medium mb-2">Final Assessment:</h4>
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                           {xaiData.meta_explanation.clinical_interpretation}
                        </pre>
                     </div>
                  </div>
               )}
            </div>
         )}
      </div>
   );
};

export default XAIReportDisplay;
