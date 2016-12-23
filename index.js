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
    var roomInfo = {};

    socsjs.searchDepartment(quarter, dept, timeout, undergrad).then(function(departmentResults) {

        departmentResults.forEach(function(sectionsObj) {
            var lectureHall = null;
            var lectureSeats = 0;

            sectionsObj['sections'].forEach(function(section) {
                var curLocation = section.location;
                var curSeats = section.seatLimit - section.openSeats + section.waitlistSize;
                var curType = section.type;

                if (!(curLocation in roomInfo) && (curType == "lecture" || curType == "discussion")) {
                    roomInfo[curLocation] = 0;
                    winston.info('add new location: %s', curLocation);
                }
                if (curType == "lecture") {
                    lectureHall = curLocation;
                    winston.info('set classroom for %s as %s', sectionsObj['name'], lectureHall);
                    if (curSeats > 0) {
                        roomInfo[curLocation] += curSeats;
                        winston.info('%s has no discussions, add %d lecture only seats', sectionsObj['name'], curSeats);
                    }
                } else if (curType == "discussion") {
                    roomInfo[curLocation] += curSeats;
                    winston.info('new discussion for %s with %d seats at %s', sectionsObj['name'], curSeats, curLocation);
                    if (lectureHall) {
                        roomInfo[lectureHall] += curSeats;
                        lectureSeats += curSeats;
                    }
                } else if (curType == "final") {
                    lectureHall = null;
                    lectureSeats = 0;
                }
            });
        });
        delete roomInfo['TBA'];
        io.emit('locations', roomInfo);

    }).catch(function(err) {
        winston.error(err)
    });
});

http.listen(serverPort, serverUrl);
