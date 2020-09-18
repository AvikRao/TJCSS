let home = require('./home')
let login = require('./login')
let signup = require('./signup')

module.exports.set = function(app){
    login.set(app);
    home.set(app);
    signup.set(app);
}