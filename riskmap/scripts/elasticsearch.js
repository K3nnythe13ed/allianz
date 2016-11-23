

//get all Vessels in elasticsearch for later use
var dt;
$(document).ready(function(e) {

    dt = dynamicTable.config('vesselsearch',
        ['field1', 'field5', 'field4', 'field2', 'field3'],
        ['MMSI', 'IMO', 'Name', 'LAT', 'LON'], //set to null for field names instead of custom header names
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
        field1: hit._source.MMSI, field2: hit._source.LOCATION.lat, field3: hit._source.LOCATION.lon, field4: hit._source.NAME, field5: hit._source.IMO
    }
    data1.push(pushdata);
}


var lasttimefound = []


var allMMSI = {}
function AmountofVesselsInArea(addAnotherVesseltoTable, latlong) {

    var currentPlaybackTime = playbackitem.getTime()
    var priorDate = currentPlaybackTime - (5 * 60 * 1000)
    console.log(currentPlaybackTime)

    topleftlat = latlong[1].lat;
    topleftlon = latlong[1].lng;
    bottomrightlat = latlong[3].lat;
    bottomrightlon = latlong[3].lng;

    client.search({
        index: 'logstash-*',
        type: 'vessel',
        size: '10000',
        scroll: '30s',
        body: {
            "sort": { "@timestamp": { "order": "desc" } },
            "query": {
                "bool": {
                    "must": [
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": priorDate,
                                    "lte": currentPlaybackTime,
                                    "format": "epoch_millis"
                                }
                            }
                        },
                        {
                            "range": {
                                "TYPE": {
                                    "gte": 70,
                                    "lte": 70
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



                    ]
                }
            },
            "aggs": {
                "dedup": {
                    "terms": {
                        "field": "MMSI"
                    },
                    "aggs": {
                        "dedup_docs": {
                            "top_hits": {
                                "size": 1
                            }
                        }
                    }
                }
            }
        }

    }, function getMoreUntilDone(error, response) {
        var index = []
        var counter = 0;
        console.log(response)
        response.hits.hits.forEach(function(hit) {
             index.push(hit._source.MMSI);
        })
        response.aggregations.dedup.buckets.forEach(function(hit) {
            
            mmsihit = hit.dedup_docs.hits.hits[0]
            counter += 1
            for (var i = 0; i < index.lengths; i++) {
                console.log(index.length)
                if (mmsihit._source.MMSI == shipCollection[i].properties.MMSI) {
                    addAnotherVesseltoTable(mmsihit)
                }
            }

        });

        if (response.hits.total > index.length) {
            console.log(response.hits.total)
            console.log(index.length)
            // ask elasticsearch for the next set of hits from this search
            client.scroll({
                scrollId: response._scroll_id,
                scroll: '30s'
            }, getMoreUntilDone);
        } else {

            replaceTableValue(counter)

            dt.load(data1);
        }
    });

}

















var allMMSI = {}
function countVesselsBasedOnHash(callback, latlong, currentdate) {

    var today = new Date();
    var todayToEpoch = today.getTime();
    var priorDate = new Date().setDate(today.getDate() - 30)
    if (typeof (currentdate != "undefinded")) {
        todayToEpoch = currentdate + 3600000
        priorDate = todayToEpoch - 100000
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
        index: 'logstash-*',
        type: 'vessel',
        size: '10000',
        scroll: '30s',
        body: {
            "sort": { "@timestamp": { "order": "asc" } },
            "query": {
                "bool": {
                    "must": [
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
                            "range": {
                                "TYPE": {
                                    "gte": 70,
                                    "lte": 70
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
        response.hits.hits.forEach(function(hit) {
            for (var i = 0; i < shipCollection.length; i++) {
                if (hit._source.MMSI == shipCollection[i].properties.MMSI && !(hit._source.MMSI in allMMSI)) {
                    callback(hit)
                    allMMSI[hit._source.MMSI] = {
                        MMSI: hit._source.MMSI
                    }
                }
            }
        });

        if (response.hits.total > allMMSI.length) {
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