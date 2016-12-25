"use strict";
const socket = io();
let canvas = {};
let roomCoordinates = {};
let winHeight = 0;
let statusBar = {};

window.onload = function() {
    winHeight = window.innerHeight;
    const minRadius = 5;
    const maxRadius = 50;

    statusBar = document.getElementsByClassName('status')[0];
    let wrapper = document.getElementById('heatmapContainerWrapper');

    updateStatus("Initial page loaded");

    const heatmap = h337.create({
        maxOpacity: .75,
        container: document.getElementById('heatmapContainer')
    });
    canvas = document.getElementsByTagName('canvas')[0];
    canvas.width = winHeight;
    canvas.height = winHeight;
    window.h = heatmap;

    updateStatus("Document set up. Waiting for data...");

    socket.on('locations', data => {
        updateStatus("Data received. Analyzing...");
        roomCoordinates = data[0];
        let roomInfo = data[1];
        const valExtract = Object.keys(roomInfo).map(key => {
            return roomInfo[key];
        });
        const maxStudents = Math.max.apply(null, valExtract);
        let points = [];
        for (var room in roomInfo) {
            if (roomInfo.hasOwnProperty(room)) {
                if (!roomCoordinates.hasOwnProperty(room)) {
                    console.log(`${room} does not have any coordinates`);
                }

                points.push({
                    x: Math.floor(roomCoordinates[room][0] * (winHeight + 5)),
                    y: Math.floor(roomCoordinates[room][1] * winHeight),
                    value: roomInfo[room],
                    radius: minRadius + (maxRadius - minRadius) * (roomInfo[room] / maxStudents)
                });

                let pTag = document.createElement("P");
                let innerText = document.createTextNode(room + ' - ' + roomInfo[room]);
                pTag.appendChild(innerText);

                document.getElementById("classes").appendChild(pTag);
            }
        }
        heatmap.setData({
            max: maxStudents,
            data: points
        });
        updateStatus("Document ready!");
        canvas.addEventListener("click", findClosestRoom, false);
    });
    socket.on('serverupdate', message => {
        updateStatus(message);
    });
};

function findClosestRoom(event) {
    const distances = distFormula(event.pageX / winHeight, event.pageY / winHeight);

    if (distances.length == 0) {
        document.getElementById('label').innerHTML = "Unknown";
    } else {
        let selectLocation = distances[0][0];
        let minimum = distances[0][1];
        distances.forEach(distance => {
            if (distance[1] < minimum) {
                minimum = distance[1];
                selectLocation = distance[0];
            }
        });
        document.getElementById('label').innerHTML = selectLocation;
    }
}

function distFormula(x, y) {
    let distances = [];
    const clickReach = 0.03;

    for (let room in roomCoordinates) {
        let distance = Math.hypot(roomCoordinates[room][0] - x,roomCoordinates[room][1] - y);
        if (distance < clickReach) {
            distances.push([room, distance]);
        }
    }
    return distances;
}

function updateStatus(message) {
    statusBar.innerHTML = message;
}
