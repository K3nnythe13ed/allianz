
var LeafIcon = L.Icon.extend({
    options: {

        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -50]
    }
});

var LeafletDrawMarker = new LeafIcon({
    iconUrl: 'images/office-building.png'
});



var editableLayers = new L.FeatureGroup();
map.addLayer(editableLayers);
var layer;
var options = {

    edit: {
        featureGroup: editableLayers //REQUIRED!!
    },

    draw:
    {
        marker: {
            icon: LeafletDrawMarker
        },
        polyline: false,
        polygon: false,
        circle: false
    }
};
var drawControl = new L.Control.Draw(options);
map.addControl(drawControl);
var latlong = undefined
map.on(L.Draw.Event.DRAWSTART, function (e) {
    var type = e.layerType
    if (type === 'rectangle') {
        latlong = undefined
        editableLayers.clearLayers();
        showAllVesselsOfPastDayInTable(addAnotherVesseltoTable)
    }
})
var layer_leaflet_id;

map.on(L.Draw.Event.CREATED, function (e) {
    var type = e.layerType,
        layer = e.layer;
    //on create do elasticsearch function countVessels input(function replaceTableValue as callback, layer latlongs)
    if (type === 'rectangle') {
        latlong = layer.getLatLngs()
        AmountofVesselsInArea(addAnotherVesseltoTable, latlong, getTotalExposureOfWarehouse, replaceTableValue)

        editableLayers.addLayer(layer);
        layer_leaflet_id = layer._leaflet_id
    }
    if (type === 'marker') {
        MarkersetLatLng(e);
        markerLayer.addLayer(layer);
    }
    // Do whatever else you need to. (save to db, add to map etc)
});

map.on(L.Draw.Event.DELETESTART, function (e) {
    latlong = undefined
    editableLayers.clearLayers();
    showAllVesselsOfPastDayInTable(addAnotherVesseltoTable)
});

map.on(L.Draw.Event.EDITED, function (e) {

    latlong = e.layers._layers[layer_leaflet_id]._latlngs;
    AmountofVesselsInArea(addAnotherVesseltoTable, latlong, getTotalExposureOfWarehouse, replaceTableValue)


});
// Initialise the draw control and pass it the FeatureGroup of editable layers
