/**
 * @name node后端套路Express
 */

const express = require("express");
const app = express();
const log = console.log.bind(console);
const bodyParser = require("body-parser");
const cors = require("cors");
const router = require("./route/init_routes.js");
const path = require("path");
const session = require("express-session");
const expressFileUpload = require("express-fileupload");
const { beautiLog } = require("./log/beautifulLog");
const log4j = require("./logControl/index");
const md5 = require("md5");
const socket = require('./Socket/index')

// const http = require("http").createServer(app);
// const io = require("socket.io")(http);
// import socket set service
// const regisSockets = require('./socketController/index')
app.use(expressFileUpload());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
    },
  })
);
//开放静态资源目录
app.use(express.static("uploads"));
app.use(express.static("public"));
app.use(express.static("views"));

// app.engine('html', require('express-art-template'));
app.set("views", path.join(__dirname, "views"));
app.engine(".html", require("ejs").__express);
app.set("view engine", "html");
// body-parser json 数据配置
app.use(bodyParser.json({ limit: "100mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    // 数据格式增加限制 默认 100K
    limit: "100mb",
  })
);

app.use(bodyParser.json());
app.use(log4j());


// 端口配置

// 配置端口号
const port = require("./config/Port").port;

app.use(cors());

app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", "Stone");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});


// api 路由注册
app.use(router);
socket(app)

module.exports = app;
