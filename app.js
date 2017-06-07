//引入express模块
var express = require('express');
//引入处理路径的模块
var path = require('path');
//处理收藏夹图标 当客户端访问/favicon.ico的时候，此中间件可以帮我们返回对应的图标文件
var favicon = require('serve-favicon');
//记录请求日志 请求的方法名 请求的路径 状态码 响应时间 - 响应体的长度
//           GET /abc 500 11.762 ms - 1157
var logger = require('morgan');
//处理cookie,会在req增加一个 cookies属性 req.cookies
var cookieParser = require('cookie-parser');
//处理请求体的 req.body
var bodyParser = require('body-parser');

var routes = require('./routes/route_app');

var app = express();
var ejs = require('ejs');

//设置模板的存放目录
app.set('views', path.join(__dirname, 'views'));
//设置模板渲染方法 .html ejs
app.engine('.html', ejs.__express);
//设置模板引擎
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//获得get请求，第一个参数是匹配内容，第二个参数是匹配成功后执行的回调函数
//首页
app.get('/vote/index', routes.index);
//个人详情页
app.get(/\/vote\/detail/, routes.detail);
//报名页
app.get('/vote/register', routes.register);
//搜索结果页
app.get('/vote/search', routes.search);
//规则页
app.get('/vote/rule', routes.rule);

//首页加载用户信息
app.get('/vote/index/data', routes.index_data);
//首页投票请求
app.get(/\/vote\/index\/poll/, routes.index_poll);
//搜索结果
app.get(/\/vote\/index\/search/, routes.index_search);
//个人详情页 个人主页信息
app.get(/\/vote\/all\/detail\/data/, routes.detail_data);
//报名
app.post(/\/vote\/register\/data/, routes.register_data);
//主页的登录请求
app.post('/vote/index/info', routes.index_info);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
