const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

let deviceCollection;
let messageCollection;

if (!process.env.DATABASE_URL) {
    log('Missing environmental variable: "DATABASE_URL"!');
    process.exit(1);
}

MongoClient.connect(process.env.DATABASE_URL, {useNewUrlParser: true}).then(client => {
    var db = client.db('server-app-bridge');
    console.log('Database connected to ' + process.env.DATABASE_URL);
    deviceCollection = db.collection('devices');
    messageCollection = db.collection('messages');
    
    //set all statuses to disconnected on startup
    deviceCollection.updateMany({}, { $set: {status: 'disconnected'} }, function (err) {
        if (err) {
            console.log(err);
        }
    });

}).catch(err => {
    console.log('Error connecting to database:');
    console.log(err);
    process.exit(1);
});

function formatEpoch(epoch) {
    var date = String(new Date(parseInt(epoch)));
    date = date.substring(3, date.indexOf('GMT')-4);
    return(date)
}

function arrayContains(needle, arrhaystack) {
    return (arrhaystack.indexOf(needle) > -1);
}

/***************************************************** GET DATA *****************************************************/


exports.getDevices = (callback) => {
    deviceCollection.find({}, {}).toArray((err, res) => {
        if (err) {
            return callback('database-error');
        }
    
        return callback(null, res)
    });
}

exports.getDevice = (name, callback) => {
    deviceCollection.findOne({ 'name': name }, (err, obj) => {
        if (err) {
            return callback('database-error');
        }
    
        return callback(null, obj)
    });
}

exports.getMessages = (callback) => {
    messageCollection.find({}, {}).toArray((err, res) => {
        if (err) {
            return callback('database-error');
        }
    
        return callback(null, res)
    });
}

/**************************************************** SAVE DATA *****************************************************/

exports.saveDevice = (data, callback) => {
    deviceCollection.insertOne(data, {safe: true}, function(err, docsInserted){
        if (err) {
            return callback('database-error');
        }
            
        return callback(null, docsInserted.ops[0]._id)
    });
}

exports.updateDevice = (deviceName, updatedValues, callback) => {
    deviceCollection.findOneAndUpdate({ 'name': deviceName }, { $set: updatedValues }, { safe: true, upsert: true }, function (err, obj) {
        if (err) {
            return callback('database-error');
        }

        if(!!obj.value) {
            //called if an object is updated
            return callback(null, {session_id: String(obj.value._id)});
        } else {
            //called if an new object is added
            return callback(null, {session_id: String(obj.lastErrorObject.upserted)});
        }
    });
}

exports.saveLocation = (messageData, callback) => {
    if (typeof messageData.data == "string") {
        try {
            messageData.data = JSON.parse(messageData.data);
        } catch(e) {
            return callback('invalid-json');
        }
    }

    var formattedMessage = {};

    if (!!messageData.device) {
        formattedMessage.device = messageData.device;
    } else {
        return callback('missing-name');
    }

    if (!!messageData.time) {
        formattedMessage.time = messageData.time;
    } else {
        return callback('missing-time');
    }

    var updatedValues = {
        lastUpdate: messageData.time,
        status: 'connected'
    }

    if (!!messageData.data.lat && !!messageData.data.long) {
        formattedMessage.coordinates = [Number(messageData.data.lat), Number(messageData.data.long)];

        updatedValues = {
            lastLocation: {
                coordinates: [Number(messageData.data.lat), Number(messageData.data.long)],
                time: messageData.time
            },
            lastUpdate: messageData.time,
            status: 'connected'
        }

        if (!!messageData.data.speed) {
            var speed = Number(messageData.data.speed);
            if (speed < 0) {
                speed = 0;
            }
            updatedValues.lastLocation.speed = speed;
            formattedMessage.speed = speed;
        }

        if (!!messageData.data.altitude) {
            updatedValues.lastLocation.altitude = Number(messageData.data.altitude);
            formattedMessage.altitude = Number(messageData.data.altitude);
        }

    }

    // if (!!messageData.data.data) {
    //     formattedMessage.data = messageData.data.data;
    // }

    messageCollection.insertOne(formattedMessage, {safe: true}, function(err, docsInserted){
        if (err) {
            return callback('database-error');
        }

        deviceCollection.findOneAndUpdate({ 'name': messageData.device }, { $set: updatedValues }, { safe: true, upsert: false }, function (err, obj) {
            if (err) {
                return callback('database-error');
            }
    
            return callback(null, docsInserted.ops[0]._id)
        });
    });
}

exports.saveHealth = (messageData, callback) => {
    if (typeof messageData.data == "string") {
        try {
            messageData.data = JSON.parse(messageData.data);
        } catch(e) {
            return callback('invalid-json');
        }
    }

    var formattedMessage = {};

    if (!!messageData.device) {
        formattedMessage.device = messageData.device;
    } else {
        return callback('missing-name');
    }

    if (!!messageData.time) {
        formattedMessage.time = messageData.time;
    } else {
        return callback('missing-time');
    }

    var updatedValues = {
        lastUpdate: messageData.time,
        status: 'connected'
    }

    if (!!messageData.data.gender) {
        formattedMessage.gender = messageData.data.gender;
        updatedValues = {
            lastHealth: {
                gender: messageData.data.gender,
                time: messageData.time
            },
            lastUpdate: messageData.time,
            status: 'connected'
        }
    } else {
        updatedValues = {
            lastHealth: {
                gender: messageData.data.gender,
                time: messageData.time
            },
            lastUpdate: messageData.time,
            status: 'connected'
        }
    }

    if (!!messageData.data.heartRate) {
        updatedValues.lastHealth.heartRate = Number(messageData.data.heartRate);
        formattedMessage.heartRate = Number(messageData.data.heartRate);
    }

    if (!!messageData.data.stepCount) {
        updatedValues.lastHealth.stepCount = Number(messageData.data.stepCount);
        formattedMessage.stepCount = Number(messageData.data.stepCount);
    }

    if (!!messageData.data.distance) {
        updatedValues.lastHealth.distance = Number(messageData.data.distance);
        formattedMessage.distance = Number(messageData.data.distance);
    }

    messageCollection.insertOne(formattedMessage, {safe: true}, function(err, docsInserted){
        if (err) {
            return callback('database-error');
        }

        deviceCollection.findOneAndUpdate({ 'name': messageData.device }, { $set: updatedValues }, { safe: true, upsert: false }, function (err, obj) {
            if (err) {
                return callback('database-error');
            }
    
            return callback(null, docsInserted.ops[0]._id)
        });
    });
}

/*

//Update by ID
var newvalues = { $set: {name: name, ip: ip, mac: mac} };
collection.updateOne({ '_id': new ObjectId(id) }, newvalues, {safe: true}, function (err, obj) {
    if (err) {
        console.log(err);
        return callback('database-error');
    }

    return callback(null, obj);
});

//Insert new data
collection.insert(data, {safe: true}, function(err, docsInserted){
    if (err) {
        console.log(err);
        return callback('database-error');
    }
        
    return callback(null, docsInserted.ops[0]._id)
});

//Find all
collection.find({}, {}).toArray((err, res) => {
    if (err) {
        console.log(err);
        return callback(err);
    }

    callback(null, res)
});

//Find by ID
collection.findOne({ '_id': new ObjectId(id) }, (err, obj) => {
    if (err) {
        console.log(err);
        return callback(err);
    }
        
    return callback(null, obj);
});

//Remove by ID
collection.remove({ '_id': new ObjectId(id) }, {safe: true}, function (err, obj) {
    if (err) {
        console.log(err);
        return callback('database-error');
    }

    return callback(null);
});

*/



