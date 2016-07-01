var express = require('express');
var path = require('path');

//var favicon = require('serve-favicon');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var RaspiCam = require('raspicam');
var http = require('http');

var cameraOptions = {
    width       : 640,
    height      : 480,
    mode        : "timelapse",
    awb         : 'off',
    output      : 'images/camera.jpg',
    e		: 'jpg',
    ex		: 'fixedfps',
    q           : 70,
    rot         : 270,
    nopreview   : true,
    timeout     : 9999999999,
    timelapse   : 0,
    th          : "0:0:0"
};



var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use('/public', express.static(__dirname + '/public'));
app.use('/images', express.static(__dirname + '/images'));

app.use('/', routes);
app.use('/users', users);

var socketServer = require("socket.io")();
var server = http.createServer(app);
socketServer.attach(server);

//http.listen(3000, function () {
 //   console.log('listening on *:3000');
//});

server.listen(app.get('port'));
server.on('error', onError);
server.on('listening', onListening);

var camera = new RaspiCam(cameraOptions);
//camera.start();

camera.on("exit", function () {
    camera.stop();
	console.log('camera on exit');
    camera.start()
});


camera.on("read", function (err, timestamp, filename) {
    console.log('camera onread');
    socketServer.emit('liveStream', '/images/camera.jpg?_t=' + (Math.random() * 100000));
});
/*
camera.on("change", function (err, timestamp, filename) {
    console.log('camera onchange');
    socketServer.emit('liveStream', '/images/camera.png?_t=' + (Math.random() * 100000));
});
*/

var sockets = {};

/*
socketServer.on('connection', function (socket) {
    console.log("user connected");
    socket.emit('onconnection', "hello");
    
    socket.on('simbutton', function (receivedData) {
        console.log(receivedData);
        
        socketServer.emit('WxUpdate', receivedData);
    });
   
});
*/

socketServer.on('connection', function (socket) {
    
    sockets[socket.id] = socket;
    console.log("Total clients connected : ", Object.keys(sockets).length);
    socket.emit('onconnection', 'hello');
    
    if (Object.keys(sockets).length == 1) {
        camera.start();
    }
    
    socket.on('disconnect', function () {
        delete sockets[socket.id];

        console.log("disconnect client remaining connected : ", Object.keys(sockets).length);

        // no more sockets, kill the stream
        if (Object.keys(sockets).length == 0) {
            camera.stop();
        }
         
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
}

module.exports = app;
