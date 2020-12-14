const http = require('http');
var express = require('express');
var path = require('path');
var https = require('https')
var fs = require('fs')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
const mp = require('multiparty');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cors = require('cors');
var app = express();
var device = require('express-device');

var routes = require('./routes/app');
var admin = require('./routes/admin');
var user = require('./routes/user');
var members = require('./routes/members');
var teams = require('./routes/teams');
var common = require('./models/common');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(device.capture());
// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true,
    cookie: {
        // secure: true,
        // maxAge: 60000 * 60
        /* 1 hour */
    }
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/images')));

app.use('/', routes);
// app.use('/admin', admin);
app.use('/user', user);
app.use('/member',members);
app.use('/team',teams);

// app.set('port', (process.env.PORT || 8000));

// app.listen(app.get('port'), function() {
//     console.log('Server started on port ' + app.get('port'));
// });
//httpServer.listen(8080); 

// const options = {key: fs.readFileSync('../test/privkey.pem'),cert: fs.readFileSync('../test/cert.pem')};
// var httpsServer = https.createServer(options, app);
// httpsServer.listen(8000,function(){console.log('Server strted on 8000')});

var httpServer = http.createServer(app);
httpServer.listen(4000, function() { console.log('Server strted on 4000') });