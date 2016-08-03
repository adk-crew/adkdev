var express = require('express');
var path = require('path');
var portName = 'COM6';
//var favicon = require('serve-favicon');
//var logger = require('morgan');
//var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var http = require('http');
var SerialPort = require("serialport").SerialPort;
var usbPort;
var isUSBOpen = false;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);



app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/public', express.static(__dirname + '/public'));

//start the socket server to talk with web pages
var socketServer = require("socket.io")();
var server = http.createServer(app);
socketServer.attach(server);

//open a serial port to talk to arduino over USB
usbPort = new SerialPort(portName, {
    baudrate: 115200,
    // defaults for Arduino serial communication
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
});

usbPort.on("open", function () {
    console.log('open serial communication');
    isUSBOpen = true;
    // Listens to incoming data
    usbPort.on('data', function (data) {
        
        console.log(data.toString());
                    
    });
});

usbPort.on('error', function (err) {
    console.log(err);
});




//start listening for http requests
//!! remember with express 4 we need to comment out the socket io listen in the bin/www file
server.listen(app.get('port'));
server.on('error', onError);
server.on('listening', onListening);

var sockets = {};

socketServer.on('connection', function (socket) {
    
    sockets[socket.id] = socket;
    console.log("Total clients connected : ", Object.keys(sockets).length);
    socket.emit('onconnection', 'hello');
    
    //if (Object.keys(sockets).length == 1) {
    //    camera.start();
    //}
    
    socket.on('disconnect', function () {
        delete sockets[socket.id];       
        console.log("disconnect client remaining connected : ", Object.keys(sockets).length);
        
        // no more sockets, kill the stream
       // if (Object.keys(sockets).length == 0) {
        //    camera.stop();
       // }
         
    });
    
    socket.on('onSimDepth', function (val) {
            
        console.log("onSimDepth depth=%d", val.Depth);
        socketServer.emit('onDepth', val);
    });
    
    
    socket.on('onJoystick', function (val) {
              
     ///   console.log("onJoystick LHT=%d, RHT=%d, LVT=%d, RVT=%d", val.LHT, val.RHT, val.LVT, val.RVT);
        var sCmd = String.format("0={0};1={1};2={2};3={3};4={4}\n", val.LHT, val.RHT, val.LVT, val.RVT,val.CamPos);
        console.log(sCmd);
        if(isUSBOpen)
            usbPort.write(sCmd);

    });
    
    
 
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


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


module.exports = app;
