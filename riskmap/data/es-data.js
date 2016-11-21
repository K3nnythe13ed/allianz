$(function () {
    scrollAllforView(pushASingleVesselFromEStoHash)

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
            createVesselforCollectionTimeBased(createPlayback, countVessels);
        }
    });
}




function pushASingleVesselFromEStoHash(hit) {
    if (Object.keys(vesselCollection).length <= maxVessels && !(hit._source.MMSI in vesselCollection)) {
        timeData = Date.parse(hit._source["@timestamp"])

        vesselCollection[hit._source.MMSI] = {
            
            coord: [[
                hit._source.LOCATION.lon,
                hit._source.LOCATION.lat
            ]],
            time:
            [
                timeData
            ],
            MMSI: hit._source.MMSI

        };
    }
    else {
        if (hit._source.MMSI in vesselCollection) {
            timeData = Date.parse(hit._source["@timestamp"]);

            vesselCollection[hit._source.MMSI].coord.push(
                [
                    hit._source.LOCATION.lon,
                    hit._source.LOCATION.lat
                ]

            );

            vesselCollection[hit._source.MMSI].time.push(
                timeData
            );

        }
    }
}

function createVesselforCollectionTimeBased(playback, callbacklist) {

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
     var latlong = undefined
    callbacklist(VesselTableCounter, getAllVessels, latlong)
}   
