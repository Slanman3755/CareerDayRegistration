Students = new Meteor.Collection("students");
Classes = new Meteor.Collection("classes");

var classnames = ["Math",
                    "Science",
                    "English",
                    "French",
                    "History",
                    "Art"];

if (Meteor.isClient) {

	Template.list.students = function(){
		return Students.find();
	}

  Template.form.classes = function(){
    return Classes.find();
  }

  Template.form.RegisterMsg = function(){
    return Session.get("registermsg");
  }

	Template.form.events({
    	'click input.register': function () {
      		var fname = $('#fname').val();
      		var lname = $('#lname').val();
      		
          var checked = $('input.classcheck:checked');
        

          if(checked.length==3) {
            var ids = [0,0,0];
            var classnames = ["","",""];
            var i = 0;
            var overflowed = false;
            checked.each(function(){
              if(Classes.findOne({_id: $(this).data("meteor-id")}).count<30)
                ids[i] = $(this).data("meteor-id");
              else {
                overflowed = true;
                return false;
              }
              i++;
            });

            if(!overflowed) {
              for(var i=0; i<ids.length; i++) {
                Classes.update({_id: ids[i]}, {$inc: {count: 1}});
                classnames[i] = Classes.findOne({_id: ids[i]}).classname;
              }

              Students.insert({fname:fname, lname:lname, classnames:classnames});

      		    Session.set("registermsg", "Successfully Registered");
              $('input.register').prop("disabled", true);
              setTimeout(function(){
                $('input.register').prop("disabled", false);
              }, 3000);
            } else
              Session.set("registermsg", "One or more of your requested classes is already full");
          } else
            Session.set("registermsg", "Please select 3 classes");
    	}
  })
}

if (Meteor.isServer) {

  	Meteor.startup(function () {
      if (Classes.find().count() === 0) {
      for (var i = 0; i < classnames.length; i++)
        Classes.insert({classname: classnames[i], count: 0});
      }
  	});
}
