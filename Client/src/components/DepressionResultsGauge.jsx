import GaugeChart from 'react-gauge-chart';

const colorMap = {
   "No depression detected": '#38f07b',
   "mild": '#f7e967',
   "moderate": '#ffb347',
   "severe": '#FF5F6D',
};

export default function DepressionResultsGauge({ resultData }) {
   if (!resultData) return null;

   let depressionProbability = (100 - resultData.depression_probability * 100);
   let depressionSeverity;
   
   if( resultData.message){
      depressionSeverity = resultData.message;
     depressionProbability = (100 - resultData.depression_probability * 100);

   } else if (resultData.severity_prediction) {
      depressionSeverity = resultData.severity_prediction;
     depressionProbability =  resultData.depression_probability * 100;

   } 

   console.log(depressionProbability, depressionSeverity);
   
   const metaColor = colorMap[depressionSeverity]

   const percent = depressionProbability / 100;
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
               <span className="text-2xl font-bold text-black">{depressionProbability.toFixed(2)}%</span>
               <span className="px-3 py-1 rounded-full text-white text-xl font-semibold" style={{ background: metaColor }}>
                  {depressionSeverity}
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

         
      </>
   );
}