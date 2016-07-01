/**
 * New node file
 */


var socket = io();


$(document).ready(function () {
    
   
    socket = io.connect();
    socket.on('onconnection', function (value) {
	    //alert("connected");
    });
    socket.on('liveStream', function (url) {
        $('#stream').attr('src', url);
    });
    

});



