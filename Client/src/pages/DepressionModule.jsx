import { useState } from "react";
import Heading from "../components/Heading";

const DepressionModule = () => {

   const [formData, setFormData] = useState({
      data: ""
   });

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
         ...prevData,
         data: {
            ...prevData.data,
            [name]: value
         }
      }));
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      // Handle form submission logic here
      console.log("Form submitted:", formData);
      // You can send the data to your server or perform any other actions
   };

   return (
      <>
         <video
            src={"./src/assets/animations/video7.mp4"}
            autoPlay
            loop
            muted
            playsInline
            className="fixed top-0 left-0 w-screen h-screen object-cover z-0"
            style={{
               width: '100vw',
               height: '100vh',
               objectFit: 'cover',
               objectPosition: 'center center'
            }}
         />
         <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-10 pointer-events-none"></div>

         <div className="relative z-20">
            <div className="flex flex-col items-center mt-15 h-screen">
               <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Depression Module</h1>
               <p className="text-lg md:text-xl text-white text-center max-w-2xl">
                  This module is designed to help you understand and manage depression. It includes resources, exercises, and support to guide you through your journey.
               </p>
            </div>
            <div className="min-h-screen p-6 text-[#cbd5e1]">
               <Heading
                  title="Clinical Data Submission"
               />
               <div className="relative z-1 flex items-center w-1/2 h-flex mb-5 p-3 border border-n-1/10 rounded-3xl lg:p-15 xl:h-full m-auto bg-[#0f172ab3] rounded-3xl backdrop-blur-sm " >
                  <div className="relative top-0 left-0 w-full h-full  p-6 ">
                     <main className="max-w-lg mx-auto">
                        <form onSubmit={handleSubmit} className="space-y-6">

                           <div>
                              <label htmlFor="age" className="block text-sm font-semibold mb-1">Age</label>
                              <input
                                 id="age"
                                 type="number"
                                 name="clinical.Age"
                                 value={formData.data}
                                 onChange={handleChange}
                                 required
                                 className="w-full rounded-md bg-[#1e293b] border border-[#334155] text-[#ffffff] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ffffff]"
                              />
                           </div>

                        </form>
                        <div className="flex justify-center mt-6">
                           <button
                              onClick={handleSubmit}
                              className="px-4 py-2 bg-[#2563eb] text-white rounded-md hover:bg-[#1d4ed8] transition-colors"
                           >
                              Submit
                           </button>
                        </div>
                     </main>
                  </div>
               </div>
            </div>
         </div>
      </>
   )
}

export default DepressionModule