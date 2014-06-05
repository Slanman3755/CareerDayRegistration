Students = new Meteor.Collection("students");
Classes = new Meteor.Collection("classes");
Schools = new Meteor.Collection("schools");

var classnames = ["Math",
                    "Science",
                    "English",
                    "French",
                    "History",
                    "Art"];

var schoolnames = ["Richmond High School",
                    "Seton Catholic High School",
                    "Lincoln High School",
                    "Centerville High School",
                    "Northeastern High School"];

//Accounts.config({forbidClientAccountCreation: true});

if (Meteor.isClient) {

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
                console.log(data);
                Router.to(filename);
            });
        }
    });
    
	Template.form.events({
    	'click input.register': function(){
      		var fname = $('input.fname').val();
      		var lname = $('input.lname').val();
            var schoolname = $('select.schoolselect :selected').val();
            var checked = $('input.classcheck:checked');

            if(fname!="" && lname!="") {
            if(schoolname!="none") {
            if(checked.length==3) {
                var ids = [0,0,0];
                var classnames = ["","",""];
                var i = 0;
                var overflowed = false;
                checked.each(function(){
                if(liveCount(Classes.findOne({_id: $(this).data("meteor-id")}).classname)<30)
                    ids[i] = $(this).data("meteor-id");
                else {
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
                    Students.insert({fname:fname, lname:lname, schoolname:schoolname, classnames:classnames, time:time});
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
                Session.set("registermsg", "Please select a school");
            } else
                Session.set("registermsg", "Please input a first and last name");
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
            return "roster";
        }
    });

  	Meteor.startup(function () {
        if (Classes.find().count() === 0)
        for (var i = 0; i < classnames.length; i++)
            Classes.insert({classname: classnames[i]});

        if (Schools.find().count() === 0)
        for (var i = 0; i < schoolnames.length; i++)
            Schools.insert({schoolname: schoolnames[i]});      
  	    });
}
