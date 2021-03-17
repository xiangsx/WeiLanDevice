### 1. 开发
````bash
#克隆项目之后
cd WeiLanDevice
yarn
yarn start #启动lte进程
````

### 2. 部署发布

```bash
yarn build
#打包dist和package.json文件
#上传到板卡
cd WeiLanDevice
yarn prod-install #只安装运行时依赖
yarn prod-start-lte #启动lte进程
```