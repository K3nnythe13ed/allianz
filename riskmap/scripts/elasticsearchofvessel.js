function AmountofVesselsInArea(addAnotherVesseltoTable, latlong, getTotalExposureOfWarehouse, replaceTableValue) {

    var currentPlaybackTime = playbackitem.getTime()
    var priorDate = currentPlaybackTime - (24 * 60 * 60 * 1000)


    topleftlat = latlong[1].lat;
    topleftlon = latlong[1].lng;
    bottomrightlat = latlong[3].lat;
    bottomrightlon = latlong[3].lng;


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
     
        loading = true;
        var index = []
        var counter = 0;
        var exposure = 0;

        data1 = [];

        response.aggregations.dedup.buckets.forEach(function (hit) {
            mmsihit = hit.detime.buckets[0].group_by_geo.buckets.vessel.group_by_geo_docs.hits.hits[0]
            if (mmsihit != undefined) {
                counter += 1
                addAnotherVesseltoTable(mmsihit)
                exposure += mmsihit._source.exposure
            }


        });
        getTotalExposureOfWarehouse(latlong)
        replaceTableValue(counter, percentageCalc(exposure, 15))
        loaddata()
    });

}
function showAllVesselsOfPastDayInTable(callback) {
    var today = playbackitem.getTime()
    
    var priorDate = today - (24 * 60 * 60 * 1000)
    data1 = [];
    pusharray = []
    allMMSI = {};



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
                                    "lte": today,
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
        


        counter = 0;
        // collect the title from each response
        response.hits.hits.forEach(function (hit) {
            pusharray.push(hit._id)
            for (var i = 0; i < shipCollection.length; i++) {
                if (hit._source.MMSI == shipCollection[i].properties.MMSI && !(hit._source.MMSI in allMMSI)) {
                    allMMSI[hit._source.MMSI] = {
                        MMSI: hit._source.MMSI
                    }


                    callback(hit)

                }
            }
        });
        if (response.hits.total > pusharray.length) {
            // ask elasticsearch for the next set of hits from this search
            client.scroll({
                scrollId: response._scroll_id,
                scroll: '30s'
            }, getMoreUntilDone);
        } else {
            
            loading = true;
            replaceTableValue(Object.keys(allMMSI).length, undefined)
            replaceTableWarehouseValue(undefined)
            loaddata()
        }
    });

}
var allMMSI
var loading = false;
var dt;

var data1 = []
function addAnotherVesseltoTable(hit) {

    var pushdata = {
        field1: hit._source.MMSI, field2: percentageCalc(hit._source.exposure, 15), field4: hit._source.NAME, field5: hit._source.IMO
    }
    data1.push(pushdata);
}

function loaddata() {
    if (dt != undefined) {
        dt.clear();
    }
    dt.load(data1);
    loading = false;
}
function percentageCalc(value, per) {
    return value / 100 * per
}