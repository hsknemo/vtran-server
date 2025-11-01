require('dotenv').config();
const express = require('express');
const router = express.Router();
const ROUTES_REGIS = require('./routes_regis')
const log = console.log.bind(console)
const defaultPath = process.env.API_PREFIX;
const __regis_route = function (router, route) {
    let url_route_path = defaultPath

    if (route.noPrefix) {
        url_route_path = ''
    }

    // 中间件收集增加
    if (Array.isArray(route?.midFun) && route?.midFun.length) {
        router[route.method](url_route_path + route.path, ...route.midFun, route.func)
    } else {
        router[route.method](url_route_path + route.path, route.func)
    }
};
const regis_router = (router, routes) => {
    var length = routes.length;
    for (let i = 0; i < length; i++) {
        // 注册中间件 是否都有中间件函数
        var route = routes[i]
        // console.log('【接口输出】', `【${route.method}】`, `${route.path}`)
        __regis_route(router, route)
    }

};
const Routes = ROUTES_REGIS

const __main = (router, routes) => {
    var length = routes.length;
    for (let i = 0; i < length; i++) {
        const rs = routes[i];
        regis_router(router, rs)
    }
    // console.log(router)
}
__main(router, Routes)

// 注册路由 老的写法，但是思路清晰
/*
const blogRoutes = require('../controller/blogController');
regis(router, blogRoutes)

const appRoutes = require('../controller/applicationController');
regis(router, appRoutes)

const adminRoutes = require('../controller/adminController');
regis(router, adminRoutes)

const captureRoute = require('../controller/capture');
regis(router, captureRoute)
 */

module.exports = router;
