

if (Meteor.isServer) {
   
    Students = new Meteor.Collection("students");
    Classes = new Meteor.Collection("classes");
    Schools = new Meteor.Collection("schools");
    Clusters = new Meteor.Collection("clusters");
    Timeslots = new Meteor.Collection("timeslots");
    General = new Meteor.Collection("general");
    Codes = new Meteor.Collection("codes");

    Students.allow({
        insert: function(userId) {
            return userId;
        },
        
        update: function(userId) {
            return userId;
        },

        remove: function(userId) {
            return userId;
        }
    });

    Classes.allow({
        insert: function(userId) {
            return userId;
        },
        
        update: function(userId) {
            return userId;
        },

        remove: function(userId) {
            return userId;
        }
    });


    Schools.allow({
        insert: function(userId) {
            return userId;
        },
        
        update: function(userId) {
            return userId;
        },

        remove: function(userId) {
            return userId;
        }
    });


    Clusters.allow({
        insert: function(userId) {
            return userId;
        },
        
        update: function(userId) {
            return userId;
        },

        remove: function(userId) {
            return userId;
        }
    });


    Timeslots.allow({
        insert: function(userId) {
            return userId;
        },
        
        update: function(userId) {
            return userId;
        },

        remove: function(userId) {
            return userId;
        }
    });


    General.allow({
        insert: function(userId) {
            return userId;
        },
        
        update: function(userId) {
            return userId;
        },

        remove: function(userId) {
            return userId;
        }
    });


    Codes.allow({
        insert: function(userId) {
            return userId;
        },
        
        update: function(userId) {
            return userId;
        },

        remove: function(userId) {
            return userId;
        }
    });


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

    registrationEnabled = false;
    numClasses = 4;

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
        
        clearTimeslots: function() {
            if(Meteor.user()) Timeslots.remove({});
        },

        clearGeneral: function() {
            if(Meteor.user()) General.remove({});
        },

        deleteCodes: function() {
            if(Meteor.user()) Codes.remove({});
        },

        generateCsvFile: function() {
            if(Meteor.user()) {
                var csvStream = csv.createWriteStream({headers: true});
                writableStream = fs.createWriteStream("/tmp/" + "roster"  + ".csv");
                writableStream.on('finish', function(){
                    console.log("Done generating CSV file");
                });

                csvStream.pipe(writableStream);       

                var roster = Students.find().fetch();

                for(var i=0; i<roster.length; i++) {
                    var query = {
                        'First Name': roster[i].fname,
                        'Last Name': roster[i].lname,
                        School: roster[i].schoolname};
                    for(var j=0; j<roster[i].classnames.length; j++) query["Class"+(j+1)] = roster[i].classnames[j];
                    query["Time"] = roster[i].time;
                    csvStream.write(query);
                }
                
                csvStream.write(null);
                return "roster.csv";
            }

            return null;
        },

        generateCodesCsvFile: function() {
            if(Meteor.user()) {
                var csvStream = csv.createWriteStream({headers: true});
                writableStream = fs.createWriteStream("/tmp/" + "codes"  + ".csv");
                writableStream.on('finish', function(){
                    console.log("Done generating CSV file");
                });

                csvStream.pipe(writableStream);       

                var codes = Codes.find().fetch();

                for(var i=0; i<codes.length; i++) {
                    var query = {
                        Code: codes[i].code,
                        Available: codes[i].available};
                    csvStream.write(query);
                }
                
                csvStream.write(null);
                return "codes.csv";
            }

            return null;
        },

        register: function(fname, lname, schoolcode, studentcode, selectedClasses){
            if(registrationEnabled) {
                var school = Schools.findOne({schoolcode: schoolcode});
                
                if(fname!="" && lname!="") {
                    if(school!=null) {

                        if(Codes.find({code: studentcode, available: 'Yes'}).count() <= 0) return "Please input a valid unclaimed student code";

                        if(selectedClasses.length == numClasses) {
                            var requiredClasses = Classes.find({classrequired:'Yes'}).fetch();
                            var check = 0;

                            for(var i = 0; i < selectedClasses.length; i++) {
                                for(var j = i + 1; j < selectedClasses.length; j++) {
                                    if (selectedClasses[i] == selectedClasses[j]) return "You cannot select more than one of the same class";
                                }
                                if(requiredClasses) {
                                    for(var j = 0; j < requiredClasses.length; j++) {
                                        if (requiredClasses[j].classname == Classes.findOne({_id: selectedClasses[i]}).classname) check++;
                                    }
                                }
                            }

                            if (check < requiredClasses.length) return "You are missing a required class";

                            var ids = [];
                            var classnames = [];
                            var i = 0;
                            var overflowed = false;
                            _.each(selectedClasses, function(id, i){
                                var selectedClass = Classes.findOne({_id: id}); 
                                if(liveCount(selectedClass._id, i)<selectedClass.classsizelimit) {
                                    ids.push(id);
                                } else {
                                    overflowed = true;
                                    return false;
                                }
                                i++;
                            });

                            if(!overflowed) {    
                                for(var i=0; i<ids.length; i++) {
                                    classnames.push(Classes.findOne({_id: ids[i]}).classname);
                                }
                             
                                var timeobject = new Date;
                                var time = timeobject.toISOString();
                                Students.insert({fname:fname, lname:lname, schoolname:school.schoolname, classnames:classnames, time:time});
                                Codes.update({code: studentcode}, {code: studentcode, available: 'No'});

                                return "";
                            } else {
                               return "One or more of your requested classes is already full"; 
                            }
                        } else {
                            return "Please select exactly "+numClasses+" classes";
                        }
                    } else {
                        return "Please input a valid school code";
                    }
                } else {
                    return "Please input a first and last name";
                }
            } else {
                return "Registration is currently disabled";
            }
        },

        isRegistrationEnabled: function(){
            return registrationEnabled;
        },

        toggleRegistrationEnabled: function(){
            if(Meteor.user()) registrationEnabled = !registrationEnabled;
        },

        getNumClasses: function(){
            return numClasses;
        },

        setNumClasses: function(num){
            if(Meteor.user()) numClasses = num;
        },

        generateCodes: function(quantity) {
            if(Meteor.user() && quantity <=1000) {
                for(var i = 0; i < quantity; i++) {
                    Codes.insert({code: new Meteor.Collection.ObjectID()._str.substring(0, 7), available:'Yes'});
                }
            }
        }
    });

  	Meteor.startup(function () {
        Accounts.config({forbidClientAccountCreation: true});
        if(Meteor.users.find({username:'admin'}).count()<=0) Accounts.createUser({username:'admin',password:'chamberadmin9000'});
    });
}
