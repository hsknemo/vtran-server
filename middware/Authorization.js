const jsonwebtoken = require("jsonwebtoken")
const secretKey = 'secret_key';
const _cookie = require('cookie');
const createJwtToken = (userInfo, secretKey, expiresIn = '2d') => {
  return jsonwebtoken.sign(userInfo , secretKey, { expiresIn})
}

const authorizeToken = (token) => {
  return jsonwebtoken.verify(token, secretKey);
}
const {ERROR,ERROR_CODE} = require("../_requestResponse/setResponse");
const AUTHORIZATION = async (req, res, next) => {
  try {
    let token = req.headers.authorization
    if (!token) {
      throw new Error('Invalid authorization')
    }

    let verRes = authorizeToken(token)

    if (verRes !== 'jwt expired') {
      req.Token解析结果 = verRes
      next()
    } else {
      throw new Error('token expired')
    }
  }catch (e) {
    res.send(ERROR_CODE(401,'登录信息过期'))
  }
}

module.exports = {
  AUTHORIZATION,
  secretKey,
  authorizeToken,
  createJwtToken
}
