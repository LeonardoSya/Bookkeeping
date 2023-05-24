const express = require('express');
const router = express.Router();
// 导入用户模型
const UserModel = require('../../models/UserModel');
const md5 = require('md5');

// 注册
router.get('/reg', (req, res) => {
    // 响应html
    res.render('auth/reg');
})

// 注册用户
router.post('/reg', (req, res) => {
    // 做表单验证
    // UserModel.find({ username: `${req.body.username}` }, (err, data) => {
    //     if (data == req.body.username) {
    //         res.status(500).send('用户名已存在');
    //         return
    //     }
    // })
    // if (req.body.username == null || req.body.password == null) {
    //     res.status(500).send('用户名或密码不能为空');
    //     return
    // }
    // 失败的
    // let { username } = req.body;
    // UserModel.findOne({ username: username }, (err, data) => {
    //     if (err) {
    //         res.status(500).send('服务器繁忙，请稍后重试');
    //         return
    //     }
    //     if (data) {
    //         res.status(500).send('用户已存在');
    //         return
    //     }
    // })
    // 失败的

    // 获取请求体数据
    UserModel.create({ ...req.body, password: md5(req.body.password) }, (err, data) => {
        if (err) {
            return res.status(500).render('success', { msg: '用户名或密码不能为空', url: '/reg' });
        }
        res.render('success', { msg: '注册成功', url: '/login' });
    })
})


// 登录页面
router.get('/login', (req, res) => {
    res.render('auth/login');
})
// 登录操作
router.post('/login', (req, res) => {
    // 查询数据库，检测用户账密并在数据库内匹配
    let { username, password } = req.body;  // 获取账密 解构赋值
    UserModel.findOne({ username: username, password: md5(password) }, (err, data) => {
        if (err) {
            res.status(500).send('服务器繁忙, 请稍后重试');
            return
        }
        if (!data) {
            // return res.send('用户名或密码错误');
            return res.render('success', { msg: '用户名或密码错误', url: '/login' })
        }
        // 写入session
        req.session.username = data.username;
        req.session._id = data._id;

        // 登录成功响应
        res.render('success', { msg: '登录成功', url: '/account' });
    })
});

// 退出登录
router.post('/logout', (req, res) => {
    // 销毁session
    req.session.destroy(() => {
        res.render('success', { msg: '账号已登出', url: '/login' });
    })
});

module.exports = router;