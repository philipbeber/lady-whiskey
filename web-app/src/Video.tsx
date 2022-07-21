import { useEffect, useRef, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";

const numStrips = 5;
const numLeds = 125;
const ledSize = 3;
const ledCount = 125;
const height = ledSize * ledCount;

interface HTMLVideoElement2 extends HTMLVideoElement {
  captureStream(): MediaStream;
}

function average(
  data: Uint8ClampedArray,
  windowX: number,
  windowY: number,
  windowWidth: number,
  windowHeight: number,
  frameWidth: number
) {
  let count = 0;
  let r = 0,
    g = 0,
    b = 0;
  for (let x = windowX; x < windowX + windowWidth; x++) {
    for (let y = windowY; y < windowY + windowHeight; y++) {
      count++;
      const index = 4 * (y * frameWidth + x);
      r += data[index];
      g += data[index + 1];
      b += data[index + 2];
    }
  }
  // console.log(
  //   r,
  //   g,
  //   b,
  //   count,
  //   Math.floor(r / count),
  //   Math.floor(g / count),
  //   Math.floor(b / count)
  // );
  return [Math.floor(r / count), Math.floor(g / count), Math.floor(b / count)];
}

const Video: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement2>(null);
  const [processing, setProcessing] = useState(false);
  const [buttonText, setButtonText] = useState("Start");
  const arduinoFrameDataRef = useRef([] as number[][][]);
  const [arduinoFrameCount, setArduinoFrameCount] = useState(0);
  const [arduinoCode, setArduinoCode] = useState("");
  const [svgStrips, setSvgStrips] = useState<string[][]>([]);

  function drawImages() {}
  async function getVideoTrack() {
    const video = videoRef.current;
    if (video) {
      await video.play();
      const [track] = video.captureStream().getVideoTracks();
      video.onended = (evt) => track.stop();
      return track;
    }
  }

  function generateArduinoCode() {
    const frameData = arduinoFrameDataRef.current;
    const frameCount = Math.min(frameData.length, 80);
    let text = "#include <avr/pgmspace.h>\n";
    text += `#define NUM_FRAMES ${frameCount}\n`;
    text += `#define NUM_STRIPS ${numStrips}\n`;
    text += `#define LEDS_PER_STRIP ${numLeds}\n`;
    // Loop over frames
    for (let frameIdx = 0; frameIdx < frameCount; frameIdx++) {
      const frame = frameData[frameIdx];
      // Loop over strips
      for (let stripIdx = 0; stripIdx < frame.length; stripIdx++) {
        text += `const uint8_t frame${frameIdx}_strip${stripIdx}[] PROGMEM = {\n`;
        const strip = frame[stripIdx];
        // Loop over leds
        for (let ledIdx = 0; ledIdx < strip.length; ledIdx++) {
          const val =
            ledIdx % 3 == 2 ? Math.round(strip[ledIdx] / 2) : strip[ledIdx];
          text += "0x" + val.toString(16);
          if (ledIdx != strip.length - 1) {
            text += ", ";
          }
          if (ledIdx % 30 == 29) {
            text += "\n";
          }
        }
        text += "\n};\n";
      }
      // // Create frame variable to reference strips
      // text += `const uint8_t *const PROGMEM frame${frameIdx}[] = {\n`;
      // for (let stripIdx = 0; stripIdx < frame.length; stripIdx++) {
      //   text += `frame${frameIdx}_strip${stripIdx}`;
      //   if (stripIdx != frame.length - 1) {
      //     text += ", ";
      //   }
      // }
      // text += "\n};\n";
    }
    // Create variable to reference frames
    // text += `const uint32_t frameStrips[] = {\n`;
    // for (let frameIdx = 0; frameIdx < frameCount; frameIdx++) {
    //   const frame = frameData[frameIdx];
    //   for (let stripIdx = 0; stripIdx < frame.length; stripIdx++) {
    //     text += `frame${frameIdx}_strip${stripIdx}`;
    //     if (frameIdx != frameCount - 1 || stripIdx != frame.length - 1) {
    //       text += ", ";
    //     }
    //     text += "\n";
    //   }
    // }
    // text += "};\n";
    // Create function to get frame
    text += `uint32_t getFrame(int frame, int strip) {\n`;
    text += `switch(frame) {\n`;
    for (let frameIdx = 0; frameIdx < frameCount; frameIdx++) {
      text += `case ${frameIdx}:\n`;
      text += `switch(strip) {\n`;
      const frame = frameData[frameIdx];
      for (let stripIdx = 0; stripIdx < frame.length; stripIdx++) {
        text += `case ${stripIdx}: return pgm_get_far_address(frame${frameIdx}_strip${stripIdx});\n`;
      }
      text += `}\n`;
    }
    text += `}\n`;
    text += `}\n`;
    setArduinoCode(text);
  }

  const onclick = () => {
    setProcessing(!processing);
    setButtonText(processing ? "Start" : "Stop");
  };

  const calculateLedData = (frame: ImageBitmap) => {
    const canvas = new OffscreenCanvas(frame.width, frame.height);
    const ctx = canvas.getContext("2d");
    canvas.width = frame.width;
    canvas.height = frame.height;
    if (!ctx) {
      return;
    }
    ctx.drawImage(frame, 0, 0);
    const data = ctx.getImageData(0, 0, frame.width, frame.height).data;
    const svgData = [] as string[][];
    const arduinoFrame = [] as number[][];
    // console.log(data.length, frame.width, frame.height);
    for (let ledX = 0; ledX < numStrips; ledX++) {
      const svgStrip = [] as string[];
      svgData.push(svgStrip);
      const arduinoStrip = [] as number[];
      arduinoFrame.push(arduinoStrip);
      const pixelX = Math.floor((frame.width / numStrips) * ledX);
      for (let ledY = 0; ledY < numLeds; ledY++) {
        const pixelY = Math.floor(
          frame.height - (frame.height / numLeds) * (ledY + 1)
        );
        const rawLeds = average(
          data,
          pixelX,
          pixelY,
          frame.width / numStrips,
          frame.height / numLeds,
          frame.width
        );
        // const idx = 4 * (pixelY * frame.width + pixelX);
        // const rgb = `rgb(${data[idx]}, ${data[idx + 1]}, ${data[idx + 2]})`;
        const [r, g, b] = rawLeds;
        const rgb = `rgb(${r}, ${g}, ${b})`;
        arduinoStrip.push(...rawLeds);
        svgStrip.push(rgb);
      }
    }
    setSvgStrips(svgData);
    arduinoFrameDataRef.current.push(arduinoFrame);
    setArduinoFrameCount(arduinoFrameDataRef.current.length);
    console.log(arduinoFrameDataRef.current.length);
  };

  // useEffect(() => {
  //   let frameIndex = 0;
  //   const interval = setInterval(() => {
  //     if (canvasRef.current && frames.length) {
  //       if (frameIndex >= frames.length) {
  //         frameIndex = 0;
  //       }
  //       const canvas = canvasRef.current;
  //       const ctx = canvas.getContext("2d");
  //       const frame = frames[frameIndex];
  //       canvas.width = frame.width;
  //       canvas.height = frame.height;
  //       if (ctx) {
  //         ctx.drawImage(frame, 0, 0);
  //         const data = ctx.getImageData(0, 0, frame.width, frame.height).data;
  //         const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${
  //           data[3] / 255
  //         })`;
  //         setImageData(rgba);
  //       }
  //       frameIndex++;
  //     }
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, [frames, canvasRef.current]);

  useEffect(() => {
    if (!processing) {
      return;
    }
    if (!window.MediaStreamTrackProcessor) {
      console.error("your browser doesn't support this API yet");
      return;
    }

    let stopped = false;
    getVideoTrack().then((track) => {
      const processor = new MediaStreamTrackProcessor(track as any);
      const reader = processor.readable.getReader();

      let frameNumber = 0;
      const readChunk = () => {
        reader.read().then(async ({ done, value }) => {
          frameNumber++;
          if (value) {
            if (frameNumber % 4 == 0) {
              const frame = await createImageBitmap(value as any);
              calculateLedData(frame);
            }
            value.close();
          }
          if (!done && !stopped) {
            readChunk();
          } else {
            //          select.disabled = false;
          }
        });
      };

      readChunk();
    });

    return () => {
      stopped = true;
    };
  }, [processing]);

  // useEffect(() => {
  //   getVideoTrack();
  // }, [videoRef.current]);

  // useEffect(() => {
  //   if (canvasRef.current) {
  //     var jsmpeg = require("jsmpeg");
  //     var player = new jsmpeg("/FireplaceWide.mpeg", {
  //       canvas: canvasRef.current,
  //       autoplay: true,
  //       loop: true,
  //     });
  //     player.pause();
  //     player.play();
  //     player.stop();
  //   }
  // }, [canvasRef.current]);

  return (
    <div id="asdf">
      <button onClick={onclick}>{buttonText}</button>
      <button onClick={drawImages}>Draw</button>
      <video ref={videoRef} src="/FireplaceSkinny.mov" height={50}></video>
      <div style={{ width: 500, height: 500 }}>
        <svg viewBox={`0 0 ${height} ${height}`}>
          {svgStrips.map((s, y) =>
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
        </svg>
      </div>
      <button onClick={generateArduinoCode}>
        Generate code for {arduinoFrameCount} frames
      </button>
      <CopyToClipboard text={arduinoCode}>
        <button>Copy to clipboard</button>
      </CopyToClipboard>
      <pre>{arduinoCode}</pre>
    </div>
  );
};

export default Video;
