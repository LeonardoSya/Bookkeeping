// 声明校验token的中间件
const jwt = require('jsonwebtoken');
// 导入配置文件并读取配置项
const { secret } = require('../config/config');

module.exports = (req, res, next) => {
    // 获取token
    let token = req.get('token');
    if (!token) {
        return res.json({
            code: '2003',
            msg: "token not found",
            data: null
        })
    }
    // 校验token
    jwt.verify(token, secret, (err, data) => {
        // 检测token是否正确
        if (err) {
            return res.json({
                code: '2004',
                msg: 'token 校验失败',
                data: null
            })
        }
        // 保存用户信息
        req.user = data;
        next();
    })
}