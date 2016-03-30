require('leaflet');
require('../src/HeatLayer.js');

var map = L.map('map').setView([41.890239, 12.492335], 16);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
addressPoints = [[41.890239, 12.492335]];
addressPoints = addressPoints.map(function (p) { return [p[0], p[1], Math.random() * 8, 0.5]; });

var heat = L.heatLayer(addressPoints, {radius: 70, blur: 0, max: 8, gradient: ['blue', 'lime', 'red', 'purple']}).addTo(map);
