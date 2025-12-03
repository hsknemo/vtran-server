/**
 *  用户层数据
 */

const crypto = require("crypto");
const fs = require('fs')
const path = require('path')
const moment = require("moment");
const Base = require('../base.model')
require('dotenv').config();

class UserModel extends Base{
    constructor() {
        super()
        this.filePath = path.resolve(__dirname, './user.json')
    }

    async getUser() {
       return await this.getModelData()
    }

    static init() {
        return new this()
    }

    async checkUserIsExitById(user) {
        return new Promise(async (resolve, reject) => {
            let isHasUser =  false
            let userModel = await this.getUser()
            userModel.forEach(item => {
                if (item.id === user.userId) {
                    isHasUser= true
                }
            })
            resolve(isHasUser)
        })

    }

    async checkUserIsExit(user) {
        return new Promise(async (resolve, reject) => {
            let isHasUser =  false
            let userModel = await this.getUser()
            userModel.forEach(item => {
                if (item.username === user.username) {
                    isHasUser= true
                }
            })
            resolve(isHasUser)
        })
    }

    async findUserPool(users) {
        let u = []
        let userModel = await this.getUser()
        userModel.forEach(item => {
            if (users.includes(item.id)) {
                u.push(item)
            }
        })

        return u
    }

    async saveUser(user) {
        let userModel = await this.getUser()
        if (user.id) {
            userModel = userModel.filter(item => item.id !== user.id)
            user.updateTime = moment().format('YYYY-MM-DD HH:mm:ss')
        } else {
            user.id = crypto.randomUUID()
            user.insertTime = moment().format('YYYY-MM-DD HH:mm:ss')
        }
        userModel.push(user)
        fs.writeFileSync(path.resolve(__dirname, './user.json'), JSON.stringify(userModel, null, 2), 'utf-8')
        return user
    }

    async findUserAll(tokenUser) {
        let user = await this.getUser()
        return user.filter(item => item.username !== tokenUser.username)
    }

    async updateUserOnlineStatus(userId, onlineStatus, ip) {
        let userModel = await this.getUser()
        let bool = await this.checkUserIsExitById({userId})
        if (!bool) {
            throw new Error('用户不存在')
        }
        let findResult = userModel.filter(item => item.id === userId)
        if (!findResult.length) return
        findResult[0].isOnline = onlineStatus
        if (ip) {
            findResult[0].ip = ip
        }
        await this.saveUser(findResult[0])
    }

    async updateUser(user) {
        try {
            let bool = await this.checkUserIsExit(user)
            if (!bool) {
                throw new Error('用户不存在')
            }
            let u = await this.findUserByName(user.username)
            u.isOnline = true
            await this.saveUser(u)
        } catch (e) {
            console.log('error', e)
        }

    }

    async addUser(user) {
        let bool = await this.checkUserIsExit(user)
        if (!bool) {
            return await this.saveUser(user)
        }
        throw new Error('用户已存在')
    }

    async findUserById(id) {
        if (!id) return []
        let userModel = await this.getUser()
        let findResult = userModel.filter(item => item.id === id)
        return findResult.length ? findResult : []
    }

    async findUserByName(username) {
        let userModel = await this.getUser()
        let bool = await this.checkUserIsExit({username})
        if (!bool) {
            throw new Error('用户不存在')
        }
        let findResult = userModel.filter(item => item.username === username)
        return findResult.length ? findResult[0] : null
    }

    async uploadProfile(tokenUser, req) {
        try {
            let requestBody = req.body
            let desc = requestBody.desc
            let blobImg = req?.files?.blobImg
            let imgPath = ''
            if (blobImg) {
                let random_str = crypto.randomUUID() + '_' + Date.now()
                let userProfilePath = path.join(process.cwd(), `/uploads/userProfile/${tokenUser.id}`)
                if (!fs.existsSync(userProfilePath)) {
                    fs.mkdirSync(userProfilePath, { recursive: true})
                }
                imgPath = `${random_str}.png`
                fs.writeFileSync(path.join(userProfilePath, `/${imgPath}`), blobImg.data, 'binary')
            }
            let modelData = await this.getModelData()
            modelData.forEach(item => {
                if (item.id === tokenUser.id) {
                    item.desc = desc
                    if (imgPath) {
                        item.userImg = imgPath
                    }
                }
            })
            await this.save(modelData)
            return '保存成功'
        } catch (e) {
            throw new Error(e.message)
        }

    }

}

module.exports = UserModel.init()


