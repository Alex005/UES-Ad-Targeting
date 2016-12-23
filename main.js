var roomCoordinates = {
    'APM 2301': [148, 476],
    'CENTR 101': [252, 531],
    'CENTR 105': [250, 519],
    'CENTR 109': [250, 518],
    'CENTR 113': [256, 509],
    'CENTR 115': [250, 519],
    'CENTR 119': [260, 509],
    'CENTR 214': [257, 509],
    'CENTR 216': [257, 509],
    'CENTR 222': [251, 517],
    'CSB 001': [189, 429],
    'CSB 002': [187, 431],
    'CSB 005': [198, 432],
    'HSS 1330': [129, 497],
    'LEDDN AUD': [131, 485],
    'MANDE B-210': [189, 516],
    'PCYNH 106': [340, 504],
    'PCYNH 109': [340, 505],
    'PCYNH 121': [341, 503],
    'PCYNH 122': [342, 502],
    'PETER 102': [171, 445],
    'PETER 103': [172, 445],
    'PETER 104': [172, 445],
    'PETER 110': [167, 447],
    'RBC AUD': [154, 304],
    'SEQUO 147': [149, 387],
    'SEQUO 244': [149, 386],
    'SOLIS 104': [186, 414],
    'SOLIS 107': [186, 414],
    'TM102 1': [197, 402],
    'WLH 2001': [332, 424],
    'WLH 2005': [329, 426],
    'WLH 2114': [331, 426],
    'WLH 2204': [333, 425]
}

var gradient = ['#dc143c', '#e9613b', '#f39237', '#fabe2e', '#feea1b', '#e6f100', '#b5d400', '#85b800', '#529c00', '#008000'];
var minRadius = 8;
var maxRadius = 28;
var mapAlpha = 0.4;
var socket = io();

map = document.getElementById('map');
canvas = document.getElementById('canv');
canvas.height = map.height;
canvas.width = map.height;
var context = canvas.getContext('2d');
context.globalAlpha = mapAlpha;

var maxStudents = 0;

socket.on('locations', function(roomInfo) {
    var valExtract = Object.keys(roomInfo).map(function(key) {
        return roomInfo[key];
    });
    listRoomInfo(roomInfo, Math.max.apply(null, valExtract));
    canvas.addEventListener("click", findClosestRoom, false);
});

function listRoomInfo(roomInfo, maxStudents) {
    for (var room in roomInfo) {
        if (roomInfo.hasOwnProperty(room)) {
            if (!roomCoordinates.hasOwnProperty(room)) {
                console.log(room + ' does not have any coordinates');
            }
            var radiusRatio = roomInfo[room] / maxStudents;
            var radius = minRadius + (radiusRatio * (maxRadius - minRadius));
            var x = toScale(roomCoordinates[room][0] - 5);
            var y = toScale(roomCoordinates[room][1] - 15);
            var color = gradient[Math.round(radiusRatio * gradient.length) - 1];

            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI, false);
            context.fillStyle = color;
            context.fill();

            var pTag = document.createElement("P");
            var innerText = document.createTextNode(room + ' - ' + roomInfo[room]);
            pTag.appendChild(innerText);

            document.getElementById("classes").appendChild(pTag);
        }
    }
}

function findClosestRoom(event) {
    var distances = distFormula(event.clientX, event.clientY);

    if (distances.length == 0) {
        document.getElementById('label').innerHTML = "Unknown";
    } else {
        var selectLocation = distances[0][0];
        var minimum = distances[0][1];
        distances.forEach(function(distance) {
            if (distance[1] < minimum) {
                minimum = distance[1];
                selectLocation = distance[0];
            }
        });
        document.getElementById('label').innerHTML = selectLocation;
    }
}

function distFormula(x, y) {
    var distances = [];
    var clickReach = 750;

    for (var room in roomCoordinates) {
        var rawDistance = Math.pow((roomCoordinates[room][0] - x), 2) + Math.pow((roomCoordinates[room][1] - y), 2);
        if (rawDistance < clickReach) {
            distances.push([room, rawDistance]);
        }
    }
    return distances;
}

function toScale(num) {
    return num / 775 * map.width;
}
