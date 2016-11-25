
function getTotalExposureOfWarehouse(latlong, giveback, getList) {
  
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
            "size": demoLocations.length,
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
            "sort": {
                "@timestamp":
                { "order": "desc" }
            }


        }
    }, function getMoreUntilDone(error, response) {
        response.hits.hits.forEach(function (hit) {

            giveback(hit, insertintoCounting, countingList)
        })
        
     replaceTableWarehouseValue(getList(countingList))
    }


    )
}

function getLocationListExposure(countingList) {
    console.log(countingList)
      var warehousecount = 0;
    countingList.features.forEach(function (hit) {
        console.log(hit)
        warehousecount += hit.properties.Exp_TIV
    })
    return warehousecount
}

function insertintoCounting(insert, hit, countingList) {

    if (insert) {
        var location =
            {
                "type": "Feature",
                "properties": hit._source.properties
            }
        countingList.features.push(location)
    }


}