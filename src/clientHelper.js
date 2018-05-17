var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require('path');
var mqtt = require('mqtt');

export function connect(deviceName, token) {
  return new Promise((resolve, reject) => {
    try {
      var client = mqtt.connect({
        host: 'localhost',
        port: process.env.BROKER_PORT,
        protocol: 'mqtts',
        key: fs.readFileSync(path.join(__dirname, process.env.TLS_KEY_FILE)),
        cert: fs.readFileSync(path.join(__dirname, process.env.TLS_CERT_FILE)),
        ca: fs.readFileSync(path.join(__dirname, process.env.CA_CERT_FILE)),
        username: 'JWT',
        password: token,
        rejectUnauthorized: false,
        clientId: `${deviceName}_${Math.random().toString(16).substr(2, 8)}`
      });
      client.on('connect', function () {
        resolve(client);
      });
      client.on('error', function (err) {
        logError('Publisher error', err);
        reject(err);
      });
    }
    catch (err) {
      reject(err);
    }
  })
}

export function subscribe(client, topic) {
  return new Promise((resolve, reject) => {
    client.subscribe(topic);

    client.on('message', function (t, payload) {
      if (topic === t) {
        var p = JSON.parse(payload.toString());
        resolve(p)
      }
    });
  });
}

export function getHandlerToken() {
  return jwt.sign({
    handler: {
      name: 'test_handler3r',
      ip: "1.2.3.4",
    }
  }, process.env.JWT_SECRET);
}