
function getTotalExposureOfWarehouse(latlong) {
    var currentPlaybackTime = playbackitem.getEndTime()
    var priorDate = currentPlaybackTime - (30 * 24 * 60 * 60 * 1000)
    topleftlat = latlong[1].lat;
    topleftlon = latlong[1].lng;
    bottomrightlat = latlong[3].lat;
    bottomrightlon = latlong[3].lng;
    console.log(latlong)
    client.search({
        index: 'logstash-*',
        type: 'warehouse',
        body: {
            "size": 5,
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
                            "geo_shape": {
                                "geometry": {
                                    "shape": {
                                        "type": "envelope",
                                        "coordinates": [
                                            [topleftlat, topleftlon], [bottomrightlat, bottomrightlon]
                                        ]
                                    },
                                    "relation": "intersects"
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
        console.log(response)
    }
    )
}