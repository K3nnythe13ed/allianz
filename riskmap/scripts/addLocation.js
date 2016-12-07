// validation options for the form locationform off bootstrap modal
$('#locationform').formValidation({
    framework: 'bootstrap',
    excluded: ':disabled',
    icon: {
        valid: 'glyphicon glyphicon-ok',
        invalid: 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields: {
        lname: {
            validators: {
                notEmpty: {
                    message: 'The Location Name is required'
                }
            }
        },
        lid: {
            validators: {
                notEmpty: {
                    message: 'The Location ID is required'
                },
                digits: {
                    message: 'The Location ID does allow digits only',

                },
                callback: {
                    message: 'The ID is invalid',
                    callback: function (value, validator, $field) {

                        var test = true;
                        if (document.getElementById("lochidden").value == "new") {
                            for (i = 0; i < demoLocations.features.length; i++) {
                                if (demoLocations.features[i].properties.LocID == value) {
                                    test = false;
                                }
                            }

                            return {
                                valid: test,       // or true
                                message: 'Location ID already exists. To update an existing Location use the edit function. Recommended to use LocID: ' + (parseFloat(demoLocations.features[0].properties.LocID) + 1)
                            }

                        }
                        else {
                            return {
                                valid: true,       // or true
                                message: 'Other error message'
                            }

                        }
                    }
                }
            }
        },
        lexp: {
            validators: {
                notEmpty: {
                    message: 'The Location Exposure is required'
                },
                digits: {
                    message: 'The value is not a valid number. Required: f.e. 40000000',

                },
                stringLength: {
                    min: 3
                }
            }
        },
        lrisc: {
            validators: {
                notEmpty: {
                    message: 'The Location Risk is required'
                },
                stringLength: {
                    max: 1,
                    message: 'Please enter a valid Nathan Risk Score'
                }
            }
        },
        loe: {
            validators: {
                notEmpty: {
                    message: 'The Location OE is required'
                }
            }
        },
        llat: {
            validators: {
                notEmpty: {
                    message: 'The Latitude is required'
                },
                between: {
                    min: -90,
                    max: 90,
                    message: 'The latitude must be between -90.0 and 90.0'
                }
            }
        },
        llon: {
            validators: {
                notEmpty: {
                    message: 'The Longitude is required'
                },
                between: {
                    min: -180,
                    max: 180,
                    message: 'The longitude must be between -180.0 and 180.0'
                }
            }
        }

    }
});
//calling a function to listen to the save buttton
$(function () {

    $('#saveloc').click(function () {

        //validate locationform
        $('#locationform').data('formValidation').validate();
        //isValid returns true if validate was successful
        if ($('#locationform').data('formValidation').isValid()) {
            var locname = document.getElementById("locname").value;
            var locid = document.getElementById("locid").value;
            var locexp = document.getElementById("locexp").value;
            var locrisk = document.getElementById("locrisc").value;
            var loclat = parseFloat(document.getElementById("loclat").value);
            var loclon = parseFloat(document.getElementById("loclon").value);
            var locoe = document.getElementById("locoe").value;
            //call functon to create a new Location
            createANewLocation(locname, locid, locexp, locrisk, loclat.toPrecision(12), loclon.toPrecision(12), locoe, createLocationCollection)
            $('#myModal').modal('hide');

        }
    });
});
// remove all input values from Modal after Modal has been hidden
$('#myModal').on('hidden.bs.modal', function () {

    $(this).find('form')[0].reset();
    $('#locationform').formValidation('resetForm', true);
});


//create new location using the es client
function createANewLocation(locname, locid, locexp, locrisk, loclat, loclon, locoe, createLocationCollection) {
    var today = new Date();
    client.index({
        index: 'logstash-constant',
        type: 'warehouse',
        id: locid,
        body: {
            "@timestamp": today,
            "exposure": locexp,
            "geometry": {
                "coordinates": [
                    loclon,
                    loclat
                ],
                "type": "Point"
            },
            "id": locid,
            "properties": {
                "AAL_PreCat_EQ": "",
                "AAL_PreCat_WS": "",
                "ML_AGCS_Share": "",
                "Entire": ", " + locoe + ",  0,  0,  0",
                "Exp_TIV": locexp,
                "OE": locoe,
                "MR_RISK_SCORE": locrisk,
                "LocID": locid,
                "AAL_PreCat_FL": "",
                "AddrMatch": "",
                "AccountName": locname
            }
        }



    }, function (err, results) {
        //refresh index. Required based on the asynchronous input of es client
        client.indices.refresh({
            index: 'logstash-constant'
        }, function (err, results) {
            //clear marker Layer to add a new Layer using the updated index
            markerLayer.clearLayers();
            demoLocations = null;
            createLocationCollection(CreateMapLayerMarker, insertintoCollection)
        })
    })


}
//used by leaflet draw on marker create parse lat lon to bootstrap modal
function MarkersetLatLng(e) {
    var $modal = $('#myModal'),
    $loct = $modal.find('#loctitle');
        $locid = $modal.find('#locid');
    $loclat = $modal.find('#loclat');
    $loclon = $modal.find('#loclon');
    $lonhidden = $modal.find('#lochidden');
    $locoe = $modal.find('#locoe');

    $locoe.removeAttr('readonly');
    $locid.removeAttr('readonly');
    $loclon.removeAttr('readonly');
    $loclat.removeAttr('readonly');

    var newlocid = parseFloat(demoLocations.features[0].properties.LocID) + 1;
    $locid.val(newlocid);
    $loct.innerHTML = ("Create a new Location");
    $lonhidden.val("new");
    $loclat.val(e.layer._latlng.lat);
    $loclon.val(e.layer._latlng.lng);

    $modal.modal("show");
}
//edit Location used by marker popup binding.
function EditLocation(name, id, risk, oe, exp, lat, lon) {
    var $modal = $('#myModal'),
        $loct = $modal.find('#loctitle');
        $locname = $modal.find('#locname');
        $locid = $modal.find('#locid');
        $locrisc = $modal.find('#locrisc');
        $locoe = $modal.find('#locoe');
        $locexp = $modal.find('#locexp');
        $loclon = $modal.find('#loclon');
        $loclat = $modal.find('#loclat');
    $loct.innerHTML = ("Edit a Location");
    $locname.val(name);
    $locid.val(id);   
    $locrisc.val(risk);
    $locoe.val(oe);
    $locexp.val(exp);
    $loclon.val(lon);
    $loclat.val(lat);


    $locoe.attr('readonly', 'readonly');
    $locid.attr('readonly', 'readonly');
    $loclon.attr('readonly', 'readonly');
    $loclat.attr('readonly', 'readonly');
    $modal.modal("show");

}
//delete location using es client
function onDelete(id) {
    client.delete({
        index: 'logstash-constant',
        type: 'warehouse',
        id: id
    }, function (error, response) {
        client.indices.refresh({
            index: 'logstash-constant'
        }, function (err, results) {

            markerLayer.clearLayers();
            demoLocations = null;
            createLocationCollection(CreateMapLayerMarker, insertintoCollection)

        }

        )
    });
}


