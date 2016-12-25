"use strict";
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require('socket.io')(http);
const socsjs = require('socsjs');
const csv = require('csv-parser');
const fs = require('fs');
const winston = require('winston');

winston.configure({
    level: 'error',
    transports: [
        new(winston.transports.File)({
            filename: 'UESAT_logs.log'
        })
    ]
});

const serverPort = 8000;
const serverUrl = "127.0.0.1";

const quarter = 'WI17';
const dept = 'ECON';
const timeout = 5000;

app.use(express.static('./'));

app.get("/", (req, res) => {
    res.sendFile("index.html");
});
io.on('connection', socket => {
    winston.info('connect');
    let roomInfo = {};

    socsjs.searchDepartment(quarter, dept, timeout, true).then(departmentResults => {

        winston.info('search deptartment');

        departmentResults.forEach(sectionsObj => {
            let lectureHall = null;
            let lectureSeats = 0;

            sectionsObj.sections.forEach(section => {
                let curLocation = section.location;
                let curSeats = section.seatLimit - section.openSeats + section.waitlistSize;
                let curType = section.type;

                if (!(curLocation in roomInfo) && (curType == "lecture" || curType == "discussion")) {
                    roomInfo[curLocation] = 0;
                    winston.verbose(`add new location: ${curLocation}`);
                }
                if (curType == "lecture") {
                    lectureHall = curLocation;
                    winston.verbose(`set classroom for ${sectionsObj.name} as ${lectureHall}`);
                    if (curSeats > 0) {
                        roomInfo[curLocation] += curSeats;
                        winston.verbose(`${sectionsObj.name} has no discussions, add ${curSeats} lecture only seats`);
                    }
                } else if (curType == "discussion") {
                    roomInfo[curLocation] += curSeats;
                    winston.verbose(`new discussion for ${sectionsObj.name} with ${curSeats} seats at ${curLocation}`)
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

        let coordinatesData = {};

        fs.createReadStream('coordinates.csv')
            .pipe(csv())
            .on('data', data => {
                coordinatesData[data.room] = [data.x, data.y];
            })
            .on('end', () => {
                winston.info('emit data');
                io.emit('locations', [coordinatesData, roomInfo]);
            });

    }).catch(error => {
        winston.error(`socjs error: ${error}`);
        io.emit('serverupdate', 'socjs error. Try again.');
    });
});

http.listen(serverPort, serverUrl, error => {
  if (error) {
    winston.error(`connection error: ${error}`);
  }
});
