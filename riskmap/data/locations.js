var demoLocations = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates":
        [
          9.988552,
          53.543712

        ]

      },
      "properties": {
        "LocID": 1,
        "OE": "DE",
        "AccountName": "Test 1",
        "Entire": ", DE,  0,  0,  0",
        "Exp_TIV": 1000000,
        "ML_AGCS_Share": "",
        "MR_RISK_SCORE": 4,
        "AddrMatch": "",
        "AAL_PreCat_EQ": "",
        "AAL_PreCat_FL": "",
        "AAL_PreCat_WS": ""
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -74.009413,
          40.707517


        ]
      },
      "properties": {
        "LocID": 2,
        "OE": "US",
        "AccountName": "Test 2",
        "Entire": ", US,  0,  0,  0",
        "Exp_TIV": 5000000,
        "ML_AGCS_Share": "",
        "MR_RISK_SCORE": 3,
        "AddrMatch": "",
        "AAL_PreCat_EQ": "",
        "AAL_PreCat_FL": "",
        "AAL_PreCat_WS": ""
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          117.802829,
          39.013322

        ]
      },
      "properties": {
        "LocID": 3,
        "OE": "DE",
        "AccountName": "Test 3",
        "Entire": ", CN,  0,  0,  0",
        "Exp_TIV": 7500000,
        "ML_AGCS_Share": "",
        "MR_RISK_SCORE": 4,
        "AddrMatch": "",
        "AAL_PreCat_EQ": "",
        "AAL_PreCat_FL": "",
        "AAL_PreCat_WS": ""
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          4.449863,
          51.892873

        ]
      },
      "properties": {
        "LocID": 4,
        "OE": "DE",
        "AccountName": "Test 4",
        "Entire": ", NL,  0,  0,  0",
        "Exp_TIV": 10000000,
        "ML_AGCS_Share": "",
        "MR_RISK_SCORE": 4,
        "AddrMatch": "",
        "AAL_PreCat_EQ": "",
        "AAL_PreCat_FL": "",
        "AAL_PreCat_WS": ""
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          7.0895148,
          50.7575752


        ]
      },
      "properties": {
        "LocID": 5,
        "OE": "DE",
        "AccountName": "Self Creation",
        "Entire": ", NL,  0,  0,  0",
        "Exp_TIV": 4000000,
        "ML_AGCS_Share": "",
        "MR_RISK_SCORE": 2,
        "AddrMatch": "",
        "AAL_PreCat_EQ": "",
        "AAL_PreCat_FL": "",
        "AAL_PreCat_WS": ""
      }
    }
  ]
}

$(function () {
    createLocationCollection(CreateMapLayerMarker)
})
function createLocationCollection(CreateMapLayerMarker)
{


client.search({
  index: 'riskmap-*',
  type: 'warehouse',
  size: '1000',
  body: {
    "query": {
      "bool": {
      }
    }
  }

}, function run(error, response) {
  var demoLocations = {
    "type": "FeatureCollection",
    "features": [
      
      
    ]
  }


  response.hits.forEach(function(hit) {
     var location =
     {
     "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": hit.geometry.coordinates,
            },
            
            "properties": hit.properties
     }

      demoLocations.features.push(location)
     }
      ,this);
      })

CreateMapLayerMarker()
}