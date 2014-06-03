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

if (Meteor.isClient) {

	Template.list.students = function(){
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

  function liveCount(classname) {
    var count = Students.find({classnames: classname}).fetch().length;
    if(count!=null)
      return count;
    else
      return 0;
  }

  Handlebars.registerHelper('livecount', liveCount);

	Template.form.events({
    	'click input.register': function () {
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

              Students.insert({fname:fname, lname:lname, schoolname:schoolname, classnames:classnames});

      		    Session.set("registermsg", "Successfully Registered");
              $('input.register').prop("disabled", true);
              setTimeout(function(){
                $('input.register').prop("disabled", false);
              }, 5000);
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

  	Meteor.startup(function () {
      if (Classes.find().count() === 0)
      for (var i = 0; i < classnames.length; i++)
        Classes.insert({classname: classnames[i]});

      if (Schools.find().count() === 0)
      for (var i = 0; i < schoolnames.length; i++)
        Schools.insert({schoolname: schoolnames[i]});      
  	});
}
