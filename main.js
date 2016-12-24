var socket = io();
var canvas = {};
var roomCoordinates = {};

window.onload = function() {
    var winHeight = window.innerHeight;
    var minRadius = 5;
    var maxRadius = 50;

    wrapper = document.getElementById('heatmapContainerWrapper');

    var heatmap = h337.create({
        maxOpacity: .75,
        container: document.getElementById('heatmapContainer')
    });
    canvas = document.getElementsByTagName('canvas')[0];
    canvas.width = winHeight;
    canvas.height = winHeight;
    window.h = heatmap;

    socket.on('locations', function(data) {
      roomCoordinates = data[0];
      var roomInfo = data[1];
        var valExtract = Object.keys(roomInfo).map(function(key) {
            return roomInfo[key];
        });
        var maxStudents = Math.max.apply(null, valExtract);
        points = [];
        for (var room in roomInfo) {
            if (roomInfo.hasOwnProperty(room)) {
                if (!roomCoordinates.hasOwnProperty(room)) {
                    console.log(room + ' does not have any coordinates');
                }

                points.push({
                    x: Math.floor(roomCoordinates[room][0] * (winHeight+5)),
                    y: Math.floor(roomCoordinates[room][1] * winHeight),
                    value: roomInfo[room],
                    radius: minRadius + (maxRadius - minRadius) * (roomInfo[room] / maxStudents)
                });

                var pTag = document.createElement("P");
                var innerText = document.createTextNode(room + ' - ' + roomInfo[room]);
                pTag.appendChild(innerText);

                document.getElementById("classes").appendChild(pTag);
            }
        }

        var data = {
            max: maxStudents,
            data: points
        };
        heatmap.setData(data);
        canvas.addEventListener("mouseup", findClosestRoom, false);
    });
};

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
