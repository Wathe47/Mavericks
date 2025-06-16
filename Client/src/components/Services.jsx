import Section from "./Section";
import Heading from "./Heading";
import { service1, check, smallSphere, stars } from "../assets";
import { mavericksServices } from "../constants";
import {
   Gradient,
} from "./design/Services";

import Generating from "./Generating";

const Services = () => {
   return (
      <>
         <Section id="how-to-use">
            <div className="container">
               <Heading
                  title="Generative AI made for creators."
                  text="mavericks unlocks the potential of AI-powered applications"
               />

               <div className="relative">
                  <div className="relative z-1 flex items-center h-[39rem] mb-5 p-8 border border-n-1/10 rounded-3xl overflow-hidden lg:p-20 xl:h-[46rem]">
                     <div className="absolute top-0 left-0 w-full h-full pointer-events-none md:w-3/5 xl:w-auto">
                        <img
                           className="w-full h-full object-cover md:object-right"
                           width={800}
                           alt="Smartest AI"
                           height={730}
                           src={service1}
                        />
                     </div>

                     <div className="relative z-1 max-w-[17rem] ml-auto">
                        <h4 className="h4 mb-4">Smartest AI</h4>
                        <p className="body-2 mb-[3rem] text-n-3">
                           mavericks unlocks the potential of AI-powered applications
                        </p>
                        <ul className="body-2">
                           {mavericksServices.map((item, index) => (
                              <li
                                 key={index}
                                 className="flex items-start py-4 border-t border-n-6"
                              >
                                 <img width={24} height={24} src={check} />
                                 <p className="ml-4">{item}</p>
                              </li>
                           ))}
                        </ul>
                     </div>

                     <Generating className="absolute left-4 right-4 bottom-4 border-n-1/10 border lg:left-1/2 lg-right-auto lg:bottom-8 lg:-translate-x-1/2" />
                  </div>
                  <Gradient />
               </div>
            </div>
         </Section>
         <Section className="overflow-hidden" id="pricing">
            <div className="container relative z-2">
               <div className="hidden relative justify-center mb-[6.5rem] lg:flex">
                  <img
                     src={smallSphere}
                     className="relative z-1"
                     width={255}
                     height={255}
                     alt="Sphere"
                  />
                  <div className="absolute top-1/2 left-1/2 w-[60rem] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                     <img
                        src={stars}
                        className="w-full"
                        width={950}
                        height={400}
                        alt="Stars"
                     />
                  </div>
               </div>
            </div>
         </Section>
      </>
   );
};

export default Services;
