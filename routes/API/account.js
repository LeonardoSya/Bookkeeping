const express = require('express');

// 导入中间件
let checkTokenMiddleware = require('../../middlewares/checkTokenMiddleware')

const router = express.Router();

//导入 moment
const moment = require('moment');
const AccountModel = require('../../models/AccountModel');


//记账本的列表
router.get('/account', checkTokenMiddleware, function (req, res, next) {
    console.log(req.user);
    
    //读取集合信息
    AccountModel.find().sort({ time: -1 }).exec((err, data) => {
        // 响应失败的提示
        if (err) {
            res.json({
                code: '1001',
                msg: '读取失败',
                data: null
            })
            return
        }
        //响应成功的提示
        res.json({
            // 响应编号
            code: '0000',
            // 响应信息
            msg: '读取成功',
            // 响应数据 
            data: data
        })
    })
});

//添加记录
router.get('/account/create', checkTokenMiddleware, function (req, res, next) {
    res.render('create');
});

//新增记录
router.post('/account', checkTokenMiddleware, (req, res) => {
    // 表单验证
    if (!req.body.title) {
        res.json({
            code: '1003',
            msg: '标题不能为空',
            data: null
        })
    } else if (typeof req.body.title != 'string') {
        res.json({
            code: '1004',
            msg: '非法的标题格式',
            data: null
        })
    } else if (!req.body.type) {
        res.json({
            code: '1005',
            msg: '请选择账目类型(输入/支出)',
            data: null
        })
    } else if (!req.body.account) {
        res.json({
            code: '1006',
            msg: '请输入金额',
            data: null
        })
    }

    //插入数据库
    AccountModel.create({
        ...req.body,
        //修改 time 属性的值
        time: moment(req.body.time).toDate()
    }, (err, data) => {
        if (err) {
            // 失败提醒
            res.json({
                code: '1002',
                msg: '账目创建失败',
                data: null
            })
            return;
        }
        //成功提醒
        res.json({
            code: '0000',
            msg: '新建账目成功',
            data: data
        })
    })
});

//删除记录
router.delete('/account/:id', checkTokenMiddleware, (req, res) => {
    //获取 params 的 id 参数
    let id = req.params.id;
    //删除
    AccountModel.deleteOne({ _id: id }, (err, data) => {
        if (err) {
            res.json({
                code: '1007',
                msg: '账目删除失败',
                data: null
            })
        }
        //提醒
        res.json({
            code: '0000',
            msg: '账目删除成功',
            data: {}
        })
    })
});

// 获取单个账单信息
router.get('/account/:id', checkTokenMiddleware, (req, res) => {
    // 遵循RESTful风格
    // 获取id参数
    let { id } = req.params;
    // 查询数据库
    AccountModel.findById(id, (err, data) => {
        if (err) {
            return res.json({
                code: '1008',
                msg: '读取失败',
                data: null
            })
        }
        res.json({
            code: '0000',
            msg: '账目获取成功',
            data: data
        })
    })
})

// 更新单个账单信息
router.patch('/account/:id', (req, res) => {
    let { id } = req.params;
    // 更新数据库
    AccountModel.updateOne({ _id: id }, req.body, (err, data) => {

        // 再次查询数据库获取单条信息
        AccountModel.findById(id, (err, data) => {
            if (err) {
                return res.json({
                    code: '1009',
                    msg: '更新失败',
                    data: null
                })
            }
            res.json({
                code: '0000',
                msg: '账目更新成功',
                data: data
            })
        })

    })
})

module.exports = router;
