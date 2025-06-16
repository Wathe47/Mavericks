import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Button from "./Button";
import Section from "./Section";
import { useRef } from "react";
import { video2 } from '../assets';

const Landing = () => {
   const parallaxRef = useRef(null);

   useGSAP(() => {
      gsap.to('#heading', { opacity: 1, delay: 2, duration: 2 })
      gsap.to('#cta', { opacity: 1, y: -50, delay: 2, duration: 2 })
      gsap.to('#video', { opacity: 1, delay: 2, duration: 2 })
   }, [])

   return (
      <Section
         id="hero"
      >
         <div className="absolute inset-0 w-full h-full overflow-hidden z-0 -mt-20">
            <video
               src={video2}
               autoPlay
               loop
               muted
               playsInline
               className="w-full h-full object-cover"
            />
            <div id='video' className="absolute inset-0 bg-black bg-opacity-50 z-0 opacity-0"></div>
         </div>
         <div className="container relative pt-[5rem] -mt-[1.25rem]" ref={parallaxRef}>

            <div className="relative z-1 max-w-[62rem] mx-auto text-center mb-[3.875rem] md:mb-20 lg:mb-[6.25rem] -mt-[5rem] ">
               <h1 id="heading" className="h1 mb-6 opacity-0">
                  Explore the Power of AI
                  with Mavericks! 
               </h1>
               <div id='cta' className='opacity-0 mt-[22rem]'>
                  <Button href="/pricing" white>
                     Get started
                  </Button>
                  <p className="body-1 mt-5 max-w-3xl mx-auto mb-6 text-n-1 lg:mb-8">
                     Your intelligent companion for diagnosing neuropsychiatric disorders. Unlock the future of mental health diagnostics with Mavericks!
                  </p>
               </div>
            </div>
         </div>
      </Section>
   );
};

export default Landing;
