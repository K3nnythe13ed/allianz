

var checkLayerIsActive = false;
var markerLayer = L.layerGroup();
function formatThousand(nStr) {
    if (nStr != "undefined") {

        var sep = '.';
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + sep + '$2');
        }

        return x1 + x2 + " €";
    }
    else {
        return "empty";
    }
}

function CreateMapLayerMarker() {

    //foreach location in demoLocations call onEachFeature
    var datalocations = L.geoJson(demoLocations, {
        onEachFeature: onEachFeature
    })
    //add markerLayer to Map
    map.addLayer(markerLayer);


    // create new Marker
    function onEachFeature(feature, layer) {
        var WhS = L.icon({
            iconUrl: 'images/warehousemarker.png',
            iconSize: [38, 38],
            iconAnchor: [19, 38],
            popupAnchor: [0, -50]
        });
        var WhM = L.icon({
            iconUrl: 'images/warehousemarker.png',
            iconSize: [58, 58],
            iconAnchor: [29, 58],
            popupAnchor: [0, -50]
        });
        var WhB = L.icon({
            iconUrl: 'images/warehousemarker.png',
            iconSize: [78, 78],
            iconAnchor: [39, 78],
            popupAnchor: [0, -50]
        });
        var WhSS = L.icon({
            iconUrl: 'images/warehousemarker.png',
            iconSize: [18, 18],
            iconAnchor: [9, 18],
            popupAnchor: [0, -50]
        });
        var lat = feature.geometry.coordinates[1];
        var lon = feature.geometry.coordinates[0];
        var popupContent;
        var mark;
        //use icon depending on Exp_TIV
        if (feature.properties.Exp_TIV >= 10000000) {
            mark = L.marker([lat, lon], { icon: WhB });

        }
        else {
            if (feature.properties.Exp_TIV >= 5000000) {
                mark = L.marker([lat, lon], { icon: WhM })

            }
            else {
                if (feature.properties.Exp_TIV >= 1000000) {
                    mark = L.marker([lat, lon], { icon: WhS })

                }
                else {
                    mark = L.marker([lat, lon], { icon: WhSS })

                }
            }
        }
        //format Exp_TIV 



        mark.bindPopup
            (
                "<table id='popupware'>"+
            "<tr><td><b>Location Name: </b></td><td>" + feature.properties.AccountName + "<td></tr>" +
            "<tr><td><b>Location ID: </b></td><td>" + feature.properties.LocID + "<td></tr>" +
            
            "<tr><td><b>Nathan Risk Score: </b></td><td>" + feature.properties.MR_RISK_SCORE + "<td></tr>" +
            "<tr><td><b>Exposure: </b></td><td>" + formatThousand(feature.properties.Exp_TIV) +"<td></tr>"+
            "<tr><td><b>Lat: </b></td><td><b> Lon: </b> <td></tr>" +
            "<tr><td>" + lat + "</td><td>" + lon + " <td></tr>" +
            "</table>"
            )
        markerLayer.addLayer(mark);

    }

    // on zoom removeLayer markerLayer. 
    // exception: Checkbox CheckWarehouse has been checked
    map.on('zoomend', function () {
        if (map.getZoom() <= 5 && !(document.getElementById("CheckWarehouse").checked)) {
            if (typeof (markerLayer) != "undefined") {

                map.removeLayer(markerLayer);

            }
        }
        else {
            map.addLayer(markerLayer);

        }


    });

}
// removeLayer/addLayer markerLayer whenever CheckWarehouse has been checked
function handleLocationLayer() {
    if (map.getZoom() <= 5 && !(document.getElementById("CheckWarehouse").checked)) {
        if (typeof (markerLayer) != "undefined") {

            map.removeLayer(markerLayer);

        }
    }
    else {
        map.addLayer(markerLayer);

    }

}

