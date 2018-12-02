const express = require('express');
const app = module.exports = express();

const cors = require('cors');
const compress = require('compression');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const api = require('8base-connector');

app.disable('etag');
app.set('json spaces', 2);
app.use(cors());
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/favicon.ico', express.static('./src/browser/public/icons/favicon.ico'));

app.use((req, res, next) => {
    res.header('Cache-Control', 'no-cache');
    res.on('finish', () => {
        console.log(`${req.method} ${req.path} ${res.statusCode}`);
    });
    next();
});

const DM = require('./modules/database-manager');

require('./modules/socket');

const server_port = process.env.SERVER_PORT;

app.get('/messages', (req, res) => {
    DM.getMessages(function(err, messageList){
        if (err) {
            res.status(200).send(err);
        } else {
            res.status(200).json(messageList);
        }
    });
});

app.get('/devices', (req, res) => {
    DM.getDevices(function(err, deviceList){
        if (err) {
            res.status(200).send(err);
        } else {
            res.status(200).json(deviceList);
        }
    });
});

var lastUpdate = "";

setInterval(function() {
    DM.getDevice("chris", function(err, deviceData){
        if (err) {
            res.status(200).send(err);
        } else {
            console.log(deviceData);
            if (deviceData.status == "connected") {
                var lat = Number(deviceData.lastLocation.coordinates[0]);
                var lon = Number(deviceData.lastLocation.coordinates[1]);
                var speed = Number(deviceData.lastLocation.speed);
                var altitude = Number(deviceData.lastLocation.altitude);
                var gender = deviceData.lastHealth.gender;
                var heartRate = Number(deviceData.lastHealth.heartRate);
                var stepCount = Number(deviceData.lastHealth.stepCount);
                var distance = Number(deviceData.lastHealth.distance);
                var time = String((new Date).today() + ' ' + (new Date).timeNow());

                var record = {
                    lat: lat,
                    lon: lon,
                    speed: speed,
                    altitude: altitude,
                    gender: gender,
                    heartRate: heartRate,
                    stepCount: stepCount,
                    distance: distance,
                    time: time
                }

                console.log('Sending data')
                api.createHealthDatum(record).then(data => {
                    console.log(data.healthDatumCreate.id);
                })

            }

        }
    });
}, 10 * 1000);

app.listen(server_port, () => {
    console.log(`Webserver started on port ${server_port}`);
});


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