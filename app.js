var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// 导入express-session
const session = require('express-session');
const MongoStore = require('connect-mongo');
// 导入配置项
const { DBHOST, DBPORT, DBNAME } = require('./config/config')


var indexRouter = require('./routes/Web/index');
// 导入注册页面的路由文件
const authRouter = require('./routes/Web/auth');
const authApiRouter = require('./routes/API/auth');

// 导入account接口路由文件
const accountRouter = require('./routes/API/account');
var app = express();

// 设置session中间件
app.use(session({
  secret: 'sya',                                  //参与加密的字符串 (密钥/签名/加盐)  配置加密字符串，它会在原有加密基础之上和这个字符串拼起来去加密，目的是为了增加安全性，防止客户端恶意捏造
  name: 'sessionId',
  resave: true,                                   //是否在每次请求时重新保存session   退出登录问题 如果一直向服务端发请求就不容易退出登录，如果长期不操作会退出登录
  saveUninitialized: false,
  store: MongoStore.create({
    httpOnly: true,
    mongoUrl: `mongodb://${DBHOST}:${DBPORT}/${DBNAME}`
  }),                   //是否为每次请求都设置一个cookie用来存储session的id   一般当我们想对匿名用户做信息记录时true
  cookie: { maxAge: 1000 * 60 * 60 * 7 }                              // 控制 sessionID 的过期时间 (不仅能设置cookie也能设置sessionID过期时间) 单位毫秒
}))


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
//  设置注册页面
app.use('/', authRouter);
//  使用account接口路由文件
app.use('/api', accountRouter);  // 这样就能用 127.0.0.1:3000/api/account 访问account页面
//  使用auth接口路由文件
app.use('/api', authApiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.render('404')
  // next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
