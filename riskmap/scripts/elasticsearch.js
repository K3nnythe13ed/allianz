//on start count all vessels
$(function () {

    var latlong = undefined
    countVessels(VesselTableCounter, getAllVessels, latlong)

})

//get all Vessels in elasticsearch for later use
var dt;
$(document).ready(function (e) {
    dt = dynamicTable.config('vesselsearch',
        ['field4', 'field1', 'field6', 'field5', 'field2', 'field3'],
        ['Nr.', 'MMSI', 'IMO', 'Name', 'LAT', 'LON'], //set to null for field names instead of custom header names
        'There are no items to list...');
})
function getAllVessels(resp) {
    if (dt != undefined) {
        dt.clear();
    }
    var data1 = []
    for (let i = 0; i < resp.hits.hits.length; i++) {
        var pushdata = {
            field1: resp.hits.hits[i]._source.MMSI, field2: resp.hits.hits[i]._source.LOCATION.lat, field3: resp.hits.hits[i]._source.LOCATION.lon, field4: i + 1, field5: resp.hits.hits[i]._source.NAME, field6: resp.hits.hits[i]._source.IMO
        }
        data1.push(pushdata);
    }
    dt.load(data1);
}
//elasticsearch counting all vessels in latlong area. If not set latlong = max lat, max lon

function countVessels(callback, callback2, latlong) {

    var topleftlat = 89.00;
    var topleftlon = -180.00;
    var bottomrightlat = -90.00;
    var bottomrightlon = 180.00;
    if (typeof latlong != "undefined") {

        topleftlat = latlong[1].lat;
        topleftlon = latlong[1].lng;
        bottomrightlat = latlong[3].lat;
        bottomrightlon = latlong[3].lng;
    }

    client.search({
        index: 'ais-2016.11.09',
        type: 'vessel',
        size: 10000,
        body: {

            "query": {
                "bool": {
                    "must": [
                        {
                            "terms": { "TYPE": ["70", "71", "72", "73", "74", "75", "76", "77", "78", "89", "80", "81", "82", "83", "84", "85", "86", "88", "88", "89", "90"] }
                        },
                        {
                            "query_string": {
                                "query": "*",
                                "analyze_wildcard": true
                            }
                        },
                        {
                            "query_string": {
                                "analyze_wildcard": true,
                                "query": "*"
                            }
                        },
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": 1477954800000,
                                    "lte": 1480546799999,
                                    "format": "epoch_millis"
                                }
                            }
                        },
                        {
                            "geo_bounding_box": {
                                "LOCATION": {
                                    "top_left": {
                                        "lat": topleftlat,
                                        "lon": topleftlon
                                    },
                                    "bottom_right": {
                                        "lat": bottomrightlat,
                                        "lon": bottomrightlon
                                    }
                                }
                            }

                        },
                    ],
                    "must_not": []
                }
            }
        }

    }, function (err, response, _respcode) {
        //do callback function after finishing countVessels 
        if (err != undefined) {
            alert("Elasticsearch hasn't been started or is not ready yet")
        }
        callback(response.hits.total)
        callback2(response)
    });
}

//create table content for html index 
function VesselTableCounter(response) {

    var kibanatable = document.getElementById("vesselcount");
    var tbdy = document.createElement('tbody');
    var tr = document.createElement('tr');
    var tdp = document.createElement('td');
    var tdc = document.createElement('td');
    tdp.appendChild(document.createTextNode('Vessels counted:'));
    tdc.appendChild(document.createTextNode(response));
    tr.appendChild(tdp);
    tr.appendChild(tdc);
    tbdy.appendChild(tr);
    kibanatable.appendChild(tbdy);
}
// replace value of table on new draw
function replaceTableValue(response) {

    var kibanatable = document.getElementById("vesselcount");
    kibanatable.rows[0].cells[1].innerHTML = response;

}