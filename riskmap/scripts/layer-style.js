//call changeLayer(1) to set up Main Layer

var viewModel = function () {
    var self = this;

    self.dropdownOptions = ko.observableArray([
        { id: 1, label: "Click 1" },
        { id: 2, label: "Click 2" },
        { id: 3, label: "Click 3" }
    ])

    self.clickTest = function (item) {
        alert("Item with id:" + item.id + " was clicked!");
    }
};






changeLayer("1");
var layers;
// removeLayer 
function undoLayer() {
    if (typeof (layers) != "undefined") {
        map.removeLayer(layers);
    }
}
//create new Layer combining osm, owm and osm 
//adding tilelayer to layergroup
function createLayer(key) {
    undoLayer();
    var main = new L.tileLayer('https://api.tiles.mapbox.com/v4/k3nnythe13ed.1oe7h7kd/{z}/{x}/{y}.png?access_token=sk.eyJ1IjoiazNubnl0aGUxM2VkIiwiYSI6ImNpdXBramh1MjAwMWUyb3BrZGZpaHRhNmUifQ.SVIjk10IlrzAkWopvYzMtg',
        {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://openweathermap.org">OpenWeatherMap</a>, <a href="http://openseamap.org">OpenSeaMap</a>',
            maxZoom: 21,

            continuousWorld: false,
            noWrap: true
        })

    var sea = new L.tileLayer('http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
        {
            maxZoom: 21,
            opacity: 0.7,

            continuousWorld: false,
            noWrap: true
        })
    if (key !== null) {
        var weather = new L.tileLayer('http://{s}.maps.owm.io/current/' + String(key) + '/{z}/{x}/{y}?appid=b1b15e88fa797225412429c1c50c122a1',
            {
                maxZoom: 9,

                opacity: 0.9,
                continuousWorld: false,
                noWrap: true

            })



        layers = L.layerGroup([main, weather, sea])
    }
    else {
        layers = L.layerGroup([main, sea])
    }
    map.addLayer(layers);
}

