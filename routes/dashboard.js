module.exports.set = function (app) {
    app.get('/dashboard', (req, res) => {

        console.log(req.session);

        if (req.session) {
            res.render('dashboard', { user: req.session ? req.session : false });
        } else {
            res.redirect('/');
        }
    });
}