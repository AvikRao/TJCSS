let simpleoauth2 = require('simple-oauth2');
let cookieSession = require('cookie-session');
let axios = require('axios')
const { default: Axios } = require('axios');
const { response } = require('express');

let ion_client_id = 'BjVuRUFYrXCdjYvtopJjJoBQozRVQxEMd6rijQsu'
let ion_client_secret = 'OtFMc19R2hwJmCv3n7EfFTQDTpckHzuRP8sVG1EW4St40xHbIwXuKTT0LZxKK1lJ6Xhkr76EwyOlvkHRpBKDaO8gEzzvjTLhHjzIopL1V2s4oQfdl2TUw3hSVC9tt3AH'
let ion_redirect_uri = 'https://tjcss.herokuapp.com/oauth'

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

    app.set('trust proxy', 1)
    app.use(cookieSession({
        name: 'peppermint',   
        keys: ['director Broke have a nice day', '1123xXx_pHasZe_qu1ckSc0p3r_xXx1123']
    }))

    app.get('/login', (req, res) => {
        res.render('login', {url: authorizationUri});
    });
    app.get('/oauth',[handleCode] ,(req,res) => {
        req.session.token = res.locals.token.token
        res.redirect('/'); //redirect to home once handleCode is all good
    });

    app.get('/test', (req,res)=>{
        let token = req.session.token.access_token;
        let my_ion_request = 'https://ion.tjhsst.edu/api/profile?format=json&access_token=' + token;

        axios.get(my_ion_request).then((resp)=>{
            res.send('check logs');
            console.log(resp.data);

            req.session.display_name = resp.data.display_name;
            console.log('Is student: ' + resp.data.is_student.toString());
            console.log('Is teacher: ' + resp.data.is_teacher.toString());
            console.log(req.session.display_name);
        })

    })

}