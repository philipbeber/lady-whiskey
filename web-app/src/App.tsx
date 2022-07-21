import React, { useEffect, useState } from "react";
import "./App.css";
import { initializeFeatures, getLeds } from "./fire-2";
import Video from "./Video";

const ledSize = 3;
const ledCount = 125;
const height = ledSize * ledCount;

function App() {
  // const [strips, setStrips] = useState<string[][]>([]);
  // useEffect(() => {
  //   initializeFeatures();
  //   const timer = setInterval(() => {
  //     setStrips(getLeds());
  //   }, 100);
  //   return () => {
  //     clearInterval(timer);
  //   };
  // }, []);
  return (
    <div className="App">
      <header className="App-header">
        <Video />
        {/* <svg viewBox={`0 0 ${height} ${height}`} fill={fill}>
          {strips.map((s, y) =>
            s.map((rgb: string, i: number) => (
              <circle
                key={i.toString()}
                cy={height - (i + 0.5) * ledSize}
                cx={10 + 80 * y}
                r={ledSize / 2}
                fill={rgb}
              />
            ))
          )}
        </svg> */}
      </header>
    </div>
  );
}

export default App;
