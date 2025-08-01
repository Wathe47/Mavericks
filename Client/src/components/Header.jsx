import { useLocation } from "react-router-dom";
import { disablePageScroll, enablePageScroll } from "scroll-lock";

import { navigation } from "../constants";
import Button from "./Button";
import MenuSvg from "../assets/svg/MenuSvg";
import { useState } from "react";

const Header = () => {
   const pathname = useLocation();
   const [openNavigation, setOpenNavigation] = useState(false);

   const toggleNavigation = () => {
      if (openNavigation) {
         setOpenNavigation(false);
         enablePageScroll();
      } else {
         setOpenNavigation(true);
         disablePageScroll();
      }
   };

   const handleClick = () => {
      if (!openNavigation) return;

      enablePageScroll();
      setOpenNavigation(false);
   };

   return (
      <>
         <div
            className={`fixed top-0 left-0 w-full z-50  border-b border-n-6 bg-black/30 backdrop-blur-md`}
         >

            <div className="flex items-center px-5 lg:px-7.5 xl:px-10 max-lg:py-4">
               <div className="flex items-center justify-center w-1/4 mr-4 lg:mr-6 xl:mr-8">
               <a className="block w-[13rem] xl:mr-8" href="/">
                  <h1 className="text-4xl text-color-9 font-bold font-bigshoulders"
                     style={{
                        textShadow: `
                     0 0 8px rgba(193,255,114,0.75),
                     0 0 16px rgba(193,255,114,0.65),
                     0 0 24px rgba(193,255,114,0.2),
                     0 0 32px rgba(193,255,114,0.1)
                  `
                     }}
                  >M A V E R I C K S</h1>
               </a>
               </div>


               <nav
                  className={`${openNavigation ? "flex" : "hidden"
                     } fixed top-[5rem] left-0 right-0 bottom-0 bg-n-8 lg:static lg:flex lg:mx-auto lg:bg-transparent`}
               >
                  <div className="relative z-2 flex flex-col items-center justify-center m-auto lg:flex-row">
                     {navigation.map((item) => (
                        <a
                           key={item.id}
                           href={item.url}
                           onClick={handleClick}
                           className={`block relative font-code text-2xl uppercase text-n-1 transition-colors hover:text-color-1 ${item.onlyMobile ? "lg:hidden" : ""
                              } px-6 py-6 md:py-8 lg:-mr-0.25 lg:text-xs lg:font-semibold ${item.url === pathname.hash
                                 ? "z-2 lg:text-n-1"
                                 : "lg:text-n-1/50"
                              } lg:leading-5 lg:hover:text-n-1 xl:px-12`}
                        >
                           {item.title}
                        </a>
                     ))}
                  </div>
               </nav>
               <a
                  href="#signup"
                  className="button hidden mr-8 text-n-1/50 transition-colors hover:text-n-1 lg:block"
               >
                  New account
               </a>
               <Button className="hidden lg:flex" href="#login">
                  Sign in
               </Button>

               <Button
                  className="ml-auto lg:hidden"
                  px="px-3"
                  onClick={toggleNavigation}
               >
                  <MenuSvg openNavigation={openNavigation} />
               </Button>
            </div>
         </div>
      </>
   );
};

export default Header;
