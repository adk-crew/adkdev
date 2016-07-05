

#include <Servo.h>
#include <SoftwareSerial.h>

//#define ESC_MAX_FRWD 1900
//#define ESC_MAX_REV 1100

#define ESC_MAX_FRWD 2000
#define ESC_MAX_REV 1000

#define ESC_STOPPED 1500

#define NUM_MOTORS 2


#define SSerialRX        5 ///10  //Serial Receive pin
#define SSerialTX        4 //11  //Serial Transmit pin

#define SSerialTxControl 3   //RS485 Direction control
#define RS485Transmit    HIGH
#define RS485Receive     LOW

typedef struct motorDef
{
  Servo motor;
  int pin;
};

motorDef motors[NUM_MOTORS];
SoftwareSerial RS485Serial(SSerialRX, SSerialTX); // RX, TX

int byteReceived;
int byteSend;
char input[100];
  int inIndex = 0;
  
void setup() {

  motors[0].pin = 6;
  motors[1].pin = 7;
  //motors[2].pin = 12;

  for(int x = 0; x < NUM_MOTORS; x++)
  {
     motors[x].motor.attach(motors[x].pin);
     motors[x].motor.writeMicroseconds(ESC_STOPPED);    //must send the stop signal on start up to arm the ESC
  }
 
  Serial.begin(9600);

  pinMode(SSerialTxControl, OUTPUT);  
  digitalWrite(SSerialTxControl, RS485Receive);  // Init Transceiver
  RS485Serial.begin(9600); 

  Serial.println("listening");
  
}

void loop() {
  
  /*
   while (!Serial.available())
   {
  
    }

    */

    while (RS485Serial.available())
   {

    input[inIndex] = RS485Serial.read();
    if(inIndex == 0 && input[inIndex] != '0')
    {
      continue;
    }
    
    if ((input[inIndex] == '\n') || (input[inIndex] == '\r')) {
        input[inIndex] = 0;
        inIndex = 0;
        Serial.println(input);
        writeMotors(input);

       // digitalWrite(SSerialTxControl, RS485Transmit);  // Enable RS485 Transmit    
       // RS485Serial.write("ok"); // Send the byte back
       // delay(10);   
       // digitalWrite(SSerialTxControl, RS485Receive);  // Disable RS485 Transmit   
    
        break;
     }
      inIndex++;
    }
  
    char input[50];
    byte size = Serial.readBytes(input, 50);
    //add terminator 0 to end the C string
    input[size] = 0;

}

void writeMotors(char* input)
{
// Read each command pair from terminal input string in the format motorIndex=speed (0=1500;1=1600;2=1500)
    
    Serial.println("write motors");
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

