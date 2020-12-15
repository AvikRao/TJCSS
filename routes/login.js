let simpleoauth2 = require('simple-oauth2');

let axios = require('axios')


let db = require('./db')


let ion_client_id = 'BjVuRUFYrXCdjYvtopJjJoBQozRVQxEMd6rijQsu'
let ion_client_secret = 'OtFMc19R2hwJmCv3n7EfFTQDTpckHzuRP8sVG1EW4St40xHbIwXuKTT0LZxKK1lJ6Xhkr76EwyOlvkHRpBKDaO8gEzzvjTLhHjzIopL1V2s4oQfdl2TUw3hSVC9tt3AH'
let ion_redirect_uri = 'http://52.146.18.230:8080/oauth'

let oauth2 = simpleoauth2.create({ //create oauth client
    client: {
        id: ion_client_id,
        secret: ion_client_secret,
    },
    auth: {
        tokenHost: 'https://ion.tjhsst.edu/oauth/',
        authorizePath: 'https://ion.tjhsst.edu/oauth/authorize',
        tokenPath: 'https://ion.tjhsst.edu/oauth/token/'
    }
});

let authorizationUri = oauth2.authorizationCode.authorizeURL({ //create auth url from oauth client
    scope: "read",
    redirect_uri: ion_redirect_uri
});


async function handleCode(req, res, next) { //ion sends code from auth url, figure out what to do with it
    let theCode = req.query.code;

    let options = {
        'code': theCode,
        'redirect_uri': ion_redirect_uri,
        'scope': 'read'
     };
    
    try {
        let result = await oauth2.authorizationCode.getToken(options);    
        let token = oauth2.accessToken.create(result);
        res.locals.token = token;
        next();
    } 
    catch (error) {
        console.log('Access Token Error', error.message);
         res.send(502); // bad stuff, man
         //TODO create better error page
    }
}


function verifyCookie(req, res, next) { //simple cookie check
    if (typeof req.session.token == 'undefined') {
        res.render('login', {
            url: authorizationUri
        });
    } else next();

}

module.exports.set = function(app){

    app.get('/login', (req, res) => {
        // res.render('login', {url: authorizationUri});
        res.redirect(authorizationUri);
    });


    app.get('/oauth',[handleCode] , async (req,res) => {

        req.session.token = res.locals.token.token
        
        let my_ion_request = 'https://ion.tjhsst.edu/api/profile?format=json&access_token=' + req.session.token.access_token;

        axios.get(my_ion_request).then( async (resp)=>{
            req.session.display_name = resp.data.display_name;
            req.session.userid = resp.data.id;
            req.session.is_teacher = resp.data.is_teacher;
            req.session.exists = true;

            let users = await db.query('SELECT * FROM users WHERE id=%s;', req.session.userid);

            if (users.rows.length == 0) {
                console.log("creating new user!");
                await db.query('INSERT INTO users (id, isTeacher, namestr) VALUES (%s, %L, %L);', req.session.userid, req.session.is_teacher, req.session.display_name);
            } else {
                req.session.is_teacher = users.rows[0].isteacher;
            }

        }).catch(()=>{
            //shit
        }).then(()=>{
            res.redirect('/'); //redirect to home once handleCode is all good
        })


       
    });

    app.get('/test', (req,res)=>{
        res.json(req.session)


       
    });

    app.get('/test', (req,res)=>{
        res.json(req.session)

    })

    app.get('/logout', (req, res) => {
        req.session = null;
        res.redirect('/');
    });

}