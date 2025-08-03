import { Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";

import Home from "./pages/Home";
// import DementiaModule from "./pages/DementiaModule";
import DepressionModule from "./pages/DepressionModule";
import AnxietyModule from "./pages/AnxietyModule";
import DementiaModuleRefactored from "./pages/DementiaModuleRefactored";


const App = () => {
  return (
   <>
      <div className="pt-[4.75rem] lg:pt-[5.25rem] overflow-hidden">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dementia-module" element={<DementiaModuleRefactored />} />
          <Route path="/depression-module" element={<DepressionModule />} />
          <Route path="/anxiety-module" element={<AnxietyModule />} />
        </Routes>
        <Footer />
      </div>
    </>
  );
};

export default App;