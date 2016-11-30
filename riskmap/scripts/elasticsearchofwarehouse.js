
function getTotalExposureOfWarehouse(latlong) {

    var countingList = {
        "type": "FeatureCollection",
        "features": [
        ]
    }
    var locationexposure;
    var currentPlaybackTime = new Date();
    var todayToEpoch = currentPlaybackTime.getTime();
    var priorDate = new Date().setDate(currentPlaybackTime.getDate() - 30)
    topleftlat = latlong[1].lat;
    topleftlon = latlong[1].lng;
    bottomrightlat = latlong[3].lat;
    bottomrightlon = latlong[3].lng;
    client.search({
        index: 'logstash-*',
        type: 'warehouse',
        body: {
            "size": 1000,
            "query": {
                "bool": {
                    "must": [
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": priorDate,
                                    "lte": currentPlaybackTime
                                }
                            },
                        },

                        {
                            "geo_shape": {
                                "geometry": {
                                    "shape": {
                                        "type": "envelope",
                                        "coordinates": [
                                            [topleftlon, topleftlat], [bottomrightlon, bottomrightlat]
                                        ]
                                    },
                                    "relation": "within"
                                }
                            }
                        }
                    ]

                }
            },
            "aggs": {
                "1": {
                    "sum": {
                        "field": "exposure"
                    }
                }
            }
        }
    }, function getMoreUntilDone(error, response) {
      
        replaceTableWarehouseValue(response.aggregations[1].value)
    }


    )
}
