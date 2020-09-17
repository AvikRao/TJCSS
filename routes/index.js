let home = require('./home')
let login = require('./login')
let signup = require('./signup')

module.exports.set = function(app){
    home.set(app);
    login.set(app);
    signup.set(app);
}