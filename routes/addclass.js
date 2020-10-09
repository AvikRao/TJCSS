let db = require('./db')

//heroku pg:psql -a tjcss

const CLASSNAME_MAX_CHAR = 55;

module.exports.set = function (app) {

    app.get('/addclass', async (req, res) => {

        if (req.session && req.session.exists) {
            return res.render('addclass', { user: req.session });
        } else {
            return res.redirect('/');
        }

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

        // THIS IS THE REAL LINE, DO NOT DELETE NO MATTER WHAT
        // let classobj = await db.query('INSERT INTO classes (name, teacher, color, period) VALUES (%L, %L, %L, %s) RETURNING id;', className, req.session.userid, color, period.replace(/\D/g, ""));
        // let classid = classobj.rows[0].id;
        // await db.query('INSERT INTO class_user (uid, class) VALUES (%s, %s);', req.session.userid, classid);
        // END REAL

        // TEST LINES FOR FRONTEND DEV, REPLACE '2' WITH USER'S ID
        let classobj = await db.query('INSERT INTO classes (name, teacher, color, period) VALUES (%L, %L, %L, %s) RETURNING id;', className, '2', color, period.replace(/\D/g, ""));
        let classid = classobj.rows[0].id;
        await db.query('INSERT INTO class_user (uid, class) VALUES (%s, %s);', '2', classid);
        // END TEST

        return res.redirect('dashboard');
        
    });
}