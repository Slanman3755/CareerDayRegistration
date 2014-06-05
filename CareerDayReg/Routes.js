Router.map(function() {
    this.route('home', {path: '/', layoutTemplate: 'main'});
    this.route('register', {path: '/register/', layoutTemplate: 'main'});
    this.route('success', {path: '/success/', layoutTemplate: 'main'});

    this.route('roster', {path: '/admin/controlpanel/roster/', layoutTemplate: 'admin'});
    this.route('schedule', {path: '/admin/controlpanel/schedule/', layoutTemplate: 'admin'});
    this.route('print', {path: '/admin/controlpanel/print/', layoutTemplate: 'admin'});
    this.route('controls', {path: '/admin/controlpanel/controls/', layoutTemplate: 'admin'});
});