//change owm Layer on value change using the dropdown menu basemaps
function changeLayer(value) {
    var legend
    var layer
    switch (value) {
        case "1":
            layer = null;
            legend = ""
            break;

        case "2":
            layer="RAIN_STYLE";
            legend = '<div class="leaflet-control-color-scale leaflet-control" style="display: block;"><div class="leaflet-control-color-scale-line" style="width: 300px; background-image: linear-gradient(to right, rgba(0, 255, 0, 0) 0%, rgba(0, 255, 0, 0.2) 0.5%, rgba(0, 232, 46, 0.6) 1.5%, rgba(0, 202, 145, 0.8) 7%, rgba(0, 170, 208, 0.901961) 9.5%, rgb(0, 156, 229) 24.5%, rgb(14, 64, 134) 50%, rgb(13, 113, 252) 100%);"><div class="scale-value scale-min-value"><span>&nbsp;0mm</span></div><div class="scale-value scale-avg-value" style="left:50%"><span>&nbsp;100mm</span></div><div class="scale-value scale-max-value"><span>200mm&nbsp;</span></div></div></div>'
            break;

        case "3":
            legend = "<div class='leaflet-control-color-scale leaflet-control' style='display: block;'><div class='leaflet-control-color-scale-line' style='width: 300px; background-image: linear-gradient(to right, rgba(247, 247, 255, 0) 0%, rgba(251, 247, 255, 0) 10%, rgba(244, 248, 255, 0.0980392) 20%, rgba(240, 249, 255, 0.2) 30%, rgba(221, 250, 255, 0.4) 40%, rgba(207, 251, 255, 0.4) 50%, rgba(199, 252, 255, 0.6) 60%, rgba(189, 255, 255, 0.8) 70%, rgba(171, 255, 255, 0.901961) 80%, rgb(115, 235, 255) 90%, rgb(173, 174, 255) 95%, rgb(173, 174, 255) 100%);'><div class='scale-value scale-min-value'><span>&nbsp;0%</span></div><div class='scale-value scale-avg-value' style='left:50%'><span>&nbsp;50%</span></div><div class='scale-value scale-max-value'><span>100%&nbsp;</span></div></div></div>";
            layer="CLOUDS_STYLE";



            break;

        case "4":
            legend = '<div class="leaflet-control-color-scale leaflet-control" style="display: block;"><div class="leaflet-control-color-scale-line" style="width: 300px; background-image: linear-gradient(to right, rgba(172, 170, 247, 0) 0%, rgba(172, 170, 247, 0.4) 0.5%, rgba(141, 138, 243, 0.901961) 5%, rgb(112, 110, 194) 10%, rgb(86, 88, 255) 20%, rgb(91, 93, 177) 50%, rgb(62, 63, 133) 100%);"><div class="scale-value scale-min-value"><span>&nbsp;0mm</span></div><div class="scale-value scale-avg-value" style="left:50%"><span>&nbsp;100mm</span></div><div class="scale-value scale-max-value"><span>200mm&nbsp;</span></div></div></div>'
            layer="PRECIPITATION_STYLE";
            break;

        case "5":
            legend = '<div class="leaflet-control-color-scale leaflet-control" style="display: block;"><div class="leaflet-control-color-scale-line" style="width: 300px; background-image: linear-gradient(to right, rgb(0, 115, 255) 0%, rgb(0, 170, 255) 8.35059%, rgb(75, 208, 214) 24.9192%, rgb(141, 231, 199) 41.4879%, rgb(176, 247, 32) 49.7722%, rgb(240, 184, 0) 58.0565%, rgb(251, 85, 21) 74.6251%, rgb(243, 54, 59) 91.1938%, rgb(198, 0, 0) 100%);"><div class="scale-value scale-min-value"><span>&nbsp;949.92hPa</span></div><div class="scale-value scale-avg-value" style="left:52.46458454146298%"><span>&nbsp;1013.25hPa</span></div><div class="scale-value scale-max-value"><span>1070.63hPa&nbsp;</span></div></div></div>'
            layer="PRESSURE_STYLE";
            break;


        case "6":
            legend = '<div class="leaflet-control-color-scale leaflet-control" style="display: block;"><div class="leaflet-control-color-scale-line" style="width: 300px; background-image: linear-gradient(to right, rgba(2, 255, 137, 0) 0%, rgba(2, 255, 137, 0.298039) 0.5%, rgba(12, 197, 119, 0.701961) 2.5%, rgba(22, 139, 101, 0.8) 10%, rgba(81, 82, 255, 0.901961) 20%, rgb(84, 47, 130) 50%, rgb(84, 47, 130) 100%);"><div class="scale-value scale-min-value"><span>&nbsp;0mm</span></div><div class="scale-value scale-avg-value" style="left:50%"><span>&nbsp;100mm</span></div><div class="scale-value scale-max-value"><span>200mm&nbsp;</span></div></div></div>'
            layer="SNOW_STYLE";

            break;

        case "7":
            legend = '<div class="leaflet-control-color-scale leaflet-control" style="display: block;"><div class="leaflet-control-color-scale-line" style="width: 300px; background-image: linear-gradient(to right, rgb(69, 117, 180) 0%, rgb(82, 139, 213) 12.5%, rgb(103, 163, 222) 18.75%, rgb(142, 202, 240) 25%, rgb(155, 213, 244) 31.25%, rgb(172, 225, 253) 37.5%, rgb(194, 234, 255) 43.75%, rgb(255, 255, 208) 50%, rgb(254, 248, 174) 56.25%, rgb(254, 232, 146) 62.5%, rgb(254, 226, 112) 68.75%, rgb(253, 212, 97) 75%, rgb(244, 168, 94) 81.25%, rgb(244, 129, 89) 87.5%, rgb(244, 104, 89) 93.75%, rgb(244, 76, 73) 100%);"><div class="scale-value scale-min-value"><span>&nbsp;-40°C</span></div><div class="scale-value scale-avg-value" style="left:50%"><span>&nbsp;0°C</span></div><div class="scale-value scale-max-value"><span>40°C&nbsp;</span></div></div></div>'
            layer="TEMP_STYLE";
            break;


        case "8":
            legend = '<div class="leaflet-control-color-scale leaflet-control" style="display: block;"><div class="leaflet-control-color-scale-line" style="width: 300px; background-image: linear-gradient(to right, rgba(255, 255, 0, 0) 0%, rgba(255, 255, 0, 0) 0.5%, rgba(93, 255, 0, 0.4) 2.5%, rgba(57, 218, 255, 0.701961) 7.5%, rgba(253, 45, 139, 0.8) 12.5%, rgba(116, 76, 172, 0.901961) 25%, rgb(70, 0, 175) 50%, rgb(13, 17, 38) 100%);"><div class="scale-value scale-min-value"><span>&nbsp;0m/s</span></div><div class="scale-value scale-avg-value" style="left:50%"><span>&nbsp;100m/s</span></div><div class="scale-value scale-max-value"><span>200m/s&nbsp;</span></div></div></div>'
            layer="WINDSPEED_STYLE";
            break;
    }
    createLegend(legend);
    createLayer(layer);
}

function createLegend(legend) {
    var leg = document.getElementById("legend");
    leg.innerHTML = legend
}

