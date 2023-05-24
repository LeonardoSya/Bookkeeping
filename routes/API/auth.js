const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
// 导入用户模型
const UserModel = require('../../models/UserModel');
const md5 = require('md5');
// 导入配置文件
const {secret} = require('../../config/config');


// 登录操作
router.post('/login', (req, res) => {
    // 查询数据库，检测用户账密并在数据库内匹配
    let { username, password } = req.body;  // 获取账密 解构赋值
    UserModel.findOne({ username: username, password: md5(password) }, (err, data) => {
        if (err) {
            res.json({
                code: '2001',
                msg: '数据库读取失败',
                data: null
            })
            return
        }
        if (!data) {
            return res.json({
                code: '2002',
                msg: '用户名或密码错误',
                data: null
            })
        }

        // 创建当前用户的token
        let token = jwt.sign({
            username: data.username,
            _id: data._id
        }, secret, {
            expiresIn: 60 * 60 * 24
        });
        // 响应token
        res.json({
            code: '0000',
            msg: '登录成功',
            data: token
        })

        // 登录成功响应
        // res.render('success', { msg: '登录成功', url: '/account' });
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