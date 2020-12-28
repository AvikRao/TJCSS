
let home = require('./home');
let login = require('./login');
let dashboard = require('./dashboard');
let classview = require('./class');
let addclass = require('./addclass');
let error = require('./error');
let lab = require('./lab');
let addlab = require('./addlab');


module.exports.set = function(app){
    login.set(app);
    home.set(app);
    dashboard.set(app);
    classview.set(app);
    addclass.set(app);
    error.set(app);
    lab.set(app);
    addlab.set(app);
}