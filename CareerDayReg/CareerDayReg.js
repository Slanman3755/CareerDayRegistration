
if (Meteor.isClient) {
    
    function liveCount(_id, timeslot) {
        var classname = Classes.findOne({_id: _id}).classname;
        var query = {};
        query['classnames.'+timeslot] = classname;
        var count = Students.find(query).fetch().length;
        if(count!=null) {
            return count;
        } else {
            return 0;
        }
    }

    Students = new Meteor.Collection("students");
    Classes = new Meteor.Collection("classes");
    Schools = new Meteor.Collection("schools");
    Clusters = new Meteor.Collection("clusters");
    Timeslots = new Meteor.Collection("timeslots");
    General = new Meteor.Collection("general");
    Codes = new Meteor.Collection("codes");

    Meteor.startup(function(){
        registrationControlMsgUpdate();
        updateNumClasses();
        Session.set('searchedEntries',[]);
        Session.set('selectedEntries',[]);
        Session.set('selectedClasses',[]);
        Session.set('selectedClusters', []);
        Session.set('selectedSchools', []);
        Session.set('registermsg',"");
        Session.set('searchmsg',"");
        Session.set('sortType',0);
        Session.set('maxlength', 0);
        Session.set('isEditingGeneralSettings', false);
        Session.set('addnewclass', false);
        Session.set('addnewentry', false);
        Session.set('addnewcluster', false);
        Session.set('addnewschool', false);
        Session.set('printing', false);
        Session.set('editingNumClasses', false);
        Session.set('selectedListClass', []);
        Session.set('editingMainDescription', false);
    });

    Router.onRun(function(){
        registrationControlMsgUpdate();
        updateNumClasses();
        Session.set('searchedEntries',[]);
        Session.set('selectedEntries',[]);
        Session.set('selectedClasses',[]);
        Session.set('selectedClusters', []);
        Session.set('selectedSchools', []);
        Session.set('registermsg',"");
        Session.set('searchmsg',"");
        Session.set('sortType',0);
        Session.set('maxlength',0);
        Session.set('isEditingGeneralSettings', false);
        Session.set('addnewclass', false);
        Session.set('addnewentry', false);
        Session.set('addnewcluster', false);
        Session.set('addnewschool', false);
        Session.set('printing', false);
        Session.set('editingNumClasses', false);
        Session.set('selectedListClass', []);
        Session.set('editingMainDescription', false);
    });
    
    Template.roster.students = function(){
		return Students.find();
	}

    Template.roster.studentsfirstabc = function(){
        return Students.find({}, {sort: {fname: 1}});
    }

    Template.roster.studentslastabc = function(){
        return Students.find({}, {sort: {lname: 1}});
    }

    Template.roster.studentsschool = function(){
        return Students.find({}, {sort: {schoolname: 1}});
    }

    Template.roster.studentstime = function(){
        return Students.find({}, {sort: {time: -1}});
    }
    
    Template.classes.classes = function(){
        return Classes.find({}, {sort: {classname: 1}});     
    }

    Template.entry.classes = function(){
        return Classes.find({}, {sort: {classname: 1}}); 
    }

    Template.newentry.classes = function(){
        return Classes.find({}, {sort: {classname: 1}}); 
    }

    Template.form.classes = function(){
        return Classes.find({}, {sort: {classname: 1}});
    }

    Template.timeslotlist.classes = function(){
        return Classes.find({}, {sort: {classname: 1}});
    }
    
    Template.timeslotlist.clusters = function(){
        return Clusters.find({}, {sort: {clustername: 1}});
    }

    Template.form.schools = function(){
        return Schools.find({}, {sort: {schoolname: 1}});
    }
    
    Template.entry.schools = function(){
        return Schools.find({}, {sort: {schoolname: 1}});
    }

    Template.newentry.schools = function(){
        return Schools.find({}, {sort: {schoolname: 1}});
    }

    Template.schools.schools = function(){
        return Schools.find({}, {sort: {schoolname: 1}});
    }

    Template.form.clusters = function(){
        return Clusters.find({}, {sort: {clustername: 1}});
    }

    Template.classes.clusters = function(){
        return Clusters.find({}, {sort: {clustername: 1}});
    }

    Template.entry.clusters = function(){
        return Clusters.find({}, {sort: {clustername: 1}});
    }

    Template.newentry.clusters = function(){
        return Clusters.find({}, {sort: {clustername: 1}});
    }

    Template.general.timeslots = function(){
        return Timeslots.find({}, {sort: {slot: 1}});
    }

    Template.general.maindescription = function(){
        return General.findOne().maindescription;
    }

    Template.home.maindescription = function(){
        return General.findOne().maindescription;
    }

    Template.classentry.clusters = function(){
        return Clusters.find({}, {sort: {clustername: 1}});
    }

    Template.newclassentry.clusters = function(){
        return Clusters.find({}, {sort: {clustername: 1}});
    }

    Template.form.RegisterMsg = function(){
        return Session.get('registermsg');
    }
    
    Template.roster.SearchMsg = function(){
        return Session.get('searchmsg');
    }

    Template.controls.ControlMsg = function() {
        return Session.get('controlmsg');
    }

    Template.controls.RegistrationControlButton = function() {
        return Session.get('registrationcontrolbutton');
    }

    Template.codes.codes = function() {
        return Codes.find();
    }

    Handlebars.registerHelper('nametagspage', function(index) {
        var students = Students.find({}, {sort: {schoolname: 1}}).fetch();
        if(students.length>0) {
            students[students.length-1].isFinal = true;
            var pages = [];
            for(var i = 0; i < students.length / 6 + 1; i++) {
                pages.push(students.slice(i * 6, i * 6 + 6));
            }
            return pages;
        }
    });


    Handlebars.registerHelper('queryget', function(collection, data, val, returnData, doParent){
        var query = {};
        query[data] = val;
        if(doParent) return parent[collection].findOne(query)[returnData];
        else return window[collection].findOne(query)[returnData];
    });

    Handlebars.registerHelper('query', function(collection, data, val, doParent){
        var query = {};
        query[data] = val;
        if(doParent) return parent[collection].find(query);
        else return window[collection].find(query);
    });

    Handlebars.registerHelper('editabletimeslots', function(){
        var inputs = [];
        var timeslots = Timeslots.find().fetch();
        for(var i=0; i<Math.min(timeslots.length, Session.get('numClasses')); i++)
            inputs.push({index: i, value: timeslots[i].time});
        for(var i=0; i<Session.get('numClasses')-timeslots.length; i++)
            inputs.push({index: i+timeslots.length, value: ""});
        return inputs;
    });

    window.addEventListener('message', function(e){
        if(e.data=='printed') Session.set('printing', false);
    }, false);

    Handlebars.registerHelper('equals', function(param1, param2){
        return param1===param2;
    });

    Handlebars.registerHelper('contains', function(array, value) {
        return array.indexOf(value) > -1;
    });

    Handlebars.registerHelper('greater', function(param1, param2){
        return param1>param2;
    });

    function loop(n){
        var loop=[];
        for(var i = 0; i<n; i++) loop.push(i);
        return loop;
    }

    Handlebars.registerHelper('loop', loop);

    Handlebars.registerHelper('sortTypeFirstABC', function(){
        return Session.get('sortType')==1;
    });

    Handlebars.registerHelper('sortTypeLastABC', function(){
        return Session.get('sortType')==2;
    });

    Handlebars.registerHelper('sortTypeSchool', function(){
        return Session.get('sortType')==3;
    });

    Handlebars.registerHelper('entrySearched', function(id){
        var searchedEntries = Session.get('searchedEntries');
        if(searchedEntries!=0) {
            return (_.indexOf(searchedEntries, id)>=0);
        } else return true;
    })

    Handlebars.registerHelper('entrySelected', function(id){
        return (_.indexOf(Session.get('selectedEntries'), id)>=0);
    });

    Handlebars.registerHelper('classSelected', function(id){
        return (_.indexOf(Session.get('selectedClasses'), id)>=0);
    });

    Handlebars.registerHelper('clusterSelected', function(id){
        return (_.indexOf(Session.get('selectedClusters'), id)>=0);
    });

    Handlebars.registerHelper('schoolSelected', function(id){
        return (_.indexOf(Session.get('selectedSchools'), id)>=0);
    });

    Template.general.numClasses = function() {
        return Session.get('numClasses');
    }

    Template.form.numClasses = function() {
        return Session.get('numClasses');
    }

    Template.classentry.numClasses = function() {
        return Session.get('numClasses');
    }

    Template.newclassentry.numClasses = function() {
        return Session.get('numClasses');
    }

    Handlebars.registerHelper('editingGeneralSettings', function(){
        return Session.get('isEditingGeneralSettings');
    });

    Handlebars.registerHelper('editingMainDescription', function() {
        return Session.get('editingMainDescription');
    });

    Handlebars.registerHelper('editingNumClasses', function(){
        return Session.get('editingNumClasses');
    });

    Handlebars.registerHelper('listClassSelected', function(id){
        return (_.indexOf(Session.get('selectedListClass'), id)>=0);
    });

    Handlebars.registerHelper('addingNewClass', function(){
        return Session.get('addnewclass');
    });

    Handlebars.registerHelper('addingNewEntry', function(){
        return Session.get('addnewentry');
    });
 
    Handlebars.registerHelper('addingNewCluster', function(){
        return Session.get('addnewcluster');
    });

    Handlebars.registerHelper('addingNewSchool', function(){
        return Session.get('addnewschool');
    });

    Handlebars.registerHelper('printing', function(){
        return Session.get('printing');
    });

    Handlebars.registerHelper('classesheader', function(){
        var students = Students.find().fetch();
        var maxlength = Session.get('maxlength');
        
        for(var i=0; i<students.length; i++) if(maxlength<students[i].classnames.length) maxlength = students[i].classnames.length;
        
        Session.set('maxlength', maxlength);
        
        if(maxlength>0)
            return _.range(1, maxlength+1);
        else {
            return _.range(1, Session.get('numClasses')+1);
        } 
    });

    Handlebars.registerHelper('blankspaces', function(classnames){
        blankspaces = [];
        for(var i = 0; i<(Session.get('maxlength')-classnames.length); i++)  blankspaces.push(i);
        return blankspaces;
    });
   
    Handlebars.registerHelper('timeslot', function(timeslot){
        return Number(timeslot) + 1;
    });

    Handlebars.registerHelper('getCurrentUsername', function(){
        return Meteor.user().username;
    });

    Handlebars.registerHelper('sum', function(param1, param2){
        return param1+param2;
    });

    Handlebars.registerHelper('classSelector', function(clustername, timeslot){
        var classes = Classes.find({classgroup: clustername, classtimeslot: timeslot});
        return classes;
    });

    Handlebars.registerHelper('indexArray', function(array){
        return _.map(array, function(value, key){
            var query = {index: key, value: value};
            return query;
        });
    });

    Handlebars.registerHelper('indexCollection', function(collection){
        return collection.map(function(value, key){
            var query = {index: key, value: value};
            return query;
        });
    });
    
    function registrationControlMsgUpdate() {
        Meteor.call('isRegistrationEnabled', function(error,enabled){
            if(enabled) {
            Session.set('registrationcontrolbutton', "Disable Registration");
                Session.set('controlmsg', "Registration is enabled");
            } else {
                Session.set('registrationcontrolbutton', "Enable Registration");
                Session.set('controlmsg', "Registration is disabled");    
            }
        });
    }

    function updateNumClasses() {
        Meteor.call('getNumClasses', function(error, numClasses){
            Session.set('numClasses',numClasses);
        });
    }

    Handlebars.registerHelper('livecount', liveCount);
    
    Template.admin.events({
        'click .signout': function(){ 
            Meteor.logout();
        },

        'click .login': function(){
            var username = $('input.username').val();
            var password = $('input.password').val();

            Meteor.loginWithPassword(username, password);
        },
        
        'click .getcsv': function(){
            Meteor.call('generateCsvFile', function(error, filename){
                if(error) throw error;
                console.log(filename);
                window.location = '/files/' + filename;
            });
        },

        'click .getcodes': function() {
            Meteor.call('generateCodesCsvFile', function(error, filename) {
                if(error) throw error;
                console.log(filename);
                window.location = '/files/' + filename;
            });
        },
        
        'click .togglereg': function(){
            Meteor.call('toggleRegistrationEnabled', function(error,data){
            
                $('.togglereg').prop('disabled', true);
                setTimeout(function(){
                    registrationControlMsgUpdate()
                    $('.togglereg').prop('disabled', false);
                }, 1000);
            });
        },

        'click .editentry': function(){
            var selectedEntries = Session.get('selectedEntries');
            selectedEntries.push(this._id);
            Session.set('selectedEntries', selectedEntries);
        },

        'click .deleteentry': function(){
            if(confirm("Are you sure you want to delete this entry?")) {
                Students.remove({_id: this._id});
                Session.set('selectedEntries', _.without(Session.get('selectedEntries'), this._id));
            }
        },

        'click .saveentry': function(){ 
            var fname = $('.fnameentry').val();
      		var lname = $('.lnameentry').val();
            var schoolname = $('.schoolnameentry').val();
            var time = $('.timeentry').val();
            var classnames = $.makeArray($('.classnameentry').map(function(){
                return $(this).val();
            }));

            Students.update({_id: this._id},{$set: {fname: fname, lname: lname, schoolname: schoolname, classnames: classnames, time: time}});
            
            Session.set('selectedEntries', _.without(Session.get('selectedEntries'), this._id));
        },

        'click .savenewentry': function(){
            var fname = $('.fnameentry').val();
      		var lname = $('.lnameentry').val();
            var schoolname = $('.schoolnameentry').val();
            var time = $('.timeentry').val();
            var classnames = $.makeArray($('.classnameentry').map(function(){
                return $(this).val();
            }));

            Students.insert({fname: fname, lname: lname, schoolname: schoolname, classnames: classnames, time: time});
            
            Session.set('addnewentry', false);
        },

        'click .cancelentry': function(){
            Session.set('selectedEntries', _.without(Session.get('selectedEntries'), this._id));
        },

        'click .cancelnewentry': function(){
            Session.set('addnewentry', false);
        },

        'click .editclass': function(){
            var selectedClasses = Session.get('selectedClasses');
            selectedClasses.push(this._id);
            Session.set('selectedClasses', selectedClasses);
        },

        'click .deleteclass': function(){
            if(confirm("Are you sure you want to delete this class?")) {
                Classes.remove({_id: this._id});
                Session.set('selectedClasses', _.without(Session.get('selectedClasses'), this._id));
            }
        },

        'click .saveclass': function(error, template){ 
            var classname = $('.classnameentry').val();
            var classroom = $('.classroomentry').val();
      		var classtimeslot = _.map(template.findAll(".classtimeslotbox[type=checkbox]:checked"), function(item) {
                return Number(item.value);
            });
            var classgroup = $('.classgroupentry').val();
            var classdescription = $('.classdescriptionentry').val();
            var classsizelimit = $('.classsizelimitentry').val();
            var classrequired = $('.classrequiredentry').val();

            Classes.update({_id: this._id},{$set: {classname: classname, classroom: classroom, classtimeslot: classtimeslot, classgroup: classgroup, classdescription: classdescription, classsizelimit: classsizelimit, classrequired: classrequired}});
            
            Session.set('selectedClasses', _.without(Session.get('selectedClasses'), this._id));
        },

        'click .savenewclass': function(error, template){
            var classname = $('.classnameentry').val();
      		var classroom = $('.classroomentry').val();
            var classtimeslot = _.map(template.findAll(".classtimeslotbox[type=checkbox]:checked"), function(item) {
                return Number(item.value);
            });
            var classgroup = $('.classgroupentry').val();
            var classdescription = $('.classdescriptionentry').val();
            var classsizelimit = $('.classsizelimitentry').val();
            var classrequired = $('.classrequiredentry').val();

            Classes.insert({classname: classname, classroom: classroom, classtimeslot: classtimeslot, classgroup: classgroup, classdescription: classdescription, classsizelimit: classsizelimit, classrequired: classrequired});
            
            Session.set('addnewclass', false);
        },

        'click .cancelclass': function(){
            Session.set('selectedClasses', _.without(Session.get('selectedClasses'), this._id));
        },

        'click .cancelnewclass': function(){
            Session.set('addnewclass', false);
        },
        
        'click .listclass': function(){
            var selected = Session.get('selectedListClass'),
            self = this;

            if(_.indexOf(selected, this._id)>=0) selected = _.without(selected, this._id);
            else selected.push(this._id);

            Session.set('selectedListClass', selected);

            $('#'+this._id).prop("disabled", true);
            setTimeout(function(){
                $('#'+self._id).prop("disabled", false);
            }, 500);
        },

        'keyup .searchfield': function(){
            var searchtext = String($('.searchfield').val());
            var searchedStudents = Students.find({$or: [{fname: {$regex: searchtext, $options: 'i'}},
                {lname: {$regex: searchtext, $options: 'i'}},
                {schoolname: {$regex: searchtext, $options: 'i'}},
                {classnames: {$regex: searchtext, $options: 'i'}},
                {time: {$regex: searchtext, $options: 'i'}}
                ]}).fetch();
            
            var searchedEntries = [];
            for(var i = 0; i<searchedStudents.length; i++) searchedEntries.push(searchedStudents[i]._id);
            
            if(searchedEntries==0) Session.set('searchmsg',"No entries match your search");
            else Session.set('searchmsg',"");

            Session.set('searchedEntries', searchedEntries);
        },

        'click .timesort': function(){
            Session.set('sortType', 0);
        },

        'click .firstabcsort': function(){
            Session.set('sortType', 1);
        }, 

        'click .lastabcsort': function(){
            Session.set('sortType', 2);
        },

        'click .schoolsort': function(){
            Session.set('sortType', 3);
        },

        'click .addnewclass': function(){
            Session.set('addnewclass',true);
        },

        'click .addnewentry': function(){
            Session.set('addnewentry',true);
        },

        'click .addnewcluster': function(){
            Session.set('addnewcluster',true);
        },

        'click .addnewschool': function(){
            Session.set('addnewschool',true);
        },

        'click .editgeneralsettings': function(){
            Session.set('isEditingGeneralSettings', true);
        },

        'click .savegeneralsettings': function(){
            var timeslots = $.makeArray($('.timeslotentry').map(function(){
                return $(this);
            }));
            
            Meteor.call('clearTimeslots', function(error){
                for(var i = 0; i < timeslots.length; i++){
                    Timeslots.insert({slot: Number(i), time: timeslots[i].val()});
                }
            });
 
            Session.set('isEditingGeneralSettings', false);
        },

        'click .cancelgeneralsettings': function(){
            Session.set('isEditingGeneralSettings', false);
        },

        'click .editnumclasses': function(){
            Session.set('editingNumClasses', true);
        },

        'click .savenumclasses': function(){
            Meteor.call('setNumClasses', Number($('.timeslotsentry').val()), function(error){
                updateNumClasses();
                Session.set('editingNumClasses', false);
            });
        },

        'click .cancelnumclasses': function(){
            Session.set('editingNumClasses', false);
        },

        'click .editcluster': function(){
            var selectedClusters = Session.get('selectedClusters');
            selectedClusters.push(this._id);
            Session.set('selectedClusters', selectedClusters);
        },

        'click .deletecluster': function(){
            if(confirm("Are you sure you want to delete this group?")) {
                Clusters.remove({_id: this._id});
                Session.set('selectedClusters', _.without(Session.get('selectedClusters'), this._id));
            }
        },

        'click .savecluster': function(){ 
            var clustername = $('.clusternameentry').val();

            Clusters.update({_id: this._id},{$set: {clustername: clustername}});
            
            Session.set('selectedClusters', _.without(Session.get('selectedClusters'), this._id));
        },

        'click .savenewcluster': function(){
            var clustername = $('.clusternameentry').val();

            Clusters.insert({clustername: clustername});
             
            Session.set('addnewcluster', false);
        },

        'click .cancelcluster': function(){
            Session.set('selectedClusters', _.without(Session.get('selectedClusters'), this._id));
        },

        'click .cancelnewcluster': function(){
            Session.set('addnewcluster', false);
        },

        'click .editschool': function(){
            var selectedSchools = Session.get('selectedSchools');
            selectedSchools.push(this._id);
            Session.set('selectedSchools', selectedSchools);
        },

        'click .deleteschool': function(){
            if(confirm("Are you sure you want to delete this school?")) {
                Schools.remove({_id: this._id});
                Session.set('selectedSchools', _.without(Session.get('selectedSchools'), this._id));
            }
        },

        'click .saveschool': function(){ 
            var schoolname = $('.schoolnameentry').val();
            var schoolcode = $('.schoolcodeentry').val();

            Schools.update({_id: this._id},{$set: {schoolname: schoolname, schoolcode: schoolcode}});    
            
            Session.set('selectedSchools', _.without(Session.get('selectedSchools'), this._id));
        },

        'click .savenewschool': function(){
            var schoolname = $('.schoolnameentry').val();
            var schoolcode = $('.schoolcodeentry').val();

            Schools.insert({schoolname: schoolname, schoolcode: schoolcode});

            Session.set('addnewschool', false);
        },

        'click .cancelschool': function(){
            Session.set('selectedSchools', _.without(Session.get('selectedSchools'), this._id));
        },

        'click .cancelnewschool': function(){
            Session.set('addnewschool', false);
        },

        'click .printnametags': function(){
            Session.set('printing', true);
        },

        'click .editmaindescription': function() {
            Session.set('editingMainDescription', true);
        },

        'click .cancelmaindescription': function() {
            Session.set('editingMainDescription', false);
        },

        'click .savemaindesciption': function() {
            var main = $('.maindescriptionentry').val();
            Meteor.call('clearGeneral', function(error) {
                General.insert({maindescription: main});    
            });
            Session.set('editingMainDescription', false);
        },

        'click .deletecodes': function() {
            if(confirm("Are you sure you want to delete ALL the generated codes?")) Meteor.call('deleteCodes');
        },

        'click .generatecodes': function() {
            Meteor.call('generateCodes', $('.codequantity').val());
        }
    });
    
	Template.form.events({
    	'click .register': function(){
            
            $('.register').prop("disabled", true);

            var fname = $('.fname').val();
      		var lname = $('.lname').val();
            var schoolcode = $('.schoolcode').val();
            var studentcode = $('.studentcode').val();
            var selectedClasses = $.makeArray($('.classselect').map(function(){
                return $(this).find(":selected").data('meteor-id');
            }));

            Meteor.call('register', fname, lname, schoolcode, studentcode, selectedClasses, function(error, response) {
                if(response == '') {
                    Session.set("registermsg", "");
                    Router.go('success');
                } else {
                    Session.set("registermsg", response);
                }

                setTimeout(function(){
                    $('.register').prop("disabled", false);
                }, 2000);
            });
        }
    })
}

