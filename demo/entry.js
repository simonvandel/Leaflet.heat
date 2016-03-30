require('leaflet');
require("../src/HeatLayer.js");

var map = L.map('map').setView([-37.87, 175.475], 12);

var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

addressPoints = addressPoints.map(function (p) { return [p[0], p[1], Math.random()*8, Math.random()]; });

var heat = L.heatLayer(addressPoints, {radius: 10, blur: 0, max: 8, gradient: ['blue', 'lime', 'red', 'purple']}).addTo(map);
