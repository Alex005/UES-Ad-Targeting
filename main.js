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

var socket = io();

window.onload = function() {
    map = document.getElementById('map');
    wrapper = document.getElementById('heatmapContainerWrapper');
    wrapper.style.height = "700px";
    wrapper.style.width = "700px";
    var heatmap = h337.create({
        maxOpacity: .8,
        container: document.getElementById('heatmapContainer')
    });
    window.h = heatmap;

    socket.on('locations', function(roomInfo) {
        points = [];
        for (var room in roomInfo) {
            if (roomInfo.hasOwnProperty(room)) {
                if (!roomCoordinates.hasOwnProperty(room)) {
                    console.log(room + ' does not have any coordinates');
                }
                var x = toScale(roomCoordinates[room][0] - 5);
                var y = toScale(roomCoordinates[room][1] - 15);

                points.push({
                    x: x,
                    y: y,
                    value: roomInfo[room]
                });

                var pTag = document.createElement("P");
                var innerText = document.createTextNode(room + ' - ' + roomInfo[room]);
                pTag.appendChild(innerText);

                document.getElementById("classes").appendChild(pTag);
            }
        }
        var valExtract = Object.keys(roomInfo).map(function(key) {
            return roomInfo[key];
        });
        var data = {
            max: Math.max.apply(null, valExtract),
            data: points
        };
        heatmap.setData(data);
        wrapper.addEventListener("click", findClosestRoom, false);
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

function toScale(num) {
    return num / 775 * 700;
}
