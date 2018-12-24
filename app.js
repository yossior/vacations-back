var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const db = require('./modules/DBController');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUploader = require('express-fileupload');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const vacationsRouter = require('./routes/vacations');
const adminRouter = require('./routes/admin');

var app = express();
db.createDB();
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}));
const io = require('socket.io')();
io.on('connection', (client) => { console.log("client");
});
// io.listen(3008);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors())
// app.use(fileUploader())
// app.use(bodyParser.json({limit: "50mb"}));
// app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/vacations', vacationsRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;