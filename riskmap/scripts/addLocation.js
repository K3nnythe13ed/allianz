$(document).ready(function() {

    dt = dynamicTable.config('vesselsearch',
        ['field1', 'field2', 'field4', 'field5'],
        ['MMSI', 'Exposure', 'Name', 'IMO'], //set to null for field names instead of custom header names
        'There are no items to list...');

 


    });


   $(function() {
        $('#saveloc').click(function() {
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
                            }
                        }
                    },
                    lrisc: {
                        validators: {
                            notEmpty: {
                                message: 'The Location Risk is required'
                            }
                        }
                    }

                }
            });
$('#locationform').data('formValidation').validate();

              if($('#locationform').data('formValidation').isValid())
              {
                $('#myModal').modal('hide');
              }
            });
        });



$('#drawloc').click(function() {
    $('#myModal').modal('hide');

});





