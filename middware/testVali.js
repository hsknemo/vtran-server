 const Valider = require('./Validator.js');

let valider = new Valider({
    valideMap: {
        'parking_license_id': {
            type: 'String',
            required: true,
            value: "23424"
        },
    }
})
 valider.valideListAction()
