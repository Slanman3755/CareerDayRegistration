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

var registrationEnabled = false;
//Accounts.config({forbidClientAccountCreation: true});

if (Meteor.isClient) {
    
    Meteor.startup(function(){
        registrationControlMsgUpdate();
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
    
    Handlebars.registerHelper('isRegistrationEnabled', function(){
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
        if(registrationEnabled) {
            Session.set('registrationcontrolbutton', "Disable Registration");
            Session.set('controlmsg', "Registration is enabled");
        } else {
            Session.set('registrationcontrolbutton', "Enable Registration");
            Session.set('controlmsg', "Registration is disabled");    
        }
    }

    Handlebars.registerHelper('livecount', liveCount);
    
    Template.admin.events({
        'click input.signout': function(){ 
            Meteor.logout();
        },

        'click input.login': function(){
            var username = $('input.username').val();
            var password = $('input.password').val();

            Meteor.loginWithPassword(username, password);
        },
        
        'click input.getcsv': function(){
            Meteor.call('generateCsvFile', function(error, filename){
                if(error) throw error;
                console.log(filename);
                window.location = '/files/' + filename;
            });
        },
        
        'click input.togglereg': function(){
            registrationEnabled=!registrationEnabled;
            
            $('input.togglereg').prop('disabled', true);
            setTimeout(function(){
                registrationControlMsgUpdate()
                $('input.togglereg').prop('disabled', false);
            }, 3000);
        }
    });
    
	Template.form.events({
    	'click input.register': function(){
      		if(registrationEnabled) {
            var fname = $('input.fname').val();
      		var lname = $('input.lname').val();
            var schoolcode = $('input.schoolcode').val();
            var checked = $('input.classcheck:checked');
            
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

                $('input.register').prop("disabled", true);
                setTimeout(function(){
                $('input.register').prop("disabled", false);
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
        }
    })
}

if (Meteor.isServer) {
    
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
        }
    });

  	Meteor.startup(function () {
        if (Classes.find().count() === 0)
        for (var i = 0; i < classnames.length; i++)
            Classes.insert({classname: classnames[i]});

        if (Schools.find().count() === 0)
        for (var i = 0; i < schoolnames.length; i++)
            Schools.insert({schoolname: schoolnames[i], schoolcode:schoolcodes[i]});      
  	    });
}
