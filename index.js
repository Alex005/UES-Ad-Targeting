var port = 8000;
var serverUrl = "127.0.0.1";

var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require('socket.io')(http);
var socsjs = require('socsjs');

var quarter = 'WI17';
var dept = 'ECON';
var timeout = 7500;
var undergrad = true;

app.use(express.static('./'));

app.get("/", function(req, res) {
    res.sendFile("index.html");
});

io.on('connection', function(socket) {
    locations = {};
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
                    //console.log('\nnew location:', curLocation);
                }
                if (curType == "lecture") {
                    lectureHall = curLocation;
                    //console.log('\nset lecture hall for', val['name'], ' to,', lectureHall)
                    if (curSeats > 0) {
                        locations[curLocation] += curSeats;
                        // console.log(val['name'], ' has no discussions, add', curSeats)
                    }
                }
                if (curType == "discussion") {
                    locations[curLocation] += curSeats;
                    // console.log('new discussion for', val['name'], ' at,', curLocation, ' with seats:', curSeats);
                    if (lectureHall) {
                        locations[lectureHall] += curSeats;
                        lectureSeats += curSeats;
                    }
                }
                if (curType == "final") {
                    // console.log('lecture for', val['name'], ' gets', lectureSeats, ' seats added');
                    lectureHall = null;
                    lectureSeats = 0;
                }
            });
        });
        io.emit('locations', locations);
    }).catch(function(err) {
        console.log('Error:',err);
    });
});

http.listen(port, serverUrl);
