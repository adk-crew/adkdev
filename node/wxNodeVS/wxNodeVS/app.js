


/** 
 * VS  auto generated project template -- Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs = require("fs");

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(__dirname + '/public'));
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/simpage', routes.simpage);



var socketServer = require("socket.io")();
var SerialPort = require("serialport").SerialPort;

var serialPort;
var portName = 'COM4'; //change this to your Arduino port
//var portName = "/dev/ttyUSB0";
var sendData = "";


//var port = normalizePort(process.env.PORT || '3000');
var port = 3000;

app.set('port', port);

var server = http.createServer(app);
socketServer.attach(server);



//  COMMENTED OUT SINCE WE WILL NOT BE LISTENING TO FOR THE Arduino XBee Radio on the USB port 
//  We will create a file watcher here in the next class to run as a simulator  

//serialListener();  

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

socketServer.on('connection', function (socket) {
    console.log("user connected");
    socket.emit('onconnection', { pollOneValue: sendData });
    
    socket.on('simbutton', function (receivedData) {
        console.log(receivedData);
     
        socketServer.emit('WxUpdate', receivedData);
    });
   
});


// Listen to serial port
function serialListener() {
    var receivedData = "";
    serialPort = new SerialPort(portName, {
        baudrate: 57600,
        // defaults for Arduino serial communication
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: false
    });
    
    serialPort.on("open", function () {
        console.log('open serial communication');
        // Listens to incoming data
        serialPort.on('data', function (data) {
            receivedData += data.toString();
            
            //"{Temp:%s, Hum:%s, Dew:%s}"
            
            if (receivedData.indexOf('{') >= 0 && receivedData.indexOf('}') >= 0) {
                sendData = receivedData; // .substring(receivedData .indexOf('{') + 1, receivedData .indexOf('}'));
                console.log(receivedData);
                
                //remove anything leading the 1st { 
                if (receivedData.indexOf('{') > 0) {
                    while (receivedData.length > 0 && receivedData.charAt(0) != '{')
                        receivedData = receivedData.slice(1);
                }
                
                // needs to be a object type (var) versus string data type for JSON.parse			
                var vJsonString = receivedData.replace(/'/g, '"');
                //{"Temp":%s, "Hum":%s, "Dew":%s}
                
                var vJsonObj = JSON.parse(vJsonString);
                socketServer.emit('WxUpdate', vJsonObj);
                
                WriteFile();
                
                receivedData = '';
            }
         // send the incoming data to browser with websockets.
       
        });
    });
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    
    var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;
    
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
    //debug('Listening on ' + bind);

    console.log("http server listening on http://localhost:%d", addr.port);
}


function WriteFile() {
    
    
   
}
