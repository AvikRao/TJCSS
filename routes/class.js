module.exports.set = function (app) {

    let testdata = {
        className: "Mobile Development 3rd Period",
        teacher: "Tra, Dan",
        labs: [{
            id: '0001',
            classId: '0002',
            deadline: '9-25-2020',
            submission_max: 3,
            submissions: 0,
            grade: '----',
        },
        {
            id: '0002',
            classId: '0002',
            deadline: '9-27-2020',
            submission_max: 3,
            submissions: 1,
            grade: '95.17%',
        },
        {
            id: '0003',
            classId: '0002',
            deadline: '8-30-2020',
            submission_max: 3,
            submissions: 1,
            grade: '95.17%',
        },
        {
            id: '0004',
            classId: '0002',
            deadline: '9-30-2020',
            submission_max: 3,
            submissions: 3,
            grade: '100%',
        },
        {
            id: '0005',
            classId: '0002',
            deadline: '10-01-2020',
            submission_max: 3,
            submissions: 1,
            grade: '76.00%',
        },
        {
            id: '0006',
            classId: '0002',
            deadline: '9-28-2020',
            submission_max: 3,
            submissions: 1,
            grade: '85.34%',
        },]
    };

    testdata.labs.forEach((obj) => {
        let now = Date.now();
        let deadline = Date.parse(obj.deadline);

        if (deadline < now || obj.submissions == obj.submission_max) obj.status = "completed";
        else if (obj.submissions == 0) obj.status = "unsubmitted";
        else obj.status = "submitted";

        obj.submissions_remaining = obj.submission_max - obj.submissions;
    });

    app.get('/class/:classId', (req, res) => {
        
        testdata.labs = transform(testdata.labs);
        console.log(testdata.labs);
        res.render('class', { user: req.session ? (req.session.exists ? req.session : false) : false, data: testdata });
    });
}

function transform ( arr ) {
    let result = []
    let completed = [];
    let unsubmitted = [];
    let submitted = [];

    arr.forEach( (obj) => {
        if (obj.status == 'completed') completed.push(obj);
        else if (obj.status == 'unsubmitted') unsubmitted.push(obj);
        else if (obj.status == 'submitted') submitted.push(obj);
    });

    completed.sort((a, b) => (Date.parse(a.deadline) < Date.parse(b.deadline)) ? 1 : -1);
    unsubmitted.sort((a, b) => (Date.parse(a.deadline) > Date.parse(b.deadline)) ? 1 : -1);
    submitted.sort((a, b) => (Date.parse(a.deadline) > Date.parse(b.deadline)) ? 1 : -1);

    result = unsubmitted.concat(submitted).concat(completed);

    return result;
}