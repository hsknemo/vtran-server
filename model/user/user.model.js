let {sql, exec, transaction, config} = require('../../config/mysql')
const crypto = require("crypto");
const fs = require('fs')
const path = require('path')
const moment = require("moment");
require('dotenv').config();

class UserModel {
    constructor() {

    }

    getUser() {
        this.userModel = require('./user.json')
        return this.userModel
    }

    static init() {
        return new this()
    }

    async checkUserIsExitById(user) {
        return new Promise((resolve, reject) => {
            let isHasUser =  false
            let userModel = this.getUser()
            userModel.forEach(item => {
                if (item.id === user.userId) {
                    isHasUser= true
                }
            })
            resolve(isHasUser)
        })

    }

    async checkUserIsExit(user) {
        return new Promise((resolve, reject) => {
            let isHasUser =  false
            let userModel = this.getUser()
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
        let userModel = this.getUser()
        if (user.id) {
            userModel = userModel.filter(item => item.id !== user.id)
            user.updateTime = moment().format('YYYY-MM-DD HH:mm:ss')
        } else {
            user.id = crypto.randomUUID()
            user.insertTime = moment().format('YYYY-MM-DD HH:mm:ss')
        }
        userModel.push(user)
        fs.writeFileSync(path.resolve(__dirname, './user.json'), JSON.stringify(this.userModel, null, 2), 'utf-8')
        return user
    }

    findUserAll(tokenUser) {
        let user = this.getUser()
        return user.filter(item => item.username !== tokenUser.username)
    }

    async updateUserOnlineStatus(userId, onlineStatus) {
        let userModel = this.getUser()
        let bool = await this.checkUserIsExitById({userId})
        if (!bool) {
            throw new Error('用户不存在')
        }
        let findResult = userModel.filter(item => item.id === userId)
        if (!findResult.length) return
        findResult[0].isOnline = onlineStatus
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
        let userModel = this.getUser()
        let bool = await this.checkUserIsExit({username})
        if (!bool) {
            throw new Error('用户不存在')
        }
        let findResult = userModel.filter(item => item.username === username)
        return findResult.length ? findResult[0] : null
    }

}

module.exports = UserModel.init()


