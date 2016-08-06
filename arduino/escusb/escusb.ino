#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BNO055.h>
#include <utility/imumaths.h>
#include <Servo.h>

#define ESC_MAX_FRWD 1900
#define ESC_MAX_REV 1100
#define ESC_STOPPED 1500
#define BNO055_SAMPLERATE_DELAY_MS (100)
#define NUM_MOTORS 5
int nCamPos;

typedef struct motorDef
{
  Servo motor;
  int pin;
};

motorDef motors[NUM_MOTORS];
Adafruit_BNO055 bno = Adafruit_BNO055(55);

void displaySensorDetails(void)
{
  sensor_t sensor;
  bno.getSensor(&sensor);
  Serial.println("------------------------------------");
  Serial.print  ("Sensor:       "); Serial.println(sensor.name);
  Serial.print  ("Driver Ver:   "); Serial.println(sensor.version);
  Serial.print  ("Unique ID:    "); Serial.println(sensor.sensor_id);
  Serial.print  ("Max Value:    "); Serial.print(sensor.max_value); Serial.println(" xxx");
  Serial.print  ("Min Value:    "); Serial.print(sensor.min_value); Serial.println(" xxx");
  Serial.print  ("Resolution:   "); Serial.print(sensor.resolution); Serial.println(" xxx");
  Serial.println("------------------------------------");
  Serial.println("");
  delay(500);
}

void setup() {
  Serial.begin(115200);
  nCamPos = motors[4].motor.read();
  Serial.println(nCamPos);
  Serial.write(nCamPos);
  
  motors[0].pin = 8; //was 10,11,12
  motors[1].pin = 9;
  motors[2].pin = 10;
  motors[3].pin = 11;
  motors[4].pin = 12; //Normal servo motor for cam control, not ESC drive motor
  
  for(int x = 0; x < NUM_MOTORS; x++)
  {
     motors[x].motor.attach(motors[x].pin);
     if(x <= 3)
     {
      motors[x].motor.writeMicroseconds(ESC_STOPPED);    //must send the stop signal on start up to arm the ESC
     }
  }

  
  Serial.println("Orientation Sensor Test"); Serial.println("");
    if(!bno.begin())
  {
    /* There was a problem detecting the BNO055 ... check your connections */
    Serial.print("Ooops, no BNO055 detected ... Check your wiring or I2C ADDR!");
    while(1);
  }

  delay(1000);
  displaySensorDetails();
}

void loop() {
  
  
   while (!Serial.available())
   {
  
    }
  
    char input[50];
    byte size = Serial.readBytes(input, 50);
    //add terminator 0 to end the C string
    input[size] = 0;

    // Read each command pair from terminal input string in the format motorIndex=speed (0=1500;1=1600;2=1500)
    char* command = strtok(input, ";");
    while (command != 0)
    {
         //Serial.println(command);
        // Split the command in two values
        char* separator = strchr(command, '=');
        if (separator != 0)
        {
            // Actually split the string in 2: replace ':' with 0
            *separator = 0;
            int motorId = atoi(command);
            ++separator;
            int thrust = atoi(separator);
            
            Serial.println(motorId);
            Serial.println(thrust);
            
            if(motorId<= 3)
            {
              motors[motorId].motor.writeMicroseconds(thrust);
            }
           else
            {
             switch(thrust)
             {
              case 0:
              break;
              case 1:
               //nCamPos = nCamPos > 10 ? --10: 0;
               if(nCamPos > 10)
               {
                nCamPos = nCamPos -10;
                }
              break;
              case 2:
              if(nCamPos < 180)
              {
                nCamPos = nCamPos + 10;
                }
              break;
              } 
              Serial.println(nCamPos);
              //motors[4].motor.writeMicroseconds(nCamPos);
              motors[4].motor.write(nCamPos);
            }
            
        }
        // Find the next command in input string
        command = strtok(0, ";");

        /* Get a new sensor event */
  sensors_event_t event;
  bno.getEvent(&event);

  /* Board layout:
         +----------+
         |         *| RST   PITCH  ROLL  HEADING
     ADR |*        *| SCL
     INT |*        *| SDA     ^            /->m
     PS1 |*        *| GND     |            |
     PS0 |*        *| 3VO     Y    Z-->    \-X
         |         *| VIN
         +----------+
  */

  /* The processing sketch expects data as roll, pitch, heading */
  Serial.print(F("Orientation: "));
  Serial.print((float)event.orientation.x);
  Serial.print(F(" "));
  Serial.print((float)event.orientation.y);
  Serial.print(F(" "));
  Serial.print((float)event.orientation.z);
  Serial.println(F(""));

  /* Also send calibration data for each sensor. */
  uint8_t sys, gyro, accel, mag = 0;
  bno.getCalibration(&sys, &gyro, &accel, &mag);
  Serial.print(F("Calibration: "));
  Serial.print(sys, DEC);
  Serial.print(F(" "));
  Serial.print(gyro, DEC);
  Serial.print(F(" "));
  Serial.print(accel, DEC);
  Serial.print(F(" "));
  Serial.println(mag, DEC);

  delay(BNO055_SAMPLERATE_DELAY_MS);
    }
    

}
