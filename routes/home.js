module.exports.set = function(app){
    app.get('/', (req, res) => {
        res.render('index', {user: req.session ? req.session.display_name : ''});
    });
}