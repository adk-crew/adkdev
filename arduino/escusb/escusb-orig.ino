

#include <Servo.h>

#define ESC_MAX_FRWD 1900
#define ESC_MAX_REV 1100
#define ESC_STOPPED 1500

#define NUM_MOTORS 3

typedef struct motorDef
{
  Servo motor;
  int pin;
};

motorDef motors[NUM_MOTORS];


void setup() {

  motors[0].pin = 8; //was 10,11,12
  motors[1].pin = 9;
  motors[2].pin = 10;

  for(int x = 0; x < NUM_MOTORS; x++)
  {
     motors[x].motor.attach(motors[x].pin);
     motors[x].motor.writeMicroseconds(ESC_STOPPED);    //must send the stop signal on start up to arm the ESC
  }
 
  Serial.begin(9600);
  
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

            motors[motorId].motor.writeMicroseconds(thrust);
    
            
        }
        // Find the next command in input string
        command = strtok(0, ";");
    }
    

}
