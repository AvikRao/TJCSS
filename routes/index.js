let home = require('./home')
let login = require('./login')
let dashboard = require('./dashboard')

module.exports.set = function(app){
    login.set(app);
    home.set(app);
    dashboard.set(app);
}