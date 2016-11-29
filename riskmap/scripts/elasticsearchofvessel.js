var dt;
$(document).ready(function (e) {

    dt = dynamicTable.config('vesselsearch',
        ['field1', 'field2', 'field4', 'field5'],
        ['MMSI', 'Exposure', 'Name', 'IMO'], //set to null for field names instead of custom header names
        'There are no items to list...');
})

var data1 = []
function addAnotherVesseltoTable(hit) {

    var pushdata = {
        field1: hit._source.MMSI, field2: percentageCalc(hit._source.exposure, 15), field4: hit._source.NAME, field5: hit._source.IMO
    }
    data1.push(pushdata);
}




function AmountofVesselsInArea(addAnotherVesseltoTable, latlong, getTotalExposureOfWarehouse, replaceTableValue) {

    var currentPlaybackTime = playbackitem.getTime()
    var priorDate = currentPlaybackTime - (24 * 60 * 60 * 1000)

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
        size: '0',
        body: {
            "sort": {
                "@timestamp": { "order": "desc" }
            },
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
                        }
                    ]
                }
            },
            "aggs": {
                "dedup": {
                    "terms": {
                        "field": "MMSI",
                        "size": Object.keys(shipCollection).length,
                    },
                    "aggs": {
                        "detime": {
                            "date_histogram": {
                                "field": "@timestamp",
                                "interval": "1m",
                                "order": { "_key": "desc" }
                            },
                            "aggs": {
                                "group_by_geo": {
                                    "filters": {
                                        "filters":
                                        {
                                            "vessel": {
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
                                        }
                                    },
                                    "aggs": {
                                        "group_by_geo_docs": {
                                            "top_hits": {
                                                "size": 1,
                                                "sort": [
                                                    {
                                                        "@timestamp": {
                                                            "order": "desc"
                                                        }
                                                    }
                                                ]
                                            }



                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }


    }, function getMoreUntilDone(error, response) {
        
        var index = []
        var counter = 0;
        var exposure = 0;
        if (dt != undefined) {
            dt.clear();
        }
        data1 = [];

        response.aggregations.dedup.buckets.forEach(function (hit) {
            mmsihit = hit.detime.buckets[0].group_by_geo.buckets.vessel.group_by_geo_docs.hits.hits[0]
            
            if (mmsihit != undefined) {
                counter += 1
                    console.log(mmsihit)
                addAnotherVesseltoTable(mmsihit)
                exposure += mmsihit._source.exposure
            }

        });
        getTotalExposureOfWarehouse(latlong)
        replaceTableValue(counter, percentageCalc(exposure, 15))

        dt.load(data1);

    });

}

function percentageCalc(value, per) {
    return value / 100 * per
}
















function showAllVesselsOfPastDayInTable(callback, latlong) {

    var today = new Date(playbackitem.getTime());
    var todayToEpoch = today.getTime();
    var priorDate = new Date().setDate(today.getDate() - 30)


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
        var allMMSI = {};
        // collect the title from each response
        response.hits.hits.forEach(function (hit) {
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

            replaceTableValue(Object.keys(allMMSI).length, undefined)
            replaceTableWarehouseValue(undefined)

            dt.load(data1);

        }
    });

}