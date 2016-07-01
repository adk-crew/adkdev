

import serial
import pygame
import time

#serialPort = dev/ttyUSBO
serialPort = '/dev/ttyS0'
#serialPort = 'COM9'      # Arduino Uno
baudRate = 4800


sNeutral = 'LHT=1500;RHT=1500;LVT=1500;RVT=1500\n'



pygame.init()
#joystick.init()
j = pygame.joystick.Joystick(0)
j.init()
print ('Initialized Joystick : %s' )% j.get_name()
print (sNeutral)
   
ser = serial.Serial(serialPort, baudRate)
ser.write(sNeutral)

# Keeps a history of buttons pressed so that one press does
# not send multiple presses to the Arduino Board
button_history = [0,0,0,0,0,0,0,0,0,0,0,0]
jspos_history = [0,0,0,0]

#left joystick
#axis 0 = x, full left =-1
#axis 1 = y, full up  =-1

#axis 2 = not used

#right joystick
#axis 3 = y, full up = -1
#axis 4 = x, full left =-1

try:
    while True:
        pygame.event.pump()
        lx = j.get_axis(0)
        ly = j.get_axis(1)
        ry = j.get_axis(2)
        rx = j.get_axis(3)
        if jspos_history == [lx,ly,rx,ry]: continue
        
        jspos_history = [lx,ly,rx,ry]

        #print ('lx = %f') % lx
        #print ('ly = %f') % ly
        #print ('rx = %f') % rx
        #print ('ry = %f') % ry

        LHT = RHT = 1500

        if ly !=  0:
            ly = ly * -1 #invert y to move forward when pushing up
            LHT = RHT = ly * 400 + 1500
      

        if lx != 0:  #we are turning take some thrust away from one thruster and add to the other
            RHT = RHT - lx * 200
            LHT = LHT + lx * 200
        #elif lx < 0:
        #    LHT = LHT + lx * 400

        LHT = int(LHT)
        RHT = int(RHT)

        if LHT > 1900: LHT = 1900
        elif LHT < 1100: LHT = 1100

        if RHT > 1900: RHT = 1900
        elif RHT < 1100: RHT = 1100
        
        #print ('Left Horizontal Thruster = %i') % LHT
        #print ('Right Horizontal Thruster = %i') % RHT

        ry = ry * -1 #invert y to move up when pushing up

        LVT = RVT = ry * 400 + 1500

        if rx > 0:  
            RVT = RVT - rx * 400
        elif rx < 0:
            LVT = LVT + rx * 400

        LVT = int(LVT)
        RVT = int(RVT)

        if LVT > 1900: LVT = 1900
        elif LVT < 1100: LVT = 1100

        if RVT > 1900: RVT = 1900
        elif RVT < 1100: RVT = 1100
        
        #print ('Left Horizontal Thruster = %i') % LHT
        #print ('Right Horizontal Thruster = %i') % RHT

        sCmd = 'LHT=%i;RHT=%i;LVT=%i;RVT=%i\n' % (LHT, RHT, LVT, RVT)

        print (sCmd)
        
        ser.write(sCmd)
        
        time.sleep(0.5)


except KeyboardInterrupt:
    j.quit()
