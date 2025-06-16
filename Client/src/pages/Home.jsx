import ButtonGradient from "../assets/svg/ButtonGradient"
import Modules from "../components/Modules"
import Collaboration from "../components/Collaboration"
import Landing from "../components/Landing"
import Roadmap from "../components/Roadmap"

const Home = () => {
   return (
      <>
         <Landing />
         <Modules />
         <Collaboration />
         <Roadmap />
         <ButtonGradient />
      </>
   )
}

export default Home