#include <Arduino.h>  // Arduino Framework
#include <FastLED.h>
#include <avr/pgmspace.h>
#include "data.h"

#define LEDS_PER_FULL_STRIP (LEDS_PER_STRIP * 2)  // FastLED definitions
#define NUM_STRIPS 5
#define LED_PIN_0 6
#define LED_PIN_1 7
#define LED_PIN_2 8
#define LED_PIN_3 9
#define LED_PIN_4 10

CRGB g_LEDs[LEDS_PER_FULL_STRIP * NUM_STRIPS] = { 0 };  // Frame buffer for FastLED

int g_Brightness = 60;   // 0-255 LED brightness scale
int g_PowerLimit = 50000;  // 50W Power Limit

int stripByteCount = 3 * LEDS_PER_STRIP;
void copyFrame(int frameNum, int strip, void* dest) {
 memcpy_PF(dest, getFrame(frameNum, strip), stripByteCount);
  //memcpy_P(dest, frameStrips[frameNum * NUM_STRIPS + strip], stripByteCount);
}

void setup()
{
  // initializeFrameStrips();
  pinMode(LED_BUILTIN, OUTPUT);
  for (int i = 0; i < NUM_STRIPS; i++) {
    pinMode(LED_PIN_0 + i, OUTPUT);
  }

  Serial.begin(115200);
  while (!Serial) {
  }
  Serial.println("ESP32 Startup");

  // Add our LED strip to the FastLED library
  FastLED.addLeds<WS2812B, LED_PIN_0, GRB>(g_LEDs + LEDS_PER_FULL_STRIP * 0, LEDS_PER_FULL_STRIP);
  FastLED.addLeds<WS2812B, LED_PIN_1, GRB>(g_LEDs + LEDS_PER_FULL_STRIP * 1, LEDS_PER_FULL_STRIP);
  FastLED.addLeds<WS2812B, LED_PIN_2, GRB>(g_LEDs + LEDS_PER_FULL_STRIP * 2, LEDS_PER_FULL_STRIP);
  FastLED.addLeds<WS2812B, LED_PIN_3, GRB>(g_LEDs + LEDS_PER_FULL_STRIP * 3, LEDS_PER_FULL_STRIP);
  FastLED.addLeds<WS2812B, LED_PIN_4, GRB>(g_LEDs + LEDS_PER_FULL_STRIP * 4, LEDS_PER_FULL_STRIP);
  FastLED.setBrightness(g_Brightness);
  set_max_power_indicator_LED(LED_BUILTIN);       // Light the builtin LED if we power throttle
  FastLED.setMaxPowerInMilliWatts(g_PowerLimit);  // Set the power limit, above which brightness will be throttled

}

int offset = 0;
int frame = 0;

void loop()
{
  FastLED.clear();

  for (int i = 0; i < NUM_STRIPS; i++) {
    int frameStrip = (i + offset) % NUM_STRIPS;
    // Get first half of strip
    copyFrame(frame, frameStrip, g_LEDs + LEDS_PER_FULL_STRIP * i);
    // Second half is just the first half mirrored
    for (int j = 0; j < LEDS_PER_STRIP; j++) {
      g_LEDs[LEDS_PER_FULL_STRIP * (i + 1) - j - 1] = g_LEDs[LEDS_PER_FULL_STRIP * i + j];
    }
  }
  FastLED.show(g_Brightness);
  frame++;
  if (frame >= NUM_FRAMES)
  {
    frame = 0;
    offset = (offset + 1) % NUM_STRIPS;
  }
  delay(100);
}