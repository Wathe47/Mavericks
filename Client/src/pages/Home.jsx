import ButtonGradient from "../assets/svg/ButtonGradient"
import Modules from "../components/Modules"
import Specifications from "../components/Specifications"
import Landing from "../components/Landing"
import Features from "../components/Features"

const Home = () => {
   return (
      <>
         <Landing />
         <Modules />
         <Specifications />
         <Features />
         <ButtonGradient />
      </>
   )
}

export default Home