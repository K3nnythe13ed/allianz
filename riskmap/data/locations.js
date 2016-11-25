$(function () {
  createLocationCollection(CreateMapLayerMarker, addLocationToList)
})
var demoLocations
function createLocationCollection(CreateMapLayerMarker, giveback) {


  client.search({
    index: 'logstash-*',
    type: 'warehouse',
    size: '1000',
    body: {
      "sort": {
        "@timestamp":
        { "order": "desc" }
      }
    }

  }, function run(error, response) {

    demoLocations = {
      "type": "FeatureCollection",
      "features": [
      ]
    };




    response.hits.hits.forEach(function (hit) {
     giveback(hit, insertintoCollection, demoLocations)
    }
    )
    CreateMapLayerMarker()
  }
  )
}
function addLocationToList(hit, doActionOnSingleLocation, list)
{
  
   var insert = true;
      list.features.forEach(function (feature) {
        if (hit._source.properties.LocID == feature.properties.LocID) {
          insert = false
          
        }
        
      })
  doActionOnSingleLocation(insert, hit, list)
      
}
function insertintoCollection(insert, hit, list)
{
  if (insert) {
        var location =
          {
            "timestamp": hit._source["@timestamp"],
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": hit._source.geometry.coordinates,
            },

            "properties": hit._source.properties
          }
        list.features.push(location)
      }

}