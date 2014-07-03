Router.map(function() {
    this.route('home', {path: '/', layoutTemplate: 'main'});
    this.route('register', {path: '/register/', layoutTemplate: 'main'});
    this.route('success', {path: '/success/', layoutTemplate: 'main'});

    this.route('roster', {path: '/admin/controlpanel/roster/', layoutTemplate: 'admin'});
    this.route('general', {path: '/admin/controlpanel/general/', layoutTemplate: 'admin'});
    this.route('classes', {path: '/admin/controlpanel/classes/', layoutTemplate: 'admin'});
    this.route('schools', {path: '/admin/controlpanel/schools/', layoutTemplate: 'admin'});
    this.route('print', {path: '/admin/controlpanel/print/', layoutTemplate: 'admin'});
    this.route('controls', {path: '/admin/controlpanel/controls/', layoutTemplate: 'admin'});

    this.route('nametags', {path:'/admin/controlpanel/print/nametags', layoutTemplate: 'main'});
});
