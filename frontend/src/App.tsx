import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { Footer } from "./components/dexscan/Footer";

// Import background assets
import globalBgNoise from '@/assets/figma_generated/global_bg_noise.png';
import bgGodRay1 from '@/assets/figma_generated/bg_god_ray_1.svg';
import bgGodRay2 from '@/assets/figma_generated/bg_god_ray_2.svg';

const App = () => (
  <BrowserRouter>
    <div
      style={{
        height: "100vh",
        backgroundColor: "#190A35",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Noise Layer - tiled */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${globalBgNoise})`,
          backgroundRepeat: "repeat",
          opacity: 0.1,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Decorative SVGs - positioned individually. Exact positions might need figma inspection or artistic placement. */}
      {/* For now, placing them generally. These might need more specific styling for size/position. */}
      <img
        src={bgGodRay1}
        alt=""
        style={{ position: "absolute", top: "0", right: "15%", opacity: 0.3, zIndex: 2, pointerEvents: "none", height: "100vh" }}
      />
      <img
        src={bgGodRay2}
        alt=""
        style={{ position: "absolute", top: "0", left: "15%", opacity: 0.3, zIndex: 2, pointerEvents: "none", height: "100vh", transform: "scaleX(-1)" }}
      />

      {/* Main Content - ensure it's above background elements */}
      <div style={{ position: "relative", zIndex: 3, flex: 1, overflow: "hidden" }}>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  </BrowserRouter>
);

export default App;
