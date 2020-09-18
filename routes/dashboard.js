module.exports.set = function (app) {
    app.get('/dashboard', (req, res) => {

        if (req.session) {
            res.render('/dashboard', { user: req.session ? req.session : null });
        } else {
            res.redirect('/');
        }
    });
}