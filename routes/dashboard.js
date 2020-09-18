module.exports.set = function (app) {
    app.get('/dashboard', (req, res) => {
        res.render('dashboard', { user: req.session ? req.session.display_name : '' });
    });
}