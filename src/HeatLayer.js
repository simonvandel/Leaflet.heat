'use strict';
var simpleheat = require('simpleheat');

L.HeatLayer = (L.Layer ? L.Layer : L.Class).extend({
    initialize: function (latlngs, options) {
        this._latlngs = latlngs;
        L.setOptions(this, options);
    },

    setLatLngs: function (latlngs) {
        this._latlngs = latlngs;
        return this.redraw();
    },

    addLatLng: function (latlng) {
        this._latlngs.push(latlng);
        return this.redraw();
    },

    setOptions: function (options) {
        L.setOptions(this, options);
        return this.redraw();
    },

    redraw: function () {
        if (this._heat && !this._frame && !this._map._animating) {
            this._frame = L.Util.requestAnimFrame(this._redraw, this);
        }
        return this;
    },

    onAdd: function (map) {
        this._map = map;

        if (!this._canvas) {
            this._initCanvas();
        }

        map._panes.overlayPane.appendChild(this._canvas);

        map.on('moveend', this._reset, this);

        if (map.options.zoomAnimation && L.Browser.any3d) {
            map.on('zoomanim', this._animateZoom, this);
        }

        this._reset();
    },

    onRemove: function (map) {
        map.getPanes().overlayPane.removeChild(this._canvas);

        map.off('moveend', this._reset, this);

        if (map.options.zoomAnimation) {
            map.off('zoomanim', this._animateZoom, this);
        }
    },

    addTo: function (map) {
        map.addLayer(this);
        return this;
    },

    _initCanvas: function () {
        var canvas = this._canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer leaflet-layer');

        var originProp = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin']);
        canvas.style[originProp] = '50% 50%';

        var size = this._map.getSize();
        canvas.width  = size.x;
        canvas.height = size.y;

        var animated = this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));

        this._heat = simpleheat(canvas);
    },

    _reset: function () {
        var topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);

        var size = this._map.getSize();

        if (this._heat._width !== size.x) {
            this._canvas.width = this._heat._width  = size.x;
        }
        if (this._heat._height !== size.y) {
            this._canvas.height = this._heat._height = size.y;
        }

        this._redraw();
    },

    _metresPerPixel: function () {
        var centerLatLng = this._map.getCenter(); // get map center
        var pointC = this._map.latLngToContainerPoint(centerLatLng); // convert to containerpoint (pixels)
        var pointX = [pointC.x + 1, pointC.y]; // add one pixel to x
        // convert containerpoints to latlng's
        var latLngC = this._map.containerPointToLatLng(pointC);
        var latLngX = this._map.containerPointToLatLng(pointX);

        var distanceX = latLngC.distanceTo(latLngX); // calculate distance between c and x (latitude)

        return 1 / distanceX;
    },

    _redraw: function () {
        var map = this._map;
        var latlngs = this._latlngs;
        var pixelPerMeter =  this._metresPerPixel();
        var radius = this.options.radius * pixelPerMeter;

        var data = latlngs.map(function (x) {
            var point = map.latLngToContainerPoint(L.latLng(x[0], x[1]));
            return [
                point.x, // x
                point.y, // y
                x[2], // intensity
                x[3] // opacity
            ];
        });

        this._heat.draw(data, radius);
        //simpleheat.draw(data, radius);
    },

    _animateZoom: function (e) {
        var scale = this._map.getZoomScale(e.zoom),
            offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

        if (L.DomUtil.setTransform) {
            L.DomUtil.setTransform(this._canvas, offset, scale);

        } else {
            this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';
        }
    }
});

L.heatLayer = function (latlngs, options) {
    return new L.HeatLayer(latlngs, options);
};
