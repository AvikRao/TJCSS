
const db = require('./db');

module.exports.set = function (app) {
    app.get('/dashboard', async (req, res) => {

        if (!(req.session && req.session.exists)) {
            res.redirect('/');
        } else {
            //REAL LINE, DO NOT DELETE
            let class_user  = await db.query('SELECT * FROM class_user WHERE uid=%L', req.session.userid);

            // TEST LINE FOR FRONTEND DEV
            // let class_user  = await db.query('SELECT * FROM class_user WHERE uid=%s', '2');

            let class_user_rows = class_user.rows;
            let classids = [];
            class_user_rows.forEach((row) => {
                classids.push(row.class);
            });
            console.log(classids);

            let realdata = [];
            for (classid of classids) {
                let classobj = await db.query('SELECT * FROM classes WHERE id=%s;', classid);
                let classname = classobj.rows[0].name;
                let classperiod = classobj.rows[0].period;
                let teacherid = classobj.rows[0].teacher;
                let teacherobj = await db.query('SELECT * FROM users WHERE id=%L', teacherid);
                let teachername = teacherobj.rows[0].namestr;
                realdata.push({
                    id: classid,
                    teacher: {
                        id: teacherid,
                        name: teachername,
                    },
                    name: classname,
                    period: classperiod,
                });
            };
            res.render('dashboard', { user: req.session, classes:transform(realdata),});


        }

    });

    app.post('/joinclassverify', async (req, res) => {
        let classid = req.body.classid;

        if (isNaN(classid) || !(isInt(classid))) {
            console.log("Not a number.");
            return res.json({error: true});
        }

        let results_query = await db.query('SELECT * FROM classes WHERE id=%L;', classid);
        let results = results_query.rows;
        if (results.length != 1) {
            console.log("Not a valid class.");
            return res.json({error: true});
        }

        let dupe_check = await db.query('SELECT * FROM class_user WHERE uid=%L AND class=%L', req.session.userid, classid);

        if (dupe_check.rows.length > 0) {
            console.log("Is a duplicate.");
            return res.json({error: true});
        }

        await db.query('INSERT INTO class_user (uid, class) VALUES (%L, %L);', req.session.userid, classid);
        console.log("Success!");
        return res.json({error: false});
    });
}

function transform ( arr ) {
    let result = []
    let temp = [];
    let color_counter = 0;
    let colors = ['blue', 'yellow', 'green', 'red'];

    arr.forEach( function ( elem, i ) {

        elem.color = colors[color_counter];
        elem.index = i;
        if (color_counter < 3) color_counter += 1;
        else color_counter = 0;

        if ( i > 0 && i % 3 === 0 ) {
            result.push( temp );
            temp = [];
        }
        temp.push( elem );
    });
    if ( temp.length > 0 ) {
        result.push( temp );
    }
    return result;

}

function isInt(s) {
    return /^\+?[1-9][\d]*$/.test(s);
}