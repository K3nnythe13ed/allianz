//call function on start
var ticklen

function setPlayBackTickLen(amountofhits) {

    ticklen = Math.ceil(amountofhits / 400)

}
function getTickLen() {
    return Math.ceil(ticklen / 10) * 1000

}
function createPlayback() {
    var newdate = shipCollection[0].properties.time[0]
    var newendTime = shipCollection[0].properties.time[shipCollection[0].properties.time.length - 1]

    var bigship = L.icon({
        iconUrl: '../images/marker.png',
        iconSize: [10, 15], // size of the icon
        iconAnchor: [5, 15], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -22] // point from which the popup should open relative to the iconAnchor
    });

    for (i = 1; i < shipCollection.length; i++) {

        if (newdate > shipCollection[i].properties.time[0]) {
            newdate = shipCollection[i].properties.time[0]
        }
        if (newendTime < shipCollection[i].properties.time[shipCollection[i].properties.time.length - 1]) {
            newendTime = shipCollection[i].properties.time[shipCollection[i].properties.time.length - 1]
        }

    }
    var startTime = new Date(newdate);
    var endTime = new Date(newendTime);
    // Get start/end times


    // Create a DataSet with data
    var timelineData = new vis.DataSet([{ start: startTime, end: endTime, content: 'AIS Tracking' }]);

    // Set timeline options
    var timelineOptions = {
        "width": "100%",
        "height": "120px",
        "style": "box",
        "axisOnTop": true,
        "showCustomTime": true
    };

    // Setup timeline
    var timeline = new vis.Timeline(document.getElementById('timeline'), timelineData, timelineOptions);


    timeline.setCustomTime(startTime);


    // Playback options
    var playbackOptions = {

        orientIcons: true,
        dateControl: true,
        popups: true,
        tracksLayer: false,
        tickLen: getTickLen(),
        fadeMarkersWhenStale: true,
        staleTime: 10 * 60 * 1000,
        maxInterpolationTime: 10 * 60 * 1000,

        // layer and marker options
        layer: {
            pointToLayer: function(featureData, latlng) {
                var result = {};

                if (featureData && featureData.properties && featureData.properties.path_options) {
                    result = featureData.properties.path_options;
                }

                if (!result.radius) {
                    result.radius = 5;
                }

                return new L.CircleMarker(latlng, result);
            }
        },

        marker: {
            icon: bigship,
            riseOnHover: true,
            getPopup: function(featureData) {
                var result = '';

                if (featureData && featureData.properties && featureData.properties.MMSI) {
                    result = "<table id='popup'><tr><td> <label>MMSI:</label> </td><td align='right'>" + featureData.properties.MMSI + "</td></tr>" +
                        "<tr><td> <label>Name:</label> </td><td align='right'>" + featureData.properties.name + "</td></tr>" +
                        "<tr><td><label>Exposure: </label></td><td align='right'>" + featureData.properties.exposure + "  </td></tr>" +
                        "<tr><td><label>Vesselinformation: </label></td><td><a href='http://www.marinetraffic.com/en/ais/details/ships/mmsi:"+featureData.properties.MMSI+"' target='_blank'>info</a></td></tr>"+
                        "</table>";
                }

                return result;
            }


        }
    }

    // Initialize playback
    var playback = new L.Playback(map, null, onPlaybackTimeChange, playbackOptions);
    SaveMyPlayback(playback);
    playback.setData(shipCollection);





    // Set timeline time change event, so cursor is set after moving custom time (blue)
    timeline.on('timechange', onCustomTimeChange);
    // Set Table Value after time has changed
    timeline.on('timechanged', onChange);
    // A callback so timeline is set after changing playback time
    function onPlaybackTimeChange(ms) {
        timeline.setCustomTime(new Date(ms));

    };
    //update Table based on geobox
    function onChange(properties) {
        if (latlong != undefined) {
            AmountofVesselsInArea(addAnotherVesseltoTable, latlong, getTotalExposureOfWarehouse, replaceTableValue)
        }
        else {
            showAllVesselsOfPastDayInTable(addAnotherVesseltoTable)
        }
    }
    function onCustomTimeChange(properties) {


        playback.setCursor(properties.time.getTime());



    }

}



var playbackitem;
//use to save playback for later use
function SaveMyPlayback(playback) {
    playbackitem = playback;

}
var showplayspeed = 1
//change speed of playback by clicking the faster button
function changeFaster() {
    if (playbackitem.isPlaying()) {
        var speed = playbackitem.getSpeed();
        if (showplayspeed < 16) {
            playbackitem.setSpeed(speed * 2);
            showplayspeed = showplayspeed * 2
            replaceTableValueOfPlayback(showplayspeed + " x")
        }
    }

}
//change speed of playback by clicking the slower button
function changeSlower() {
    if (playbackitem.isPlaying()) {
        var speed = playbackitem.getSpeed();
        if (showplayspeed > 1) {
            playbackitem.setSpeed(speed / 2)
            showplayspeed = showplayspeed / 2
            replaceTableValueOfPlayback(showplayspeed + " x")
        }
    }


}
//change play/pause by clicking the play/pause-button
function changePlay() {

    if (playbackitem.isPlaying()) {
        speed = playbackitem.getSpeed()
        playbackitem.stop();
        replaceTableValueOfPlayback("0")

        if (latlong != undefined) {
            AmountofVesselsInArea(addAnotherVesseltoTable, latlong, getTotalExposureOfWarehouse, replaceTableValue)
        }
        else {
            showAllVesselsOfPastDayInTable(addAnotherVesseltoTable)
        }

    }
    else {
        playbackitem.start();
        playbackitem.setSpeed(getTickLen() / 1000);
        showplayspeed = 1;
        replaceTableValueOfPlayback(showplayspeed+" x")
    }
    replacePlayButton();
}
