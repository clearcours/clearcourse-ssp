Ext.define('Ssp.model.tool.studentintake.PersonDemographics', {
    extend: 'Ssp.model.AbstractBase',
    fields: [{name: 'personId', type: 'string'},
             {name: 'coachId', type: 'string'},
             {name: 'maritalStatusId', type: 'string'},
             {name: 'citizenshipId', type: 'string'},
             {name: 'ethnicityId', type: 'string'},
             {name: 'veteranStatusId', type: 'string'},
             {name: 'primaryCaregiver', type: 'boolean'},
             {name: 'childCareNeeded', type: 'boolean'},
             {name: 'employed', type: 'boolean'},
             {name: 'numberOfChildren', type: 'int'},	 
             {name: 'countryOfResidence', type: 'string'},
             {name: 'paymentStatus', type: 'string'},
             {name: 'gender', type: 'string'},
             {name: 'countryOfCitizenship', type: 'string'},
             {name: 'childAges', type: 'string'},
             {name: 'placeOfEmployment', type: 'string'},
             {name: 'shift', type: 'string'},
             {name: 'wage', type: 'string'},
             {name: 'totalHoursWorkedPerWeek', type: 'int'},
             {name: 'local', type: 'string'},
             {name: 'childCareArrangementId', type: 'string'}]
});