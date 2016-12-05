$(function () {
  createLocationCollection(CreateMapLayerMarker, insertintoCollection)
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
      console.log(hit)
     giveback(hit, demoLocations)
    }
    )
    CreateMapLayerMarker()
  }
  )
}

function insertintoCollection(hit, list)
{
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