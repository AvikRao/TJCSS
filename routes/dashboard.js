module.exports.set = function (app) {
    app.get('/dashboard', (req, res) => {

        /* REAL CODE REAL CODE REAL CODE REAL CODE REAL CODE REAL CODE REAL CODE REAL CODE REAL CODE REAL CODE REAL CODE REAL CODE REAL CODE */

        // if (req.session && req.session.exists) {
        //     res.render('dashboard', { user: req.session});
        // } else {
        //     res.redirect('/');
        // }

        /* REAL CODE REAL CODE REAL CODE REAL CODE REAL CODE REAL CODE REAL CODE REAL CODE REAL CODE REAL CODE REAL CODE REAL CODE REAL CODE */

        let testdata = [
            {
                id: '0001',
                teacher: {
                    id: '0010',
                    name: 'Smith, Joe'
                },
                name: "AI 2nd Period"
            },
            {
                id: '0002',
                teacher: {
                    id: '0011',
                    name: 'Rose, Stephen'
                },
                name: "Foundations CS"
            },
            {
                id: '0003',
                teacher: {
                    id: '0012',
                    name: 'Billington, Marion'
                },
                name: "Accelerated Foundations CS"
            },
            {
                id: '0004',
                teacher: {
                    id: '0013',
                    name: 'Kosek, Paul'
                },
                name: "Web Development Spring 2020"
            },
            {
                id: '0005',
                teacher: {
                    id: '0014',
                    name: 'Tra, Dan'
                },
                name: "Mobile Application Dev 3rd Period"
            },
        ];

        console.log(transform(testdata));
        res.render('dashboard', {classes: transform(testdata)});

    });
}

function transform ( arr ) {
    let result = []
    let temp = [];
    let color_counter = 0;
    let colors = ['blue', 'yellow', 'green', 'red'];

    arr.forEach( function ( elem, i ) {

        elem.color = colors[color_counter];
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