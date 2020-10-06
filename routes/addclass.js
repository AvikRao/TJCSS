let db = require('./db')

//heroku pg:psql -a tjcss

const CLASSNAME_MAX_CHAR = 55;

module.exports.set = function (app) {

    app.get('/addclass', async (req, res) => {
        return res.render('addclass', { user: req.session });

    });

    app.post('/addclassverify', async (req, res) => {

        let className = req.body.className;
        let period = req.body.selectPeriod;
        let color = req.body.selectColor.slice(1);
        isHexColor = hex => typeof hex === 'string' && hex.length === 6 && !isNaN(Number('0x' + hex))

        if (className.length > CLASSNAME_MAX_CHAR) {
            console.log("name error");
            return res.redirect('/error');
        } else if (!['Period 1','Period 2','Period 3','Period 4','Period 5','Period 6','Period 7',].includes(period)) {
            console.log("period error");
            return res.redirect('/error');
        } else if (!isHexColor(color)) {
            console.log("color error");
            return res.redirect('/error');
        }

        await db.query('INSERT INTO classes (name, teacher, color, period) VALUES (%L, %L, %L, %s);', className, req.session.userid, color, period.replace(/\D/g, ""));


        console.log(req.body);
        return res.redirect('dashboard');
        
    });
}