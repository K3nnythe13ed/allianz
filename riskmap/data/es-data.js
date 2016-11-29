$(function () {
    scrollAllforView(pushASingleVesselFromEStoHash)
    VesselTableCounter();
})

var shipCollection = [];


function scrollAllforView(callback) {
    var allTitles = [];
    var today = new Date();
    var todayToEpoch = today.getTime();
    var priorDate = new Date().setDate(today.getDate() - 30)
    // first we do a search, and specify a scroll timeout
    client.search({
        index: 'logstash-*',
        type: 'vessel',
        size: '1000',
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
                        }
                    ]
                }
            }
        }

    }, function getMoreUntilDone(error, response) {
        // collect the title from each response
        response.hits.hits.forEach(function (hit) {
            callback(hit)
            allTitles.push(hit._id)
        });

        if (response.hits.total > allTitles.length) {
            // ask elasticsearch for the next set of hits from this search
            client.scroll({
                scrollId: response._scroll_id,
                scroll: '30s'
            }, getMoreUntilDone);
        } else {
            var latlong = undefined
            setPlayBackTickLen(allTitles.length)
            createPlayback()
            
            showAllVesselsOfPastDayInTable(addAnotherVesseltoTable, latlong)


        }
    });
}


function searchShipCollectionForMMSI(mmsi) {
    var update;
    for (var i = 0; i < shipCollection.length; i++) {
        if (shipCollection[i].properties.MMSI == mmsi) {
            update = i;
        }

    }
    return update
}
function pushASingleVesselFromEStoHash(hit) {
    var update = searchShipCollectionForMMSI(hit._source.MMSI);

    if (update != undefined) {
        shipCollection[update].geometry.coordinates.push(
            [
                hit._source.LOCATION.lon,
                hit._source.LOCATION.lat
            ]
        )
        shipCollection[update].properties.time.push(Date.parse(hit._source["@timestamp"]))
        
        shipCollection[update].properties.speed.push(hit._source.SOG*0.1*1.852)
        shipCollection[update].properties.destination.push(hit._source.DEST)
    }
    else {

        var ship = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [
                        hit._source.LOCATION.lon,
                        hit._source.LOCATION.lat
                    ]
                ]
            },
            "properties": {
                "MMSI": hit._source.MMSI,
                "name": hit._source.NAME,
                "time": [
                    Date.parse(hit._source["@timestamp"])
                ],
                "speed": 
                [
                    hit._source.SOG*0.1*1.852
                ],
                "destination":[
                    hit._source.DEST
                ]
            }
        }
        shipCollection.push(ship)
    }

}
