import AnxietyWheel from "./AnxietyWheel";

const colorMap = {
   "No Anxiety": '#38f07b',
   "Generalized Anxiety Disorder": '#f7e967',
   "Social Anxiety": '#ffb347',
   "Panic Disorder": '#FF5F6D',
};

// Helper to normalize prediction
function normalizePrediction(prediction) {
   if (!prediction) return "N/A";
   const cleaned = prediction.trim().toLowerCase();
   if (
      cleaned === "general anxiety disorder" ||
      cleaned === "genral anxiety diorder"
   ) {
      return "Generalized Anxiety Disorder";
   }
   return prediction;
}

export default function AnxietyResultsGauge({ resultData, loading }) {
   if (!resultData) return null;

   // Normalize for display and color
   const anxietySeverity = normalizePrediction(resultData.prediction);
   const metaColor = colorMap[anxietySeverity];

   return (
      <>
         <h2 className="text-2xl font-bold mt-6 text-center text-black">Prediction Results</h2>
         <div className="flex flex-col items-center p-4">
            <h2 className="text-lg font-semibold mb-2">Overall Prediction</h2>
            <div className="flex items-center gap-4 mb-2">
               {/* Removed the span that shows the anxiety type */}

                  <AnxietyWheel prediction={loading ? null : resultData.prediction} spinning={loading} />

            </div>
         </div>
      </>
   );
}