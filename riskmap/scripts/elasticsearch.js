//on start count all vessels
/*$(function () {

    var latlong = undefined
    countVessels(VesselTableCounter, getAllVessels, latlong)

})*/

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





var data1 = []
function addAnotherVesseltoTable(hit) {

    var pushdata = {
        field1: hit._source.MMSI, field2: hit._source.LOCATION.lat, field3: hit._source.LOCATION.lon, field4: Object.keys(allMMSI).length + 1, field5: hit._source.NAME, field6: hit._source.IMO
    }
    data1.push(pushdata);
}
var allMMSI = {}
function countVesselsBasedOnHash(callback, latlong, currentdate) {
    allMMSI = {}
    
    var today = new Date();
    var todayToEpoch = today.getTime();
    var priorDate = new Date().setDate(today.getDate() - 30)
    if(typeof(currentdate != "undefinded"))
    {
        todayToEpoch = currentdate +3600000
        priorData = todayToEpoch - 300000
    }

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
        index: 'ais-*',
        type: 'vessel',
        size: '1000',
        scroll: '30s',
        body: {
            "sort": { "@timestamp": { "order": "asc" } },
            "query": {
                "bool": {
                    "must": [

                        {
                            "terms": { "TYPE": ["70"] }
                        },
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": priorDate,
                                    "lte": todayToEpoch,
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

                        }

                    ]
                }
            }
        }

    }, function getMoreUntilDone(error, response) {
        if (dt != undefined) {
            dt.clear();
        }
        data1 = [];
        // collect the title from each response
        response.hits.hits.forEach(function (hit) {
            for(var i = 0; i<shipCollection.length; i++)
            {
            if (hit._source.MMSI == shipCollection[i].properties.MMSI && !(hit._source.MMSI in allMMSI)) {
                callback(hit)
                allMMSI[hit._source.MMSI] = {
                    MMSI: hit._source.MMSI
                }
            }
            }
        });

        if (20000 > allMMSI.length) {
            // ask elasticsearch for the next set of hits from this search
            client.scroll({
                scrollId: response._scroll_id,
                scroll: '30s'
            }, getMoreUntilDone);
        } else {

            replaceTableValue(Object.keys(allMMSI).length)

            dt.load(data1);
        }
    });

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
        index: 'ais-*',
        type: 'vessel',
        size: 1000,
        body: {

            "query": {
                "bool": {
                    "must": [
                        {
                            "terms": { "TYPE": ["70"] }
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
function VesselTableCounter() {

    var kibanatable = document.getElementById("vesselcount");
    var tbdy = document.createElement('tbody');
    var tr = document.createElement('tr');
    var tdp = document.createElement('td');
    var tdc = document.createElement('td');
    tdp.appendChild(document.createTextNode('Vessels counted:'));
    tdc.appendChild(document.createTextNode(''));
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