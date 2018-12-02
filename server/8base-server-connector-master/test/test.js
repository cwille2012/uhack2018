const api = require('../');
api.listHealthData().then(data => {
    console.log(JSON.stringify(data, null, ' '));
});