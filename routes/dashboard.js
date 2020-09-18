module.exports.set = function (app) {
    app.get('/dashboard', (req, res) => {

        console.log(req.session);

        if (req.session && req.session.exists) {
            res.render('dashboard', { user: req.session});
        } else {
            res.redirect('/');
        }
    });
}