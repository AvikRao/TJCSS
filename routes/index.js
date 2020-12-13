
let home = require('./home');
let login = require('./login');
let dashboard = require('./dashboard');
let classview = require('./class');
let addclass = require('./addclass');
let error = require('./error');
let lab = require('./lab');
let files = require('./accept')

module.exports.set = function(app){
    login.set(app);
    home.set(app);
    dashboard.set(app);
    classview.set(app);

    addclass.set(app);
    error.set(app);
    lab.set(app);
    files.set(app);
}