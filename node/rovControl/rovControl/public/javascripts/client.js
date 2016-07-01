


/*
 * screen res of our daylight monitor is 1024 X 600
 * 
*/

var socket = io();
var streamURL = "ws://192.170.167.214:8084";
var vidX = 640;
var vidY = 480
var repGP;
var xLStick = 0;
var yLStick = 0;
var xRStick = 0;
var yRStick = 0;
var sLastCmd


var jsonDataIn = {
    "Temp": 0,
    "Depth": 0,
    "Heading": 0,
};

var jsonDataOut = {
    "LHT": 0,
    "RHT": 0,
    "LVT": 0,
    "RVT": 0
};

$(document).ready(function () {
   
    //set up canvas for streaming video from pystreaming server
    var canvas = document.getElementById('videoCanvas');
    var client = new WebSocket(streamURL);
    var player = new jsmpeg(client, { canvas:canvas });
    
    //set up canvas for a default image
    var context = canvas.getContext('2d');
    context.fillStyle = "#0000FF";
    context.fillRect(0, 0, vidX, vidY);
    
    var imageObj = new Image();
    imageObj.onload = function () {    
        context.drawImage(imageObj, 0, 0, vidX, vidY);
    };
    imageObj.src = document.URL + 'public/images/uwfishworld.jpg';
    
    
    //open a socket back to our web server 
    socket = io.connect();
    socket.on('onconnection', function (value) {
	    //alert("connected");
    });
    
    /*
     * used on a img tag when pi came in capture mode (see picam project)
    socket.on('liveStream', function (url) {
        $('#stream').attr('src', url);
    });
     */
    

    $(window).on("gamepadconnected", function () {
        $("#statusbar").text("gamepad connected");
        repGP = window.setInterval(pollGamepad, 500);
    });
    
    $(window).on("gamepaddisconnected", function () {
        $("#statusbar").text("gamepad disconnected");
        window.clearInterval(repGP);
    });

    client.onerror = function (error) {
        
        $("#statusbar").text("no streaming video detected at: " + streamURL);
        console.log(error);
       
    };
});



function pollGamepad() {
    /* 
   
     left joystick
        axis 0 = x, full left =-1
        axis 1 = y, full up  =-1
     right joystick
        axis 2 = x, full left =-1
        axis 3 = y, full up = -1

    */
    var gp = navigator.getGamepads()[0];
    var html = "";
    html += "id: " + gp.id + "<br/>";
    
    for (var i = 0; i < gp.buttons.length; i++) {
        
        if (gp.buttons[i].pressed) {
            html += "Button " + (i + 1) + ": pressed";
            html += "<br/>";
        } 
    }
    
  //  if (xLStick == gp.axes[0] && yLStick == gp.axes[1] && xRStick == gp.axes[2] && yRStick == gp.axes[3]) {
  //      return;
  //  }
        
    
    xLStick = gp.axes[0];
    yLStick = gp.axes[1];
    xRStick = gp.axes[2];
    yRStick = gp.axes[3];
    
    //left and right horizontal thrusters
    var LHT = RHT = 1500;
    
    //invert y to move forward when pushing up
    if (yLStick != 0) {
        yLStick *= -1;
    }
    
    LHT = RHT = yLStick * 400 + 1500;
    
    //if we are turning take some thrust away from one thruster and add to the other
    if (xLStick != 0) {
        RHT = RHT - xLStick * 200;
        LHT = LHT + xLStick * 200;
    } 

    LHT = Math.ceil(LHT);
    RHT = Math.ceil(RHT);

    if (LHT > 1900) LHT = 1900;
    else if (LHT < 1100) LHT = 1100;
    
    if (RHT > 1900) RHT = 1900;
    else if (RHT < 1100) RHT = 1100;

    
    //invert y to move up when pushing up
    if (yRStick != 0) {
        yRStick *= -1;
    }

    //left and right vertical thrusters
    var LVT = RVT = yRStick * 400 + 1500;

    if (xRStick > 0)
        RVT = RVT - xRStick * 400;
    else if (xRStick < 0)
        LVT = LVT + xRStick * 400;

    LVT = Math.ceil(LVT);
    RVT = Math.ceil(RVT);

    if (LVT > 1900) LVT = 1900;
    else if (LVT < 1100) LVT = 1100;
    
    if (RVT > 1900) RVT = 1900;
    else if (RVT < 1100) RVT = 1100;
    
   // var sCmd = "LHT=" + LHT + "LVT=" + LVT;
    //html += "Stick " + yLStick+ ": " + LHT + "<br/>";
    var sCmd = String.format("LHT={0};RHT={1};LVT={2};RVT={3}\n", LHT, RHT, LVT, RVT);
    //sCmd.format("LHT={0}\n", LHT);
    
    if (jsonDataOut.LHT == LHT && jsonDataOut.RHT == RHT && jsonDataOut.LVT == LVT && jsonDataOut.RVT == RVT)
        return;
    

    jsonDataOut.LHT = LHT;
    jsonDataOut.RHT = RHT;
    jsonDataOut.LVT = LVT;
    jsonDataOut.RVT = RVT;


    //$("#statusbar").html(sCmd);
    $("#statusbar").text(sCmd);
    socket.emit('joystickChange', jsonDataOut);
}

if (!String.format) {
    String.format = function (format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
        ? args[number] 
        : match
            ;
        });
    };
}

