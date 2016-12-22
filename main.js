var coordinates = {
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
var maxRadius = 30;
var socket = io();

map = document.getElementById('map');
canv = document.getElementById('canv');
canv.height = map.height;
canv.width = map.height;
canv.addEventListener("click", findClosest, false);

var context = canv.getContext('2d');
context.globalAlpha = 0.4;

socket.on('locations', function(locations) {
    delete locations['TBA'];
    var valExtract = Object.keys(locations).map(function(key) {
        return locations[key];
    });
    var maxStudents = Math.max.apply(null, valExtract);

    for (var key in locations) {
        if (locations.hasOwnProperty(key)) {
            if (!coordinates.hasOwnProperty(key)) {
                console.log(key, 'does not have coordinates')
            }
            var radiusRatio = locations[key] / maxStudents;
            var radius = minRadius + (radiusRatio * (maxRadius - minRadius))
            context.beginPath();
            context.arc(toScale(coordinates[key][0] - 5), toScale(coordinates[key][1] - 15), radius, 0, 2 * Math.PI, false);
            context.fillStyle = gradient[Math.round(radiusRatio * gradient.length) - 1];
            context.fill();

            var p = document.createElement("P");
            var t = document.createTextNode(key + ' - ' + locations[key]);
            p.appendChild(t);
            document.getElementById("classes").appendChild(p);
        }
    }
});

function findClosest(e) {
    var distances = d(e.clientX, e.clientY);

    if (distances.length == 0) {
        document.getElementById('label').innerHTML = "Unknown";
    } else {
        var min = distances[0][1];
        var selectLocation = distances[0][0];
        distances.forEach(function(val) {
            if (val[1] < min) {
                min = val[1];
                selectLocation = val[0];
            }
        });
        document.getElementById('label').innerHTML = selectLocation;
    }
}

function d(x, y) {
    var distances = [];
    for (var key in coordinates) {
        var rawDistance = Math.pow((coordinates[key][0] - x), 2) + Math.pow((coordinates[key][1] - y), 2);
        if (rawDistance < 750) {
            distances.push([key, rawDistance]);
        }
    }
    return distances;
}
function toScale (num) {
  return num / 775 * map.width;
}
