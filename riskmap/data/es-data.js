$(function () {
    searchAllforView(pushVesselFromEStoHash)
    //createVesselIndex(getAllDataOfMMSI)
})

var vesselCollection = {}
var shipCollection = [];





function searchAllforView(callback) {
    var today = new Date();
    var todayToEpoch = today.getTime();
    var priorDate = new Date().setDate(today.getDate() - 30)

    client.search({
        index: 'ais-*',
        type: 'vessel',
        size: 100,
        body: {

            "query": {
                "bool": {
                    "must": [
                       
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
                                    "gte": priorDate,
                                    "lte": todayToEpoch,
                                    "format": "epoch_millis"
                                },
                                "TYPE":{
                                    "gte": 70,
                                    "lte": 79
                                }
                        
                            }
                        }
                    ],
                    "must_not": []
                }
            }
        }

    }, function (err, resp, _respcode) {

        callback(resp, createVesselforCollectionTimeBased)
        
    });

}
function pushVesselFromEStoHash(resp, callback) {
   
    // resp.forEach(function (resp) {
    for (var i = 0; i <= resp.hits.hits.length-1; i++) {
        if (Object.keys(vesselCollection).length <= maxVessels && !(resp.hits.hits[i]._source.MMSI in vesselCollection)) {
            timeData = Date.parse(resp.hits.hits[i]._source["@timestamp"])
            
            vesselCollection[resp.hits.hits[i]._source.MMSI] = {
                coord: [[
                    resp.hits.hits[i]._source.LOCATION.lon,
                    resp.hits.hits[i]._source.LOCATION.lat
                ]],
                time:
                [
                    timeData
                ],
                MMSI: resp.hits.hits[i]._source.MMSI
                
            };
        }
        else {
            if (resp.hits.hits[i]._source.MMSI in vesselCollection) {
                timeData = Date.parse(resp.hits.hits[i]._source["@timestamp"]);

                vesselCollection[resp.hits.hits[i]._source.MMSI].coord.push(
                    [
                        resp.hits.hits[i]._source.LOCATION.lon,
                        resp.hits.hits[i]._source.LOCATION.lat
                    ]

                );

                vesselCollection[resp.hits.hits[i]._source.MMSI].time.push(
                    timeData
                );

            }
        }
    }
    callback(createPlayback);
}


function createVesselforCollectionTimeBased(playback) {

    for (var index in vesselCollection) {

        var ship = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": vesselCollection[index].coord
            },
            "properties": {
                "MMSI": vesselCollection[index].MMSI,
                "time": vesselCollection[index].time
                
                // "IMO": resp.hits.hits[1]._source.IMO,
                // "NAME": resp.hits.hits[1]._source.NAME,
                // "DEST": resp.hits.hits[1]._source.DEST,
                // "DRAUGHT": resp.hits.hits[1]._source.DRAUGHT,
                //  "SOG": resp.hits.hits[1]._source.SOG,
                //  "ETA": resp.hits.hits[1]._source.ETA
            }

        };
        shipCollection.push(ship);

    }
    playback()
}