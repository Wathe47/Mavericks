import { useState } from "react";
import Button from "./Button";
import Heading from "./Heading";
import Section from "./Section";
import { features } from "../constants";

const Features = () => {
   const [hovered, setHovered] = useState(null);

   return (
      <Section className="overflow-hidden" id="features">
         <div className="container md:pb-10">
            <Heading title="What we’re working on" />

            <div className="relative grid gap-8 md:grid-cols-2 md:gap-8 md:pb-[7rem]">
               {features.map((item, idx) => (
                  <div
                     key={item.id}
                     className={`
                        md:flex even:md:translate-y-[7rem] border border-n-1/5 p-0.25 rounded-[2.5rem] bg-n-6 tr
                        transition-transform duration-300
                        ${hovered === null
                           ? ""
                           : hovered === idx
                              ? "scale-105 z-10"
                              : "scale-95 opacity-70"
                        }
                     `}
                     onMouseEnter={() => setHovered(idx)}
                     onMouseLeave={() => setHovered(null)}
                     style={{ willChange: "transform" }}
                  >
                     <div className="relative p-4 bg-n-8 rounded-[2.4375rem] overflow-hidden xl:p-10">
                        <div className="relative z-1">
                           <div className="flex items-center justify-between max-w-[27rem] mb-4 md:mb-5"></div>
                           <div className="mb-10 -my-40 -mx-15">
                              <img
                                 className="w-full"
                                 src={item.imageUrl}
                                 width={628}
                                 height={426}
                                 alt={item.title}
                              />
                           </div>
                           <h4 className="h4 mb-4">{item.title}</h4>
                           <p className="body-2 text-n-4">{item.text}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            <div className="flex justify-center mt-12 md:mt-15 xl:mt-20">
               <Button href="/">Get Started</Button>
            </div>
         </div>
      </Section>
   );
};

export default Features;