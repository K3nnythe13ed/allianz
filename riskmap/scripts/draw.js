

var editableLayers = new L.FeatureGroup();
map.addLayer(editableLayers);
var layer;
var options = {
    edit: {
        featureGroup: editableLayers //REQUIRED!!
    },
    draw:
    {
        polyline: false,
        polygon: false,
        marker: false,
        circle: false
    }
};

var drawControl = new L.Control.Draw(options);
map.addControl(drawControl);

map.on(L.Draw.Event.DRAWSTART, function (e) {

    editableLayers.clearLayers();
    var latlong = undefined
    countVessels(replaceTableValue, getAllVessels, latlong)

})
var layer_leaflet_id;
map.on(L.Draw.Event.CREATED, function (e) {
    var type = e.layerType,
        layer = e.layer;
    //on create do elasticsearch function countVessels input(function replaceTableValue as callback, layer latlongs)
    countVessels(replaceTableValue, getAllVessels, layer.getLatLngs())

    editableLayers.addLayer(layer);
    layer_leaflet_id = layer._leaflet_id
    // Do whatever else you need to. (save to db, add to map etc)
});

map.on(L.Draw.Event.DELETESTART, function (e) {
    editableLayers.clearLayers();
    var latlong = undefined
    countVessels(replaceTableValue, getAllVessels, latlong)
});

map.on(L.Draw.Event.EDITED, function (e) {

    latlong = e.layers._layers[layer_leaflet_id]._latlngs;
    countVessels(replaceTableValue, getAllVessels, latlong)


});
// Initialise the draw control and pass it the FeatureGroup of editable layers
