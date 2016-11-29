//call changeLayer(1) to set up Main Layer

var viewModel = function(){
    var self = this;

    self.dropdownOptions = ko.observableArray([
        { id: 1, label: "Click 1" },
        { id: 2, label: "Click 2" },
        { id: 3, label: "Click 3" }
    ])

    self.clickTest = function(item){
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
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://openseamap.org">OpenSeaMap</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 21,
       
            continuousWorld: false,
        noWrap: true
        })

var sea = new L.tileLayer('http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
        {
            attribution: 'Map data &copy; <a href="http://openseamap.org">OpenSeaMap</a>',
            maxZoom: 21,
            opacity: 0.7,

            continuousWorld: false,
        noWrap: true
        })
    if(key !== null)
        {
    var weather = new L.tileLayer('http://{s}.maps.owm.io/current/' + String(key) + '/{z}/{x}/{y}?appid=b1b15e88fa797225412429c1c50c122a1',
        {
            attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
            maxZoom: 9,
           
            opacity: 0.9,
            continuousWorld: false,
            noWrap: true
            
        })
    layers = L.layerGroup([main, weather, sea])
    }
    else{
        layers = L.layerGroup([main, sea])
    }
    map.addLayer(layers);
}

//change owm Layer on value change using the dropdown menu basemaps
function changeLayer(value) {

    switch (value) {
        case "1":
           createLayer(null);
            break;

        case "2":
            createLayer("RAIN_STYLE");
            break;

        case "3":
            createLayer("CLOUDS_STYLE");
            break;

        case "4":
            createLayer("PRECIPITATION_STYLE");
            break;

        case "5":
            createLayer("PRESSURE_STYLE");
            break;


        case "6":
            createLayer("SNOW_STYLE");

            break;

        case "7":
            createLayer("TEMP_STYLE");
            break;


        case "8":
            createLayer("WINDSPEED_STYLE");
            break;
    }
}

