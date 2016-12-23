var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require('socket.io')(http);
var socsjs = require('socsjs');
var winston = require('winston');

winston.configure({
    level: 'error',
    transports: [
        new(winston.transports.File)({
            filename: 'UESAT_logs.log'
        })
    ]
});

var serverPort = 8000;
var serverUrl = "127.0.0.1";

var quarter = 'WI17';
var dept = 'ECON';
var timeout = 7500;
var undergrad = true;

app.use(express.static('./'));

app.get("/", function(req, res) {
    res.sendFile("index.html");
});

io.on('connection', function(socket) {
    var locations = {};

    socsjs.searchDepartment(quarter, dept, timeout, undergrad).then(function(result) {

        result.forEach(function(val) {
            var lectureHall = null;
            var lectureSeats = 0;

            val['sections'].forEach(function(section, index) {
                var curLocation = section.location;
                var curSeats = section.seatLimit - section.openSeats + section.waitlistSize;
                var curType = section.type;

                if (!(curLocation in locations) && (curType == "lecture" || curType == "discussion")) {
                    locations[curLocation] = 0;
                    winston.info('add new location: %s', curLocation);
                }
                if (curType == "lecture") {
                    lectureHall = curLocation;
                    winston.info('set classroom for %s as %s', val['name'], lectureHall);
                    if (curSeats > 0) {
                        locations[curLocation] += curSeats;
                        winston.info('%s has no discussions, add %d lecture only seats', val['name'], curSeats);
                    }
                } else if (curType == "discussion") {
                    locations[curLocation] += curSeats;
                    winston.info('new discussion for %s with %d seats at %s', val['name'], curSeats, curLocation);
                    if (lectureHall) {
                        locations[lectureHall] += curSeats;
                        lectureSeats += curSeats;
                    }
                } else if (curType == "final") {
                    lectureHall = null;
                    lectureSeats = 0;
                }
            });
        });
        io.emit('locations', locations);

    }).catch(function(err) {
        winston.error(err)
    });
});

http.listen(serverPort, serverUrl);
