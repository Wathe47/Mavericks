
const colorMap = {
   "No Anxiety": '#38f07b',
   "General Anxiety Disorder": '#f7e967',
   "Social Anxiety": '#ffb347',
   "Panic Disorder": '#FF5F6D',
};

export default function AnxietyResultsGauge({ resultData }) {
   if (!resultData) return null;

   let anxietySeverity = resultData.prediction;

   console.log(anxietySeverity);

   const metaColor = colorMap[anxietySeverity]

   return (
      <>
         <h2 className="text-2xl font-bold mt-6 text-center text-black">Prediction Results</h2>
         <div className="flex flex-col items-center p-4">
            <h2 className="text-lg font-semibold mb-2">Overall Prediction</h2>
            <div className="flex items-center gap-4 mb-2">
               <span className="px-3 py-1 rounded-full text-white text-xl font-semibold" style={{ background: metaColor }}>
                  {anxietySeverity}
               </span>
            </div>
            
         </div>

         
      </>
   );
}