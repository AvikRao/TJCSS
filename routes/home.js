module.exports.set = function(app){
    app.get('/', (req, res) => {
        console.log(req.session);
        res.render('index', {user: req.session ? req.session.display_name : ''});
    });
}