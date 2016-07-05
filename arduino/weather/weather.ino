#include <Adafruit_ADS1015.h>

#include <Time.h>
#include <TimeLib.h>

#include <SDL_Weather_80422.h>

#include <dht11.h>

#include <SoftwareSerial.h>

#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP085_U.h>




#define pinAnem 2 
#define pinRain 3 
#define intAnem 0  //interrupt 0 Digital Pin 2
#define intRain 1  //interrupt 1 Digital Pin 3

Adafruit_BMP085_Unified bmp = Adafruit_BMP085_Unified(10085);

// initialize SDL_Weather_80422 library
SDL_Weather_80422 weatherStation(pinAnem, pinRain, intAnem, intRain, A0, SDL_MODE_INTERNAL_AD);



dht11 DHTSensor;
const int dhtPin = 4;

String sReqBuffer = "";
String sReplyBuffer = "";     
int led = 13;
float currentWindSpeed;
float currentWindGust = 0.0;
float currentWindDir;
float totalRain;

SoftwareSerial xbee(10, 11); // RX, TX

void setup() {
  // put your setup code here, to run once:
  pinMode(led, OUTPUT);
  Serial.begin(57600);

   if(!bmp.begin())
  {
    /* There was a problem detecting the BMP085 ... check your connections */
    Serial.print("Ooops, no BMP085 detected ... Check your wiring or I2C ADDR!");
    while(1);
  }

  weatherStation.setWindMode(SDL_MODE_SAMPLE, 5.0);
//weatherStation.setWindMode(SDL_MODE_DELAY, 5.0);
  totalRain = 0.0;
 
}

void loop() {
  // put your main code here, to run repeatedly:
 // digitalWrite(led, HIGH);
 // delay(100);
 // digitalWrite(led, LOW);
 // delay(1000);
 // xbee.print("hello");
  
 
   

    currentWindSpeed = weatherStation.current_wind_speed()/1.6;
    currentWindGust = weatherStation.get_wind_gust()/1.6;
    currentWindDir = weatherStation.current_wind_direction();
    totalRain = totalRain + weatherStation.get_current_rain_total()/25.4;

    String sWxMsg = getWXInfo();
    Serial.println(sWxMsg);

/*
    Serial.print(""" wind_speed=");
    Serial.print(currentWindSpeed);
    Serial.print("MPH wind_gust=");
    Serial.print(currentWindGust);
    Serial.print("MPH wind_direction=");
    Serial.println(weatherStation.current_wind_direction());
    Serial.println(weatherStation.current_wind_direction_voltage());
*/
  
 delay(10000);
}


float getPressure()
{
  /* Get a new sensor event */ 
  sensors_event_t event;
  bmp.getEvent(&event);
 
  /* Display the results (barometric pressure is measure in hPa) */
  if (event.pressure)
  {
    return (event.pressure / 33.8638866667);
  }
  else
  {
    return 0;
  }
 }

String getWXInfo()
{
  char cTemp[10];
  char cHum[10];
  char cDew[10];
  char cBar[10];
  char cWs[10];
  char cWg[10];
  char cWd[10];
  char cRain[10];
  
  char cRespBuff[512];
  int chk = 0;
  if((chk = DHTSensor.read(dhtPin)) == 0)
  {
    dtostrf(Fahrenheit(DHTSensor.temperature),2,2,cTemp);
    dtostrf(DHTSensor.humidity,2,2,cHum);
    dtostrf(Fahrenheit(dewPoint(DHTSensor.temperature, DHTSensor.humidity)),2,2, cDew);
    dtostrf(getPressure(),2,2,cBar);
    dtostrf(currentWindSpeed,2,2,cWs);
    dtostrf(weatherStation.get_wind_gust()/1.6,2,2,cWg);
    dtostrf(currentWindDir,2,2,cWd);
    dtostrf(totalRain,2,2,cRain);
    
    sprintf(cRespBuff, "{'Temp':%s, 'Hum':%s, 'Dew':%s, 'bar':%s, 'Ws':%s, 'Wg':%s, 'Wd':%s, 'Rain':%s}", cTemp, cHum, cDew, cBar, cWs, cWg, cWd, cRain);
  }
  else
  {
    sprintf(cRespBuff, "Error reading dht sensor=%d", chk);
  }
 
  return cRespBuff;
}

String getAvgWXInfo(String sRange)
{
  
  return "";
}

//Celsius to Fahrenheit conversion
double Fahrenheit(double celsius)
{
        return 1.8 * celsius + 32;
}

// dewPoint function NOAA
// reference: http://wahiduddin.net/calc/density_algorithms.htm 
double dewPoint(double celsius, double humidity)
{
        double A0= 373.15/(273.15 + celsius);
        double SUM = -7.90298 * (A0-1);
        SUM += 5.02808 * log10(A0);
        SUM += -1.3816e-7 * (pow(10, (11.344*(1-1/A0)))-1) ;
        SUM += 8.1328e-3 * (pow(10,(-3.49149*(A0-1)))-1) ;
        SUM += log10(1013.246);
        double VP = pow(10, SUM-3) * humidity;
        double T = log(VP/0.61078);   // temp var
        return (241.88 * T) / (17.558-T);
}

int stringToInt(String inputString)
{
    char charHolder[inputString.length()+1];
    inputString.toCharArray(charHolder,inputString.length()+1);
    inputString = "";
    int _recievedVal = atoi(charHolder);
    return _recievedVal;
}

