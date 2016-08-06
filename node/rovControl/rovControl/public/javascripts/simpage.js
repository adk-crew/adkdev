var jsonData = {
    "Depth": 0,
    "Temp": 0,
    "Pitch": 0,
    "Roll": 0,
    "Heading": 0 
};

var repGP;
var nStickY = 0;

function canGame() {
    return "getGamepads" in navigator;
}


function reportOnGamepad() {
    var gp = navigator.getGamepads()[0];
    var html = "";
    html += "id: " + gp.id + "<br/>";
    
    for (var i = 0; i < gp.buttons.length; i++) {
        html += "Button " + (i + 1) + ": ";
        if (gp.buttons[i].pressed) html += " pressed";
        html += "<br/>";
    }
    
    /*
    for (var i = 0; i < gp.axes.length; i += 2) {
        html += "Stick " + (Math.ceil(i / 2) + 1) + ": " + gp.axes[i] + "," + gp.axes[i + 1] + "<br/>";
    }
     */

    var nVal = Math.ceil((gp.axes[1] * 100) + 50);

  //  if (nStickY == nVal) {
 //       return;
 //   }
            
    nStickY = nVal;
    html += nStickY;
 
    jsonData.Temp = nStickY;
    socket.emit('simbutton', jsonData);
    
    $("#gamepadPrompt").html(html);
}

$(document).ready(function () {

    socket = io.connect();
    socket.on('onconnection', function (value) {
		//alert("connected");
    });
  
    

    $('#inputDepthSlider').change(function () {
        
        jsonData.Temp = nStickY;  //for now to debug value needs to change to temp
        jsonData.Depth = $("#inputDepthSlider").val();
        jsonData.Pitch = $("#inputPitchSlider").val();
        jsonData.Roll = $("#inputRollSlider").val();

        socket.emit('onSimDepth', jsonData);

    });
    
    $('#inputRollSlider').change(function () {
        
        jsonData.Temp = nStickY;  //for now to debug value needs to change to temp
        jsonData.Depth = $("#inputDepthSlider").val();
        jsonData.Pitch = $("#inputPitchSlider").val();
        jsonData.Roll = $("#inputRollSlider").val();
        
        socket.emit('onAttitude', jsonData);

    });
    
    $('#inputPitchSlider').change(function () {
        
        jsonData.Temp = nStickY;  //for now to debug value needs to change to temp
        jsonData.Depth = $("#inputDepthSlider").val();
        jsonData.Pitch = $("#inputPitchSlider").val();
        jsonData.Roll = $("#inputRollSlider").val();
        
        socket.emit('onAttitude', jsonData);

    });
	 

    if (canGame()) {
        
        var prompt = "To begin using your gamepad, connect it and press any button!";
        $("#gamepadPrompt").text(prompt);
        
        $(window).on("gamepadconnected", function () {
            $("#gamepadPrompt").html("Gamepad connected!");
            console.log("connection event");
            repGP = window.setInterval(reportOnGamepad, 500);
        });
        
        $(window).on("gamepaddisconnected", function () {
            console.log("disconnection event");
            $("#gamepadPrompt").text(prompt);
            window.clearInterval(repGP);
        });
    }
});
