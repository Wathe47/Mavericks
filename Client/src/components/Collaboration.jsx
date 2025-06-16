import { check } from "../assets";
import { collabContent } from "../constants";
import Button from "./Button";
import Section from "./Section";
import doctor from "../assets/doctor.png";

const Collaboration = () => {
   return (
      <Section crosses>
         <div className="container lg:flex">
            <div className="max-w-[25rem]">
               <h2 className="h2 mb-4 md:mb-8">
                  AI App for seamless diagnosis
               </h2>

               <ul className="max-w-[22rem] mb-10 md:mb-14">
                  {collabContent.map((item) => (
                     <li className="mb-3 py-3" key={item.id}>
                        <div className="flex items-center">
                           <img src={check} width={24} height={24} alt="check" />
                           <h6 className="body-2 ml-5">{item.title}</h6>
                        </div>
                        {item.text && (
                           <p className="body-2 mt-3 text-n-4">{item.text}</p>
                        )}
                     </li>
                  ))}
               </ul>

               <Button>Try it now</Button>
            </div>

            <div className="relative z-1 lg:ml-auto xl:w-[50rem] xl:h-[30rem]">
               <div className="relative min-h-[35rem] border border-n-1/10 rounded-3xl overflow-hidden shadow-xl shadow-gray-700">
                  <div className="absolute inset-0">
                     <img
                        src={doctor}
                        className="h-full w-full object-cover -scale-x-100"
                        alt="doctor"
                     />
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-b from-n-8/0 to-n-8/90 lg:p-15">
                     <h4 className="h4 mb-4">Support System</h4>
                     <p className="body-2 mb-[3rem] text-n-3">
                        Your intelligent companion for diagnosing neuropsychiatric disorders.
                     </p>
                  </div>
               </div>
            </div>

         </div>
      </Section>
   );
};

export default Collaboration;
