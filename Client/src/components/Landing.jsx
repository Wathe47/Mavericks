import gsap from 'gsap';
import Section from "./Section";
import { useRef, useEffect } from "react";
import video2 from '../assets/animations/video2.mp4'; 

const Landing = () => {
   const parallaxRef = useRef(null);

   useEffect(() => {
      const section = document.getElementById('hero');
      if (!section) return;

      const animate = () => {
         gsap.fromTo('#bg-video', { scale: 1 }, { scale: 0.8, duration: 2, ease: "power2.out" });
         gsap.fromTo('#heading', { opacity: 0 }, { opacity: 1, delay: 1, duration: 2 });
         gsap.fromTo('#cta', { opacity: 0, y: 0 }, { opacity: 1, y: -50, delay: 1.5, duration: 2 });
         gsap.fromTo('#video', { opacity: 0 }, { opacity: 1, delay: 1, duration: 2 });
      };

      const observer = new window.IntersectionObserver(
         (entries) => {
            entries.forEach(entry => {
               if (entry.isIntersecting) {
                  animate();
               } else {
                  gsap.set('#bg-video', { scale: 1 });
                  gsap.set('#heading', { opacity: 0 });
                  gsap.set('#cta', { opacity: 0, y: 0 });
                  gsap.set('#video', { opacity: 0 });
               }
            });
         },
         { threshold: 0.3 }
      );

      observer.observe(section);

      return () => observer.disconnect();
   }, []);

   return (
      <Section id="hero">
         <div className="absolute inset-0 w-full h-full overflow-hidden z-0 -mt-20">
            <video
               id="bg-video"
               src={video2}
               autoPlay
               loop
               muted
               playsInline
               className="w-full h-full object-cover transition-transform duration-500"
               style={{ transform: "scale(1)" }}
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
                  <button className='bg-color-8 text-n-1 font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-n-1 hover:text-n-7 transition duration-200 ease-in-out'>
                     Get Started
                  </button>
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