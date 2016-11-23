//call function on start
function createPlayback() {
   // var shipCollection = demoAis;
    var newdate = shipCollection[0].properties.time[0]

    var newendTime = shipCollection[0].properties.time[shipCollection[0].properties.time.length - 1]

    var bigship = L.icon({
        iconUrl: '../images/marker.png',
        iconSize: [8, 13], // size of the icon
        iconAnchor: [4, 13], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -20] // point from which the popup should open relative to the iconAnchor
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


        dateControl: true,
        orientIcons: true,
        popups: true,
        tracksLayer: false,
        tickLen: 5000,
        maxInterpolationTime: 2 * 60 * 1000,

        // layer and marker options
        layer: {
            pointToLayer: function (featureData, latlng) {
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
            getPopup: function (featureData) {
                var result = '';

                if (featureData && featureData.properties && featureData.properties.title) {
                    result = featureData.properties.title;
                }

                return result;
            },
            smoothFactor: 1

        }

    };

    // Initialize playback
    var playback = new L.Playback(map, null, onPlaybackTimeChange, playbackOptions);
    SaveMyPlayback(playback);
    playback.setData(shipCollection);
    




    // Set timeline time change event, so cursor is set after moving custom time (blue)
    timeline.on('timechange', onCustomTimeChange);

    // A callback so timeline is set after changing playback time
    function onPlaybackTimeChange(ms) {
        timeline.setCustomTime(new Date(ms));
        //countVesselsBasedOnHash(addAnotherVesseltoTable, latlong, playbackitem.getTime())
    };

    function onCustomTimeChange(properties) {
        if (!playback.isPlaying()) {
            playback.setCursor(properties.time.getTime());
            //countVesselsBasedOnHash(addAnotherVesseltoTable, latlong, playbackitem.getTime())
        }
    }

}

var playbackitem;
//change Speed of playback
function changeSpeed(value) {
    playbackitem.setSpeed(parseFloat(value));
}
//use to save playback for later use
function SaveMyPlayback(playback) {
    playbackitem = playback;
}
//not used yet
function handleFadeout(cb) {


}


//change speed of playback by clicking the faster button
function changeFaster() {
    var speed = playbackitem.getSpeed();
    if (speed <= 10) {
        playbackitem.setSpeed(speed + 15);
    }
    else {
        if (speed <= 25) {
            playbackitem.setSpeed(speed + 25);
        } else {
            if (speed <= 50) {
                playbackitem.setSpeed(speed + 50);
            }
            else {
                if (speed <= 100) {
                    playbackitem.setSpeed(speed + 900);
                }
            }
        }
    }
}
//change speed of playback by clicking the slower button
function changeSlower() {
    var speed = playbackitem.getSpeed();
    if (speed >= 1000) {
        playbackitem.setSpeed(speed - 900);
    }
    else {
        if (speed >= 100) {
            playbackitem.setSpeed(speed - 50);
        } else {
            if (speed >= 50) {
                playbackitem.setSpeed(speed - 25);
            }
            else {
                if (speed >= 25) {
                    playbackitem.setSpeed(speed - 15);
                }
            }
        }
    }
}
//change play/pause by clicking the play/pause-button
function changePlay() {
   
    if (playbackitem.isPlaying()) {
        playbackitem.stop();

    }
    else {

        playbackitem.start();
        playbackitem.setSpeed(10);
        
    }
}
