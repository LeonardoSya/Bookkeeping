// 导入express
const express = require('express');
//导入 moment
const moment = require('moment');
const AccountModel = require('../../models/AccountModel');
// 导入中间件来检测登录
const checkLoginMiddleware = require('../../middlewares/checkLoginMiddleware');

// 创建路由对象
const router = express.Router();

// 添加首页路由规则
router.get('/', (req, res) => {
  // 重定向到列表页 account
  res.redirect('/account');
})

//测试
// console.log(moment('2023-02-24').toDate())
//格式化日期对象
// console.log(moment(new Date()).format('YYYY-MM-DD'));

//记账本的列表
router.get('/account', checkLoginMiddleware, function (req, res, next) {
  //获取所有的账单信息
  // let accounts = db.get('accounts').value();
  //读取集合信息
  AccountModel.find().sort({ time: -1 }).exec((err, data) => {
    if (err) {
      res.status(500).send('读取失败');
      return;
    }
    //响应成功的提示
    res.render('list', { accounts: data, moment: moment });
  })
});

//添加记录
router.get('/account/create', checkLoginMiddleware, function (req, res, next) {
  res.render('create');
});

//新增记录
router.post('/account', checkLoginMiddleware, (req, res) => {
  //插入数据库
  AccountModel.create({
    ...req.body,
    //修改 time 属性的值
    time: moment(req.body.time).toDate()
  }, (err, data) => {
    if (err) {
      // res.status(500).send('插入失败~');
      return res.status(500).render('success', { msg: '请输入合法的格式', url: '/account/create' });
    }
    //成功提醒
    res.render('success', { msg: '账目新增成功', url: '/account' });
  })
});

//删除记录
router.get('/account/:id', checkLoginMiddleware, (req, res) => {
  //获取 params 的 id 参数
  let id = req.params.id;
  //删除
  AccountModel.deleteOne({ _id: id }, (err, data) => {
    if (err) {
      res.status(500).send('删除失败~');
      return
    }
    //提醒
    res.render('success', { msg: '账目删除成功', url: '/account' });
  })
});

module.exports = router;
