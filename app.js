var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var serveIndex = require('serve-index');

var configs = require('./config/database');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');
var xrayRouter = require('./routes/uploadXray.routes');
const AuthRouter = require("./routes/auth.routes");
// const userRoutes = require("./routes/user");

var app = express();

// ---------------------------------------------
// --------- Create Database Connection --------
// ---------------------------------------------
mongoose.set('strictQuery', true);
mongoose.connect(configs.DBConnection, {useUnifiedTopology: true,  useNewUrlParser: true }); //, { useMongoClient: true });
mongoose.connection.on('error', function (err) {
  console.log('Could not connect to the database. Exiting now...',err);
  process.exit();
});
mongoose.connection.once('open', function () {
  console.log("Successfully connected to the database");
});

// ---------------------------------------------
// --------- Parsing the body ------------------
// ---------------------------------------------
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));
app.use(bodyParser.json({ limit: '500mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --------- setting images statically ---------
// app.use('/public', express.static(path.join(__dirname, '../public')));
// app.use('/public', serveIndex(path.join(__dirname, '../public')));

// ---------------------------------------------
// --------- set access permission to origin ---
// ---------------------------------------------
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});
// ---------------------------------------------
// --------- Calling Router --------------------
// ---------------------------------------------
app.use('/', indexRouter);
app.use('/xray', xrayRouter);
app.use('/auth', AuthRouter);
// ---------------------------------------------
// --------- view engine setup -----------------
// ---------------------------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ---------------------------------------------
// --------- use application utilities ---------
// ---------------------------------------------
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// ---------------------------------------------
// --- catch 404 and forward to error handler --
// ---------------------------------------------
app.use(function(req, res, next) {
  next(createError(404));
});

// ---------------------------------------------
// ---------- error handler --------------------
// ---------------------------------------------
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
