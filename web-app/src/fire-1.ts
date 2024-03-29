const numStrips = 4;
const numLeds = 125;
const spreadRate = 4000;
const coolingRate = 40;
const sparkRate = 1;
//const sparkHeight = 3;
const strips: number[][] = [];
let timeMS: number;

export function initializeLeds() {
  timeMS = Date.now();
  for (let y = 0; y < numStrips; y++) {
    strips[y] = [];
    for (let i = 0; i < numLeds; i++) {
      strips[y][i] = 0;
    }
  }
}

export function updateLeds() {
  const elapsedTime = (Date.now() - timeMS) / 1000;
  timeMS = Date.now();
  for (let y = 0; y < numStrips; y++) {
    const heat = strips[y];
    const newHeat = [];
    for (let i = 0; i < numLeds; i++) {
      const n1 = heat[i - 1] || 0;
      const oldHeat = heat[i] || 0;
      const n2 = heat[i + 1] || 0;
      const spread = Math.min(0.3, spreadRate * elapsedTime);
      const heatAfterSpread =
        n1 * spread + oldHeat * (1 - spread * 2) + n2 * spread;
      const cooling = coolingRate * elapsedTime;
      newHeat[i] = Math.max(0, heatAfterSpread - cooling);
    }
    if (Math.random() < sparkRate * elapsedTime) {
      const sparkPlace = Math.round(Math.random() * numLeds);
      const sparkAmount = Math.random() * 80 + 160;
      const sparkHeight = Math.round(Math.random() * 10);
      for (
        let i = Math.max(0, sparkPlace - sparkHeight + 1);
        i < Math.min(numLeds, sparkPlace + sparkHeight);
        i++
      ) {
        newHeat[i] += sparkAmount;
      }
    }
    for (let i = 0; i < numLeds; i++) {
      heat[i] = Math.min(Math.round(newHeat[i]), 255);
    }
  }
  const rgbs = strips.map((s) => s.map(heatColor));
  //   console.log(Date.now() - timeMS);
  return rgbs;
}

export function heatColor(heat: number): string {
  heat = Math.min(heat, 255);
  return kelvinToRgb[Math.round((heat * kelvinToRgb.length) / 255)] || "#000";
}

const kelvinToRgb = [
  "rgb(0, 0, 0)",
  "rgb(20, 0, 0)",
  "rgb(60, 0, 0)",
  "rgb(80, 0, 0)",
  "rgb(100, 0, 0)",
  "rgb(120, 0, 0)",
  "rgb(140, 0, 0)",
  "rgb(160, 0, 0)",
  "rgb(180, 10, 0)",
  "rgb(200, 20, 0)",
  "rgb(220, 30, 0)",
  "rgb(240, 40, 0)",
  "rgb(255, 56, 0)",
  "rgb(255, 71, 0)",
  "rgb(255, 83, 0)",
  "rgb(255, 93, 0)",
  "rgb(255, 101, 0)",
  "rgb(255, 109, 0)",
  "rgb(255, 115, 0)",
  "rgb(255, 121, 0)",
  "rgb(255, 126, 0)",
  "rgb(255, 131, 0)",
  "rgb(255, 138, 18)",
  "rgb(255, 142, 33)",
  "rgb(255, 147, 44)",
  "rgb(255, 152, 54)",
  "rgb(255, 157, 63)",
  "rgb(255, 161, 72)",
  "rgb(255, 165, 79)",
  "rgb(255, 169, 87)",
  "rgb(255, 173, 94)",
  "rgb(255, 177, 101)",
  "rgb(255, 180, 107)",
  "rgb(255, 184, 114)",
  "rgb(255, 187, 120)",
  "rgb(255, 190, 126)",
  "rgb(255, 193, 132)",
  "rgb(255, 196, 137)",
  "rgb(255, 199, 143)",
  "rgb(255, 201, 148)",
  "rgb(255, 204, 153)",
  "rgb(255, 206, 159)",
  "rgb(255, 209, 163)",
  "rgb(255, 211, 168)",
  "rgb(255, 213, 173)",
  "rgb(255, 215, 177)",
  "rgb(255, 217, 182)",
  "rgb(255, 219, 186)",
  "rgb(255, 221, 190)",
  "rgb(255, 223, 194)",
  "rgb(255, 225, 198)",
  "rgb(255, 227, 202)",
  "rgb(255, 228, 206)",
  "rgb(255, 230, 210)",
  "rgb(255, 232, 213)",
  "rgb(255, 233, 217)",
  "rgb(255, 235, 220)",
  "rgb(255, 236, 224)",
  "rgb(255, 238, 227)",
  "rgb(255, 239, 230)",
  "rgb(255, 240, 233)",
  "rgb(255, 242, 236)",
  "rgb(255, 243, 239)",
  "rgb(255, 244, 242)",
  "rgb(255, 245, 245)",
  "rgb(255, 246, 247)",
  "rgb(255, 248, 251)",
  "rgb(255, 249, 253)",
  "rgb(254, 249, 255)",
  "rgb(252, 247, 255)",
  "rgb(249, 246, 255)",
  "rgb(247, 245, 255)",
  "rgb(245, 243, 255)",
  "rgb(243, 242, 255)",
  "rgb(240, 241, 255)",
  "rgb(239, 240, 255)",
  "rgb(237, 239, 255)",
  "rgb(235, 238, 255)",
  "rgb(233, 237, 255)",
  "rgb(231, 236, 255)",
  "rgb(230, 235, 255)",
  "rgb(228, 234, 255)",
  "rgb(227, 233, 255)",
  "rgb(225, 232, 255)",
  "rgb(224, 231, 255)",
  "rgb(222, 230, 255)",
  "rgb(221, 230, 255)",
  "rgb(220, 229, 255)",
  "rgb(218, 229, 255)",
  "rgb(217, 227, 255)",
  "rgb(216, 227, 255)",
  "rgb(215, 226, 255)",
  "rgb(214, 225, 255)",
  "rgb(212, 225, 255)",
  "rgb(211, 224, 255)",
  "rgb(210, 223, 255)",
  "rgb(209, 223, 255)",
  "rgb(208, 222, 255)",
  "rgb(207, 221, 255)",
  "rgb(207, 221, 255)",
  "rgb(206, 220, 255)",
  "rgb(205, 220, 255)",
  "rgb(207, 218, 255)",
  "rgb(207, 218, 255)",
  "rgb(206, 217, 255)",
  "rgb(205, 217, 255)",
  "rgb(204, 216, 255)",
  "rgb(204, 216, 255)",
  "rgb(203, 215, 255)",
  "rgb(202, 215, 255)",
  "rgb(202, 214, 255)",
  "rgb(201, 214, 255)",
  "rgb(200, 213, 255)",
  "rgb(200, 213, 255)",
  "rgb(199, 212, 255)",
  "rgb(198, 212, 255)",
  "rgb(198, 212, 255)",
  "rgb(197, 211, 255)",
  "rgb(197, 211, 255)",
  "rgb(197, 210, 255)",
  "rgb(196, 210, 255)",
  "rgb(195, 210, 255)",
  "rgb(195, 209, 255)",
];
