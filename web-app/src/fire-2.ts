import { heatColor } from "./fire-1";

interface Feature {
  x: number;
  y: number;
  t: number;
}

const numStrips = 5;
const numLeds = 125;
const numFeatures = 5;

const features = [] as Feature[];

function randomInt(limit: number) {
  return Math.floor(limit * Math.random());
}

function random(limit: number) {
  return limit * Math.random();
}

function randomY() {
  return Math.floor(Math.random() * Math.random() * numLeds);
}

function addFeature() {
  features.push({
    x: randomInt(numStrips),
    y: randomY(),
    t: randomInt(5),
  });
}

export function initializeFeatures() {
  for (let i = 0; i < numFeatures; i++) {
    addFeature();
  }
}

export function getLeds(): string[][] {
  const leds: number[][] = [];
  for (let i = 0; i < numStrips; i++) {
    leds.push([]);
  }
  for (let i = 0; i < features.length; i++) {
    const feature = features[i];
    const strip1 = leds[(feature.x + numStrips - 1) % numStrips];
    const strip2 = leds[feature.x];
    const strip3 = leds[(feature.x + 1) % numStrips];
    const intensity = feature.t > 2 ? 5 - feature.t : feature.t + 1;
    for (
      let j = Math.max(0, feature.y - 3);
      j < Math.min(numLeds, feature.y + 3);
      j++
    ) {
      strip1[j] = (strip1[j] || 0) + 25 * intensity;
      strip3[j] = (strip3[j] || 0) + 25 * intensity;
    }
    for (
      let i = Math.max(0, feature.y - 6);
      i < Math.min(numLeds, feature.y + 6);
      i++
    ) {
      strip2[i] = (strip2[i] || 0) + 50 * intensity;
    }
    if (feature.t > 3) {
      features.splice(i, 1);
      i--;
    } else {
      feature.t++;
    }
  }
  for (let i = 0; i < 20; i++) {
    if (Math.random() < 0.5) {
      addFeature();
    }
  }
  return leds.map((s) => s.map(heatColor));
}
