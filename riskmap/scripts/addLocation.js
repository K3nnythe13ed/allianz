
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

$(function () {
    $('#saveloc').click(function () {

        $('#locationform').data('formValidation').validate();

        if ($('#locationform').data('formValidation').isValid()) {
            var locname = document.getElementById("locname").value;
            var locid = document.getElementById("locid").value;
            var locexp = document.getElementById("locexp").value;
            var locrisk = document.getElementById("locrisc").value;
            var loclat = parseFloat(document.getElementById("loclat").value);
            var loclon = parseFloat(document.getElementById("loclon").value);
            var locoe = document.getElementById("locoe").value;
            createANewLocation(locname, locid, locexp, locrisk, loclat.toPrecision(12), loclon.toPrecision(12), locoe, createLocationCollection)
            $('#myModal').modal('hide');

        }
    });
});

$('#myModal').on('hidden.bs.modal', function () {

    $(this).find('form')[0].reset();
    $('#locationform').formValidation('resetForm', true);
});



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
        client.indices.refresh({
            index: 'logstash-constant'
        }, function (err, results) {

            markerLayer.clearLayers();
            demoLocations = null;
            createLocationCollection(CreateMapLayerMarker, insertintoCollection)

        }

        )

    })


}

function MarkersetLatLng(e) {
    var $modal = $('#myModal'),
        $latitude = $modal.find('#loclat');
    $longitude = $modal.find('#loclon');
    $latitude.val(e.layer._latlng.lat);
    $longitude.val(e.layer._latlng.lng);
    $modal.modal("show");
}

function EditLocation(name, id, risk, oe, exp, lat, lon) {
    var $modal = $('#myModal'),

        $locname = $modal.find('#locname');
    $locname.val(name);
    $locid = $modal.find('#locid');
    $locid.val(id);
    $locrisc = $modal.find('#locrisc');
    $locrisc.val(risk);
    $locoe = $modal.find('#locoe');
    $locoe.val(oe);
    $locexp = $modal.find('#locexp');
    $locexp.val(exp);
    $loclon = $modal.find('#loclon');
    $loclon.val(lon);
    $loclat = $modal.find('#loclat');
    $loclat.val(lat);
    $modal.modal("show");

}

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