//+--------------------------------------------------------------------------
//
// NightDriver - (c) 2018 Dave Plummer.  All Rights Reserved.
//
// File:        LED Episode 08
//
// Description:
//
//   Draws sample effects on a an addressable strip using FastLED
//
// History:     Sep-15-2020     davepl      Created
//              Oct-05-2020     davepl      Revised for Episode 07
//              Oct-11-2020     davepl      Revised for Episode 08
//              Oct-16-2020     davepl      Revised for Episode 09
//---------------------------------------------------------------------------

#include <Arduino.h>            // Arduino Framework
#define FASTLED_INTERNAL        // Suppress build banner
#include <FastLED.h>

#define NUM_LEDS    250          // FastLED definitions
#define LED_PIN     6

CRGB g_LEDs[NUM_LEDS] = {0};    // Frame buffer for FastLED

int g_lineHeight = 0;
int g_Brightness = 200;         // 0-255 LED brightness scale
int g_PowerLimit = 3000;         // 900mW Power Limit

#include "ledgfx.h"
#include "fire.h"

void setup() 
{
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);

  Serial.begin(115200);
  while (!Serial) { }
  Serial.println("ESP32 Startup");

  FastLED.addLeds<WS2812B, LED_PIN, GRB>(g_LEDs, NUM_LEDS);               // Add our LED strip to the FastLED library
  FastLED.setBrightness(g_Brightness);
  set_max_power_indicator_LED(LED_BUILTIN);                               // Light the builtin LED if we power throttle
  FastLED.setMaxPowerInMilliWatts(g_PowerLimit);                          // Set the power limit, above which brightness will be throttled
}

void DrawMarqueeComparison()
{
  static float scroll = 0.0f;
  scroll += 0.1f;
  if (scroll > 5.0)
    scroll -= 5.0;

  for (float i = scroll; i < NUM_LEDS/2 -1; i+= 5)
  {
    DrawPixels(i, 3, CRGB::Green);
    DrawPixels(NUM_LEDS-1-(int)i, 3, CRGB::Red);
  }
}

void loop() 
{
  bool bLED = 0;

  //ClassicFireEffect fire(NUM_LEDS, 30, 100, 3, 2, false, true);   // Outwards from Middle
  //ClassicFireEffect fire(NUM_LEDS, 30, 100, 3, 2, true, true);    // Inwards toward Middle
  ClassicFireEffect fire(NUM_LEDS, 50, 300, 30, 30, true, true);     // Outwards from Zero
  //ClassicFireEffect fire(NUM_LEDS, 20, 100, 3, 4, false, false);     // Inwards from End
  //ClassicFireEffect fire(NUM_LEDS, 50, 300, 30, 12, true, false);     // More Intense, Extra Sparking

  // ClassicFireEffect fire(NUM_LEDS, 20, 100, 3, NUM_LEDS, true, false);     // Fan with correct rotation

  while (true)
  {
    FastLED.clear();
    fire.DrawFire();
    FastLED.show(g_Brightness);                          //  Show and delay

  }
}
