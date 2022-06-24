// Arduino code to make RGB LEDs flicker like they're on fire
// Copyright (c) 2012 Philip Beber

// connections from arduino to RGB amplifier:
// pin 9 to input/R (red wire)
// pin 10 to input/G (green wire)
// pin 11 to input/B (blue wire)
// pin 5V to input/V+ (white wire)

// connections from lights to RGB amplifier
// red to output/R
// green to output/G
// blue to output/B
// black to output/V+

// connect RGB amplifier to 12V supply (where it says power + - )

// connect arduino to 12V supply


int redPin = 9;
int greenPin = 10;
int bluePin = 11;


int normalize(int intensity)
{
  if(intensity < 0)
  {
    intensity = 0;
  }
  else if (intensity > 255)
  {
    intensity = 255;
  }
  
  return intensity;
}

//
// 0 - off. 255 = full on
//
void setPin(int pinNumber, int intensity)
{
  intensity = normalize((65536L - (long)intensity * (long)intensity) / 256);
  
  analogWrite(pinNumber, intensity);
}


void setup()
{
pinMode(redPin, OUTPUT);
pinMode(greenPin, OUTPUT);
pinMode(bluePin, OUTPUT);

}

/*
int redLength = 400;
int yellowLength = 200;
int 
int randomRed() {
  return random(128);
}

int randomGreen
*/

unsigned long nextYellowOn = 0;
unsigned long nextYellowOff = 0;
unsigned long nextRed = 0;
unsigned long nextWhiteOn = 0;
unsigned long whiteLength = 200;
int red = 0;
int yellow = 0;
int white = 0;
unsigned long lastMillis = -1;

void loop() {

  int timeNow = millis();
  if(lastMillis > timeNow)
  {
    nextYellowOn = 0;
    nextYellowOff = 0;
    nextRed = 0;
    red = 0;
    yellow = 0;
  }
  
  lastMillis = timeNow;
  
  if(nextRed < timeNow)
  {
    nextRed = timeNow + random(300);
    red = random(256);
  }
  
  if(nextYellowOn < timeNow)
  {
    nextYellowOn = timeNow + random(100);
    yellow = random(127);
    
    if(nextYellowOff == 0)
    {
      nextYellowOff = timeNow + random(2000);
    }
  }
  
  if(nextYellowOff < timeNow)
  {
    yellow = 0;
    nextYellowOn = timeNow + random(1000);
    nextYellowOff = 0;
  }
  
  if((nextWhiteOn + whiteLength) < timeNow)
  {
    white = 0;
    nextWhiteOn = timeNow + random(5000);
  }
  else if(nextWhiteOn < timeNow)
  {
    white = random(256);
  }
 
  int actualRed = normalize(red + yellow + white);
  int actualGreen = normalize(yellow / 2 + white / 3);
  int actualBlue = white / 4;
  
  setPin(redPin, actualRed);
  setPin(greenPin, actualGreen);
  setPin(bluePin, actualBlue);
  
}
