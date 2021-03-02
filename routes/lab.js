let db = require('./db')


module.exports.set = function (app) {

    // FRONTEND TEST DATA
    let testdata = {
        name: "Slider Lab",
        id: '1',
        deadline: "10/20/2020 11:59:59 PM",
        max_submissions: 3,
        description: "Luckily friends do ashamed to do suppose. Tried meant mr smile so. Exquisite behaviour as to middleton perfectly. Chicken no wishing waiting am. Say concerns dwelling graceful six humoured. Whether mr up savings talking an. Active mutual nor father mother exeter change six did all. Now eldest new tastes plenty mother called misery get. Longer excuse for county nor except met its things. Narrow enough sex moment desire are. Hold who what come that seen read age its. Contained or estimable earnestly so perceived. Imprudence he in sufficient cultivated. Delighted promotion improving acuteness an newspaper offending he. Misery in am secure theirs giving an. Design on longer thrown oppose am. Ecstatic advanced and procured civility not absolute put continue. Overcame breeding or my concerns removing desirous so absolute. My melancholy unpleasing imprudence considered in advantages so impression. Almost unable put piqued talked likely houses her met. Met any nor may through resolve entered. An mr cause tried oh do shade happy.",
        attached_files: [
            {
                file_name: "Instructions.pdf",
            }, {
                file_name: "Environment.py",
            },
        ],
        latest_submission: {
            file_name: "arao_wordladder.py",
            submission_count: 2,
            submission_date: "9/25/2020 11:37:14 AM",
            grade: "87.00%",
            status: 'completed'
        }

    }

    // FRONTEND TEACHER TEST DATA
    let teacherdata = {
        name: "Slider Lab",
        id: '1',
        deadline: "10/20/2020 11:59:59 PM",
        max_submissions: 3,
        description: "Luckily friends do ashamed to do suppose. Tried meant mr smile so. Exquisite behaviour as to middleton perfectly. Chicken no wishing waiting am. Say concerns dwelling graceful six humoured. Whether mr up savings talking an. Active mutual nor father mother exeter change six did all. Now eldest new tastes plenty mother called misery get. Longer excuse for county nor except met its things. Narrow enough sex moment desire are. Hold who what come that seen read age its. Contained or estimable earnestly so perceived. Imprudence he in sufficient cultivated. Delighted promotion improving acuteness an newspaper offending he. Misery in am secure theirs giving an. Design on longer thrown oppose am. Ecstatic advanced and procured civility not absolute put continue. Overcame breeding or my concerns removing desirous so absolute. My melancholy unpleasing imprudence considered in advantages so impression. Almost unable put piqued talked likely houses her met. Met any nor may through resolve entered. An mr cause tried oh do shade happy.",
        attached_files: [
            {
                file_name: "Instructions.pdf",
            }, {
                file_name: "Environment.py",
            },
        ],
        latest_submission: {
            file_name: "arao_wordladder.py",
            submission_count: 2,
            submission_date: "9/25/2020 11:37:14 AM",
            grade: "87.00%",
            status: 'completed'
        }

    }

    app.get('/lab/:labId', async (req, res) => {
        let labinfo = await db.query('SELECT * FROM labs WHERE id=%s;', req.params.labId);
        let classes = (await db.query('SELECT * FROM class_user WHERE uid=%L;', req.session.userid)).rows.map((e,i)=>{
            return e.class;
        });
        if(labinfo.rowCount!=1)
            return res.redirect('/error');
        if(!classes.includes(labinfo.rows[0].classid))
            return res.redirect('/error')

        let labData = labinfo.rows[0]
        console.log(labData)
        let realdata = {
            name:labData.name,
            id:labData.id,
            description: prompttxt
        }

        return res.render('lab', { user: req.session ? (req.session.exists ? req.session : false) : false, data: realdata });
    });


   
}