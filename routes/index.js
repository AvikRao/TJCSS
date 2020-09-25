let home = require('./home');
let login = require('./login');
let dashboard = require('./dashboard');
let classview = require('./class');

module.exports.set = function(app){
    login.set(app);
    home.set(app);
    dashboard.set(app);
    classview.set(app);
}