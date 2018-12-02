const DM = require('./database-manager');
const app = require('../server');

const device_socket_port = process.env.DEVICE_SOCKET_PORT;
const dashboard_socket_port = process.env.DASHBOARD_SOCKET_PORT;

var client_server = require('http').createServer(app);
var clients = require('socket.io')(client_server);

var dashboard_server = require('http').createServer(app);
var dashboard = require('socket.io')(dashboard_server);

clients.use(function(socket, next) {
    var clientName = socket.handshake.query.deviceName;
    if (!!clientName) {
        socket.clientName = clientName;
        next();
    } else {
        console.log('Unrecognized client attempting interaction');
        socket.send('error', 'Device name not specified');
        socket.disconnect();
    }
});

/* SOCKET ON CONNECT */
clients.on('connection', function(socket) {
    var clientName = socket.clientName;

    DM.getDevice(clientName, function(err, device){
        if (err) {
            socket.send('error', err);
        } else {
            if (!!device) {
                if (device.status == 'connected') {
                    socket.send('error', 'name-in-use');
                    socket.disconnect();
                } else {
                    var updatedValues = {
                        status: 'connected',
                        lastUpdate: String((new Date).today() + ' ' + (new Date).timeNow())
                    }
                    DM.updateDevice(clientName, updatedValues, function(err, device){
                        if (err) {
                            socket.send('error', err);
                        } else {
                            clients.emit('deviceAdded', clientName);
                            console.log('Existing client connected (' + clientName + ')');
                        }
                    });
                }
            } else {
                var deviceData = {
                    name: clientName,
                    status: 'connected',
                    lastUpdate: String((new Date).today() + ' ' + (new Date).timeNow())
                }
                DM.saveDevice(deviceData, function(err, response){
                    if (err) {
                        socket.send('error', err);
                    } else {
                        clients.emit('deviceAdded', clientName);
                        console.log('New client connected (' + clientName + ')');
                    }
                });
            }
        }
    });
    
    /* SOCKET RECEIVED TEST DATA */
    socket.on('locationData', function(data){
        var messageData = {
            device: clientName,
            time: String((new Date).today() + ' ' + (new Date).timeNow()),
            data: data
        }
        DM.saveLocation(messageData, function(err, response){
            if (err) {
                console.log('Location data error from ' + clientName + ': ' + err);
                socket.send('error', err);
            } else {
                console.log('Location data received from ' + clientName + ': ' + data);
                socket.send('location', { echo: data});
                //socket.send('error', true);
                //socket.send('error', 'test error');
            }
        });
    });

    socket.on('healthData', function(data){
        var messageData = {
            device: clientName,
            time: String((new Date).today() + ' ' + (new Date).timeNow()),
            data: data
        }
        DM.saveHealth(messageData, function(err, response){
            if (err) {
                console.log('Health data error from ' + clientName + ': ' + err);
                console.log(data)
                socket.send('error', err);
            } else {
                console.log('Health data received from ' + clientName + ': ' + data);
                socket.send('data', { health: data});
            }
        });
    });

    /* SOCKET RECEIVED DATA */
    socket.on('data', function(data) {
        console.log('Data received: ' + data);
    });

    /* SOCKET DISCONNECT */
    socket.on('disconnect', function(){
        var updatedValues = {
            status: 'disconnected',
            lastUpdate: String((new Date).today() + ' ' + (new Date).timeNow())
        }
        DM.updateDevice(clientName, updatedValues, function(err, device){
            clients.emit('deviceRemoved', clientName);
            if (err) {
                socket.send('error', err);
            } else {
                console.log('Client disconnected (' + clientName + ')');
            }
        });
    });
});

client_server.listen(device_socket_port);
//host_server.listen(host_socket_port);


Date.prototype.today = function() {
    return (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "/" + ((this.getDate() < 10) ? "0" : "") + this.getDate() + "/" + this.getFullYear();
}

Date.prototype.timeNow = function() {
    var currentHour = Number(((this.getHours() < 10) ? "0" : "") + this.getHours());
    var ampm = 'AM';
    if (currentHour > 12) {
        currentHour = currentHour - 12;
        ampm = 'PM';
    }
    return currentHour + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds() + ' ' + ampm;
}