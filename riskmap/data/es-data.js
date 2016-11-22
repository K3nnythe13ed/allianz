$(function () {
    scrollAllforView(pushASingleVesselFromEStoHash)
    VesselTableCounter();
})


var vesselCollection = {}
var shipCollection = [];


function scrollAllforView(callback) {
    var allTitles = [];
    var today = new Date();
    var todayToEpoch = today.getTime();
    var priorDate = new Date().setDate(today.getDate() - 30)
    // first we do a search, and specify a scroll timeout
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

        if (30000 > allTitles.length) {
            // ask elasticsearch for the next set of hits from this search
            client.scroll({
                scrollId: response._scroll_id,
                scroll: '30s'
            }, getMoreUntilDone);
        } else {
            var latlong = undefined
            createPlayback()
            countVesselsBasedOnHash(addAnotherVesseltoTable, latlong)
           // createVesselforCollectionTimeBased(createPlayback, countVesselsBasedOnHash);
            
        }
    });
}




function pushASingleVesselFromEStoHash(hit) {
    var update;
    for(var i = 0; i<shipCollection.length; i++)
    {
        if(shipCollection[i].properties.MMSI == hit._source.MMSI){
            update = i;
        }
       
    }
    if(update != undefined)
    {
        shipCollection[update].geometry.coordinates.push(
            [
                 hit._source.LOCATION.lon,
                 hit._source.LOCATION.lat
            ]
        )
        shipCollection[update].properties.time.push(Date.parse(hit._source["@timestamp"]))
    }
    else{
        
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
                "MMSI":  hit._source.MMSI,
                "time":  [
                    Date.parse(hit._source["@timestamp"])
                    ]
        }
    }
    
    shipCollection.push(ship)
    }

}
