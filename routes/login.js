module.exports.set = function(app){
    app.get('/login', (req, res) => {
        res.render('login');
    });
}