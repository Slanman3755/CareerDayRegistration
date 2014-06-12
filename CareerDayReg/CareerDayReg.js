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
        Session.set('selectedEntries',[]);
        Session.set('registermsg',"");
    });

    Template.roster.students = function(){
		return Students.find();
	}

    Template.form.classes = function(){
        return Classes.find();
    }

    Template.form.schools = function(){
        return Schools.find();
    }

    Template.form.RegisterMsg = function(){
        return Session.get("registermsg");
    }
    
    Template.controls.ControlMsg = function() {
        return Session.get("controlmsg");
    }

    Template.controls.RegistrationControlButton = function() {
        return Session.get("registrationcontrolbutton");
    }

    Handlebars.registerHelper('entrySelected', function(id){
        var selectedEntries = Session.get('selectedEntries');
        return (_.indexOf(selectedEntries, id)>=0);
    });

    Handlebars.registerHelper('classesheader', function(){
        var students = Students.find().fetch();
        if(students.length>0)
            return _.range(1, students[0].classnames.length+1);
        else return [];
    });
    
    Handlebars.registerHelper('getCurrentUsername', function(){
        return Meteor.user().emails[0].address;
    });

    function liveCount(classname) {
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
            var selectedEntries = Session.get('selectedEntries');
            Students.remove({_id: this._id});
            Session.set('selectedEntries', selectedEntries);
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

            var selectedEntries = Session.get('selectedEntries');
            selectedEntries = _.without(selectedEntries, this._id);
            Session.set('selectedEntries', selectedEntries);
        },

        'click .cancelentry': function(){
            var selectedEntries = Session.get('selectedEntries');
            selectedEntries = _.without(selectedEntries, this._id);
            Session.set('selectedEntries', selectedEntries);
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
                    if(liveCount(Classes.findOne({_id: $(this).data("meteor-id")}).classname)<30) {
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
                    
                Meteor.call('getServerTime', function(error, time) {
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
            var time = (new Date).toString();
            return time;
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
            Classes.insert({classname: classnames[i]});

        if (Schools.find().count() === 0)
        for (var i = 0; i < schoolnames.length; i++)
            Schools.insert({schoolname: schoolnames[i], schoolcode:schoolcodes[i]});      
  	    });
}
