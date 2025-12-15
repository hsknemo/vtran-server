## Stone :bat:

> 基于Node.js Express 框架为基础，封装套入 ``MVC`` 套路

### 目录介绍
- `app` : 应用目录
  - `controller` : 控制器目录
    - `(controller/controllerConfig)` 所有的路由导出文件应该配置在这里
  - `model` : 模型目录
  - `service` : 服务目录
  - `view` : 视图目录
  - `middleware` : 中间件目录
  - `router` : 路由目录 封装了 Express Router 基本的路由功能，路由接口前缀或其他用法可以在此修改
  - `config` : 配置目录（如果不使用环境变量文件可以在此书写自己的项目变量配置，但是推荐使用env）

### 功能支持
- 支持 `MVC` 模式开发
- 支持 `env` 环境变量文件
- 
