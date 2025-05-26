import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

// Import background assets
import globalBgNoise from '@/assets/figma_generated/global_bg_noise.png';
import bgSmallComet from '@/assets/figma_generated/bg_small_comet.svg';
import bgLargeComet from '@/assets/figma_generated/bg_large_comet.svg';
import bgGodRay1 from '@/assets/figma_generated/bg_god_ray_1.svg';
import bgGodRay2 from '@/assets/figma_generated/bg_god_ray_2.svg';

const App = () => (
  <BrowserRouter>
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#190A35",
        position: "relative",
        overflow: "hidden", // To contain absolutely positioned elements if they might overflow
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
        src={bgSmallComet}
        alt=""
        style={{ position: "absolute", top: "10%", left: "10%", opacity: 0.4, zIndex: 2, pointerEvents: "none", width: "200px" }}
      />
      <img
        src={bgLargeComet}
        alt=""
        style={{ position: "absolute", bottom: "5%", right: "5%", opacity: 0.4, zIndex: 2, pointerEvents: "none", width: "400px" }}
      />
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
      <div style={{ position: "relative", zIndex: 3 }}>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </div>
    </div>
  </BrowserRouter>
);

export default App;
