$(function () {
  createLocationCollection(CreateMapLayerMarker)
})
var demoLocations
function createLocationCollection(CreateMapLayerMarker) {


  client.search({
    index: 'logstash-*',
    type: 'warehouse',
    size: '1000',
    body: {
      "sort": { "@timestamp": { "order": "desc" } }
    }

  }, function run(error, response) {
    
    demoLocations = {
      "type": "FeatureCollection",
      "features": [
      ]
    };
     
    


    response.hits.hits.forEach(function (hit) {
      var location =
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": hit._source.geometry.coordinates,
          },

          "properties": hit._source.properties
        }
      demoLocations.features.push(location)
    }
  )
 CreateMapLayerMarker()
}
  )}
