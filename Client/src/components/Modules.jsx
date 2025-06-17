import { useRef, useEffect } from "react";
import { modules } from "../constants";
import Heading from "./Heading";
import Section from "./Section";
import Arrow from "../assets/svg/Arrow";
import ClipPath from "../assets/svg/ClipPath";
import { Link } from "react-router-dom";
import gsap from 'gsap';

const Modules = () => {
   const sectionRef = useRef(null);

   useEffect(() => {
      const cards = document.querySelectorAll('[id^="module-"]');
      const observers = [];

      cards.forEach((card, idx) => {
         gsap.set(card, { opacity: 0, y: 50 });

         const observer = new window.IntersectionObserver(
            (entries) => {
               entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                     gsap.to(
                        card,
                        { opacity: 1, y: 0, duration: 1, delay: idx * 0.15, overwrite: "auto" }
                     );
                  } else {
                     gsap.to(card, { opacity: 0, y: 100, duration: 0.5, overwrite: "auto" });
                  }
               });
            },
            { threshold: 0.3 }
         );
         observer.observe(card);
         observers.push(observer);
      });

      return () => observers.forEach((obs) => obs.disconnect());
   }, []);

   return (
      <Section id="modules" ref={sectionRef}>
         <div className="container relative z-2 -mt-20">
            <Heading
               className="md:max-w-md lg:max-w-2xl"
               title="Our Diagnostic Modules"
            />

            <div className="flex flex-wrap gap-10 mb-10">
               {modules.map((item, idx) => (
                  <div
                     className="block relative p-0.5 bg-no-repeat bg-[length:100%_100%] md:max-w-[24rem]"
                     key={item.id}
                     style={{
                        backgroundImage: `url(${item.backgroundUrl})`,
                     }}
                     id={`module-${idx}`}
                  >
                     <Link
                        to={item.pageUrl}
                        aria-label={item.title}
                     >
                        <div className="relative z-2 flex flex-col min-h-[22rem] p-[2.4rem] pointer-events-none">
                           <h5 className="h5 mb-5">{item.title}</h5>
                           <p className="body-2 mb-6 text-n-3">{item.text}</p>
                           <div className="flex items-center mt-auto">
                              <p
                                 className="ml-auto font-code text-xs font-bold text-n-1 uppercase tracking-wider"
                              >
                                 Explore more
                              </p>
                              <Arrow />
                           </div>
                        </div>
                        <div
                           className="absolute inset-0.5 bg-n-8 "
                           style={{ clipPath: "url(#benefits)" }}
                        >
                           <div className="absolute inset-0 opacity-15 transition-opacity hover:opacity-60 z-10">
                              {item.videoUrl && (
                                 <video
                                    src={item.videoUrl}
                                    width={380}
                                    height={362}
                                    alt={item.title}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                 />
                              )}
                           </div>
                        </div>
                        <ClipPath />
                     </Link>
                  </div>
               ))}
            </div>
         </div>
      </Section>
   );
};

export default Modules;