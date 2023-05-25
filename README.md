## 开源项目 Bookkeeping

##### 开发者:  LeonardoSya    https://github.com/LeonardoSya

#### 项目介绍：

​	This is an online bookkeeping page, and it was my first open source project since I learned programming.

​	Users can register and log in an account to use this online bookkeeping page to add accounts, edit accounts, delete accounts and other operations. In this project, user data is stored in a database on a remote server and encrypted to ensure data security.

#### 技术栈 :

​	*JavaScript + Node.js + MongoDB*

#### 第三方库：

​	*epxress.js, Generator, ejs, moment.js, cookie, session, token, lodash, mongoose*



#### 部署流程：

##### 初期搭建

1. 利用generator包搭建框架  express -e accounts 安装accounts文件夹
2. 文件夹内 npm i 安装依赖
3. package.json  start属性里node改成nodemon实现自动重启及时看到效果
4. 搭建“账单”account 和“账本”两个路由规则
5. 把index.html放到3000端口下作为我的服务：views中创建名为list.ejs的模板，同时在index.js中render引入3list.ejs的内容作为响应页面。create.html同理(把引入js/css文件由相对路径改为绝对路径，因为相对路径不可靠，会受到当前网页url路径的影响，url路径变化会造成引入文件相对路径变化，而绝对路径始终指向服务器的某个静态资源)
6. 获取请求体数据(新增账目后对表单数据提取)：路由设置router.post，create.ejs中form链接至账单页面(/account)
7. 保存账单信息并跳转：lowdb包与shortid包，在路由内生成id并写入数据至db.json，res.render()至添加成功页面 ejs渲染提示文字与返回链接url
8. 账单信息列表渲染：router.get('/account', )内获取账单信息并渲染至list，list.ejs修改为模板引擎语法
9. 删除账目：搭建/account/:id 路由规则，通过database内账目对应id删除账目并页面跳转渲染

##### 配置 MongoDB

1. config, db, models 三个文件夹放入accounts文件夹目录下
2. 入口bin/www内导入db函数 并把所有代码放入 db(()=>{}) 回调函数内
3. models文件夹下配置AccountModel，根据db.json创建文档结构对象并设置文档属性及值类型，并暴露模型对象
4. 通过moment包将日期字符串转成Date对象，在router.post('/account')中AccountModel.create插入数据库
5. router.get('/account')内读取信息改为读取数据库集合中的信息
6. 在list.js中ejs格式化日期对象：item.time模板语法改为moment(item.time).format('YYYY-MM-DD')，并在res.render('list')中加入模板语法moment:moment
7. 删除操作绑定Mongodb: list.ejs内删除某条账单的h5 ||a href="/account/<%= item._id %>"||在id前加_（Mongoose会自动往对象内添加id属性)。同时在index.js中router.get('/account/:id')(// 删除记录)内改写删除操作为AccountModel.deleteOne()
8. 优化删除操作：为了防止用户误删，在list.ejs中删除标签写防止误删操作的js代码。顺便在记账本title边上写一个“添加账单”的跳转按钮

##### 结合API接口

1. 删去users.js和app.js中对users的调用。在routes文件夹下新建web文件夹并放入Index.js并修改路径。删除index.js中lowdb等文件存储相关代码删去(因为已经存到数据库)

2. routes下新建api接口文件夹下account.js接口路由文件，并在app.js中导入account接口路由文件

3. 获取账单接口：account.js内响应成功和响应失败的提示改为响应json格式，并进行接口测试
4. 创建账单接口：修改新增记录的失败和成功响应为json格式，并在新增记录里做表单验证
5. 删除账单接口：删除记录的路由规则请求方法改为delete，并修改删除后响应结果
6. 获取单条账单接口：新增router.get('/account/id')获取单个账单信息的路由规则
7. 更新账单接口：新增router.patch('/account/id')更新单个账单信息的路由规则

##### 配置cookie，session

1. 响应注册页面：reg.ejs放到views文件夹下，并在routes/web下新建auth.js并响应req.ejs。app.js中导入注册页面的路由文件并app.use设置注册页面
2. 注册用户：auth.js中增加注册用户的post路由规则，models下新增UserModel.js创建文档结构对象，并把该用户模型导入auth.js中
3. 用户密码加密：安装md5包，导入auth.js并在auth.js中router.post('/reg')下UserModel.create()中设置md5加密
4. 用户登录：views/auth下新增login.ejs登录页面，并在auth.js下增加登录页面和登录操作的路由规则
5. 写入session：express-session路由文件导入app.js中并设置session中间件。把config导入配置项至app.js，便于设置session中间件的store mongoUrl。在auth.js中登陆操作中写入session
6. 登录检测：在index.js(负责account页面路由的)声明中间件检测登录，并在每个需要登录后才可操作的路由规则内添加中间件。由于可能会在其他代码中也使用登录检测的中间件，所以在记账本下新建middlewares下新建checkLoginMiddleware.js模块化中间件函数，并作暴露
7. 退出登录：auth.js中写退出登录的post路由规则(之所以用post是为了防止CSRF跨站请求伪造攻击)并且销毁session，在list,js中增加退出登录的btn
8. 首页和404页面：index.js中添加首页路由规则。app.js中在*// catch 404 and forward to error handler*下的函数内响应404页面，并在views下新建404.ejs，引入腾讯公益404

##### 配置token 以及功能完善

session存在的问题：网页端已经做了未登录账密无法访问account的约束了，但是接口端还没有，/api/account还是能够访问数据库信息，因此要做token进行api约束

1. 登录响应token：routes/API下新建auth.js，复制Web/auth.js并删去注册、注册用户、登录页面模块。修改登录操作的账密校验: 删去res.send改为响应res.json。删去写入session，安装并引入jwt，创建当前用户的token并响应token，删去登录成功响应。在app.js中导入authApiRouter并使用auth接口路由文件，并postmen测试
2. token校验：新建middlewares/checkTokenMiddleware, 导入jwt，获取token并校验token并封装成中间件，暴露并在account.js中引入。
3. token功能完善：config配置文件中新增token密钥secret，在需要验证密钥的文件中读取配置项。在checkTokenMiddleware内next()之前 新增req.user = data，这样可以保存当前登录的用户信息到req.user中，方便将来编写多用户记账本
4. 代码上传仓库：删去不需要的内容：data/db.json, db.json，初始化仓库，新建.gitignore文件并做忽略(在.gitignore内输入node_modules)，然后上传即可完成建立本地仓库。然后在gitee/github添加远程仓库。最后Publish Branch
