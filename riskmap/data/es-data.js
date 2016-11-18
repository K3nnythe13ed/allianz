$(function () {
     searchAllforView(createVesselforCollection, createPlayback)
     //createVesselIndex(getAllDataOfMMSI)
})
shipCollection = [];
MMSICollection = [];

function createVesselIndex(callback, callbackforlater) {
    var today = new Date();
    var todayToEpoch = today.getTime();
    var priorDate = new Date().setDate(today.getDate() - 30)
    client.search({
        index: 'ais-*',
        type: 'vessel',
        size: 10000,
        body: {
            "_source": ["MMSI"],
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
                                    "gte": priorDate,
                                    "lte": todayToEpoch,
                                    "format": "epoch_millis"
                                }
                            }
                        }
                    ],
                    "must_not": []
                }
            }
        }

    }, function (err, resp, _respcode) {
        MMSICollection.push(String(resp.hits.hits[0]._source.MMSI))
        console.log(resp.hits.total)
        for (var i = 1; i <= 9000; i++) {
            var test = 1;
            
            for (var j = 0; j <= MMSICollection.length; j++) {
                if (MMSICollection[j] == String(resp.hits.hits[i]._source.MMSI)) {
                    test = 0
                    
                }
            }
            if (test == 1) {
                MMSICollection.push(String(resp.hits.hits[i]._source.MMSI))  
            }
        }
        callback(createVesselforCollectionTimeBased, createPlayback);
    });

}

function getAllDataOfMMSI(callback, playback) {
    
    var today = new Date();
    var todayToEpoch = today.getTime();
    var priorDate = new Date().setDate(today.getDate() - 30)
    for (var i = 0; i <= MMSICollection.length; i++) {
        client.search({
            index: 'ais-*',
            type: 'vessel',
            size: 10000,
            body: {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "term": { "MMSI": String(MMSICollection[i]) }
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
                                        "gte": priorDate,
                                        "lte": todayToEpoch,
                                        "format": "epoch_millis"
                                    }
                                }
                            }
                        ],
                        "must_not": []
                    }
                }
            }

        }, function (err, resp, _respcode) {
            callback(resp)
            
        })

    }
    playback()
}



function createVesselforCollectionTimeBased(resp) {
    
    var coordData;
    var shipcoordCollection = [];
    var timeDataCollection =[];
    for (var i = 1; i < resp.hits.total; i++) {
        coordData = [resp.hits.hits[i]._source.LOCATION.lon, resp.hits.hits[i]._source.LOCATION.lat]
        shipcoordCollection.push(coordData)
        timeDataCollection.push(Date.parse(resp.hits.hits[i]._source["@timestamp"]));

    }
    
    var ship = {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                shipcoordCollection
            ]

        },
        "properties": {
            "MMSI": resp.hits.hits[0]._source.MMSI,
            "time": [
                timeData
            ],
            "IMO": resp.hits.hits[0]._source.IMO,
            "NAME": resp.hits.hits[0]._source.NAME,
            "DEST": resp.hits.hits[0]._source.DEST,
            "DRAUGHT": resp.hits.hits[0]._source.DRAUGHT,
            "SOG": resp.hits.hits[0]._source.SOG,
            "ETA": resp.hits.hits[0]._source.ETA
        }

    };
        console.log(ship)
        shipCollection.push(ship);
        
}
























function createVesselforCollection(resp) {
    for (var i = 0; i < resp.hits.total; i++) {
        var ship = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [
                        resp.hits.hits[i]._source.LOCATION.lon,
                        resp.hits.hits[i]._source.LOCATION.lat
                    ],

                ]
            },
            "properties": {
                "MMSI": resp.hits.hits[i]._source.MMSI,
                "time": [
                    Date.parse(resp.hits.hits[i]._source["@timestamp"]),
                ],
                "IMO": resp.hits.hits[i]._source.IMO,
                "NAME": resp.hits.hits[i]._source.NAME,
                "DEST": resp.hits.hits[i]._source.DEST,
                "DRAUGHT": resp.hits.hits[i]._source.DRAUGHT,
                "SOG": resp.hits.hits[i]._source.SOG,
                "ETA": resp.hits.hits[i]._source.ETA

            }
        };
        shipCollection.push(ship);
    }

}

function searchAllforView(callback, playback) {
    var today = new Date();
    var todayToEpoch = today.getTime();
    var priorDate = new Date().setDate(today.getDate() - 30)

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
                                    "gte": priorDate,
                                    "lte": todayToEpoch,
                                    "format": "epoch_millis"
                                }
                            }
                        }
                    ],
                    "must_not": []
                }
            }
        }

    }, function (err, response, _respcode) {

        callback(response)
        playback();
    });
}
