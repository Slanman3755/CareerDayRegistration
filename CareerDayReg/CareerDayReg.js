Students = new Meteor.Collection("students");
Classes = new Meteor.Collection("classes");
Schools = new Meteor.Collection("schools");

var classnames = ["Math",
                    "Science",
                    "English",
                    "French",
                    "History",
                    "Art"];

var schoolcodes = ["10001","10002","10003","10004","10005"];

var schoolnames = [ "Richmond High School",
                    "Centerville High School",
                    "Northeastern High School",
                    "Lincoln High School",
                    "Seton Catholic High School"]

//Accounts.config({forbidClientAccountCreation: true});

if (Meteor.isClient) {

    Meteor.startup(function(){
        registrationControlMsgUpdate();
        Session.set('searchedEntries',[]);
        Session.set('selectedEntries',[]);
        Session.set('selectedClasses',[]);
        Session.set('registermsg',"");
        Session.set('searchmsg',"");
        Session.set('sortType',0);
    });

    Router.onRun(function(){
        registrationControlMsgUpdate();
        Session.set('searchedEntries',[]);
        Session.set('selectedEntries',[]);
        Session.set('selectedClasses',[]);
        Session.set('registermsg',"");
        Session.set('searchmsg',"");
        Session.set('sortType',0);
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

    Template.roster.studentsclass1 = function(){
        return Students.find({}, {sort: {classnames: 1}});
    }

    Template.roster.studentsclass2 = function(){
        return Students.find({}, {sort: {classnames: 1}});
    }

    Template.roster.studentsclass3 = function(){
        return Students.find({}, {sort: {classnames: 1}});
    }

    Template.roster.studentstime = function(){
        return Students.find({}, {sort: {time: -1}});
    }

    Template.schedule.classes = function(){
        return Classes.find({}, {sort: {classname: 1}});     
    }

    Template.form.classes = function(){
        return Classes.find({}, {sort: {classname: 1}});
    }

    Template.form.schools = function(){
        return Schools.find();
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
    
    Handlebars.registerHelper('sortTypeFirstABC', function(){
        return Session.get('sortType')==1;
    });

    Handlebars.registerHelper('sortTypeLastABC', function(){
        return Session.get('sortType')==2;
    });

    Handlebars.registerHelper('sortTypeSchool', function(){
        return Session.get('sortType')==3;
    });

    Handlebars.registerHelper('sortTypeClass1', function(){
        return Session.get('sortType')==4;
    });

    Handlebars.registerHelper('sortTypeClass2', function(){
        return Session.get('sortType')==5;
    });

    Handlebars.registerHelper('sortTypeClass3', function(){
        return Session.get('sortType')==6;
    });

    Handlebars.registerHelper('entrySearched', function(id){
        var searchedEntries = Session.get('searchedEntries');
        if(searchedEntries!=0) {
            return (_.indexOf(searchedEntries, id)>=0);
        } else return true;
    });

    Handlebars.registerHelper('entrySelected', function(id){
        return (_.indexOf(Session.get('selectedEntries'), id)>=0);
    });

    Handlebars.registerHelper('classSelected', function(id){
        return (_.indexOf(Session.get('selectedClasses'), id)>=0);
    });

    Handlebars.registerHelper('classesheader', function(){
        var students = Students.find().fetch();
        if(students.length>0)
            return _.range(1, students[0].classnames.length+1);
        else return [];
    });
   
    Handlebars.registerHelper('timeslot', function(timeslot){
        if(timeslot==0) return "All"
        else return timeslot;
    });

    Handlebars.registerHelper('getCurrentUsername', function(){
        return Meteor.user().emails[0].address;
    });

    function liveCount(_id) {
        var classname = Classes.findOne({_id: _id}).classname;
        var count = Students.find({classnames: classname}).fetch().length;
        if(count!=null)
            return count;
        else
            return 0;
    }

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
        
        'click .togglereg': function(){
            Meteor.call('toggleRegistrationEnabled', function(error,data){
            
                $('.togglereg').prop('disabled', true);
                setTimeout(function(){
                    registrationControlMsgUpdate()
                    $('.togglereg').prop('disabled', false);
                }, 3000);
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

            Students.update({_id: this._id},{fname: fname, lname: lname, schoolname: schoolname, classnames: classnames, time: time});
            
            Session.set('selectedEntries', _.without(Session.get('selectedEntries'), this._id));
        },

        'click .cancelentry': function(){
            Session.set('selectedEntries', _.without(Session.get('selectedEntries'), this._id));
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

        'click .saveclass': function(){ 
            var classname = $('.classnameentry').val();
      		var classtimeslot = $('.classtimeslotentry').val();
            var classgroup = $('.classgroupentry').val();
            var classdescription = $('.classdescriptionentry').val();
            var classsizelimit = $('.classsizelimitentry').val();

            Classes.update({_id: this._id},{classname: classname, classtimeslot: classtimeslot, classgroup: classgroup, classdescription: classdescription, classsizelimit: classsizelimit});
            
            Session.set('selectedClasses', _.without(Session.get('selectedClasses'), this._id));
        },

        'click .cancelclass': function(){
            Session.set('selectedClasses', _.without(Session.get('selectedClasses'), this._id));
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
            var selectedClasses = Session.get('selectedClasses');
            selectedClasses.push(Classes.insert({classname: "Name", classtimeslot: 0, classgroup: "Group", classdescription: "Description", classsizelimit: 30}));
            Session.set('selectedClasses',selectedClasses);
        }
    });
    
	Template.form.events({
    	'click .register': function(){
            Meteor.call('isRegistrationEnabled', function(error,enabled){
      		if(enabled) {
            var fname = $('.fname').val();
      		var lname = $('.lname').val();
            var schoolcode = $('.schoolcode').val();
            var checked = $('.classcheck:checked');
            
            var school = Schools.findOne({schoolcode: schoolcode});
            
            if(fname!="" && lname!="") {
            if(school!=null) {
            if(checked.length==3) {
                var ids = [0,0,0];
                var classnames = ["","",""];
                var i = 0;
                var overflowed = false;
                checked.each(function(){
                    var checkedClass = Classes.findOne({_id: $(this).data("meteor-id")});
                    if(liveCount(checkedClass._id)<checkedClass.classsizelimit) {
                        ids[i] = $(this).data("meteor-id");
                    } else {
                        overflowed = true;
                        return false;
                    }
                    i++;
                });

            if(!overflowed) {    
                for(var i=0; i<ids.length; i++) {
                    classnames[i] = Classes.findOne({_id: ids[i]}).classname;
                }
                    
                Meteor.call('getServerTime', function(error, timeobject) {
                    time = timeobject.toISOString();
                    Students.insert({fname:fname, lname:lname, schoolname:school.schoolname, classnames:classnames, time:time});
                });

                $('.register').prop("disabled", true);
                setTimeout(function(){
                $('.register').prop("disabled", false);
                }, 5000);
                
                Session.set("registermsg", "");

                Router.go('success');
            } else
                Session.set("registermsg", "One or more of your requested classes is already full");
            } else
                Session.set("registermsg", "Please select exactly 3 classes");
            } else
                Session.set("registermsg", "Please input a valid school code");
            } else
                Session.set("registermsg", "Please input a first and last name");
    	    } else
                Session.set("registermsg", "Registration is currently disabled");
            });
        }
    })
}

if (Meteor.isServer) {
    
    registrationEnabled = false;

    csv = Meteor.require('fast-csv');
    fs = Meteor.require('fs');
    
    Router.map(function(){
        this.route('downloadFile', {where: 'server', path: '/files/:filename/', action: function(){
                var filename = this.params.filename;
                this.response.writeHead(200, {'Content-Type':'text/csv'});
                this.response.end(fs.readFileSync('/tmp/'+filename));
        }})});

    Meteor.methods({
        getServerTime: function() {
            return new Date;
        },

        generateCsvFile: function() {
            var csvStream = csv.createWriteStream({headers: true});
            writableStream = fs.createWriteStream("/tmp/" + "roster"  + ".csv");
            writableStream.on('finish', function(){
                console.log("Done generating CSV file");
            });

            csvStream.pipe(writableStream);       

            var roster = Students.find().fetch();

            for(var i=0; i<roster.length; i++) csvStream.write({FirstName: roster[i].fname, LastName: roster[i].lname, School: roster[i].schoolname, Class1: roster[i].classnames[0], Class2: roster[i].classnames[1], Class3: roster[i].classnames[2], Time: roster[i].time});
            
            csvStream.write(null);
            return "roster.csv";
        },

        isRegistrationEnabled: function(){
            return registrationEnabled;
        },

        toggleRegistrationEnabled: function(){
            registrationEnabled = !registrationEnabled;
        }
    });

  	Meteor.startup(function () {
        //Accounts.createUser({email:'admin',username:'admin',password:'admin'});
        if (Classes.find().count() === 0)
        for (var i = 0; i < classnames.length; i++)
            Classes.insert({classname: classnames[i], classtimeslot: 0, classgroup: "Default", classdescription: "This is a class", classsizelimit: 30});

        if (Schools.find().count() === 0)
        for (var i = 0; i < schoolnames.length; i++)
            Schools.insert({schoolname: schoolnames[i], schoolcode:schoolcodes[i]});      
  	    });
}
