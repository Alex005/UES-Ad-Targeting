var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require('socket.io')(http);
var socsjs = require('socsjs');
var csv = require('csv-parser');
var fs = require('fs');
var winston = require('winston');

winston.configure({
    level: 'info',
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
    winston.info('connect');
    var roomInfo = {};

    socsjs.searchDepartment(quarter, dept, timeout, undergrad).then(function(departmentResults) {

        winston.info('search deptartment');

        departmentResults.forEach(function(sectionsObj) {
            var lectureHall = null;
            var lectureSeats = 0;

            sectionsObj['sections'].forEach(function(section) {
                var curLocation = section.location;
                var curSeats = section.seatLimit - section.openSeats + section.waitlistSize;
                var curType = section.type;

                if (!(curLocation in roomInfo) && (curType == "lecture" || curType == "discussion")) {
                    roomInfo[curLocation] = 0;
                    winston.verbose('add new location: %s', curLocation);
                }
                if (curType == "lecture") {
                    lectureHall = curLocation;
                    winston.verbose('set classroom for %s as %s', sectionsObj['name'], lectureHall);
                    if (curSeats > 0) {
                        roomInfo[curLocation] += curSeats;
                        winston.verbose('%s has no discussions, add %d lecture only seats', sectionsObj['name'], curSeats);
                    }
                } else if (curType == "discussion") {
                    roomInfo[curLocation] += curSeats;
                    winston.verbose('new discussion for %s with %d seats at %s', sectionsObj['name'], curSeats, curLocation);
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
        winston.info('sections loaded, load csv');
        delete roomInfo['TBA'];

        coordinatesData = {};

        fs.createReadStream('coordinates.csv')
            .pipe(csv())
            .on('data', function(data) {
                coordinatesData[data.room] = [data.x, data.y];
            })
            .on('end', function() {
                winston.info('emit data');
                io.emit('locations', [coordinatesData, roomInfo]);
            });

    }).catch(function(err) {
        winston.error(str(err));
    });
});

http.listen(serverPort, serverUrl);
