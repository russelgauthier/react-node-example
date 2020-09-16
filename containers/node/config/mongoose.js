/**
 * Author: Russel Gauthier(c) <russel@russelgauthier.com> - All Rights Reserved
 *
 *
 * Consult LICENCE file for more details
 *
 **/
let mongoose = require('mongoose')

function mongooseconnect(){
    return new Promise((resolve, reject) => {
        const {env} = require('./../config/config')

        if(!env.isConnected) {
            mongoose.Promise = global.Promise
            const mongoUri = env.MONGODB_URI

            try {
                mongoose.connect(mongoUri, {
                    useCreateIndex: true,
                    useFindAndModify: false,    /* TODO: study this option. Is it necessary? */
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                }).then(() => {
                    process.env.isConnected = true

                    console.log("MONGO: CONNECTED--------------")
                    resolve(true)
                }, e => {
                    reject({description: e.message || e})
                })
            } catch (e) {
                reject({description: e.message || e})
            }
        } else {
            console.log("MONGO: ALREADY CONNECTED------------")
            resolve(true)
        }
    })
}

//Try connecting initially every 1s until mongo is up
function connectmongo(){
    console.log("connectmongo()")

    setTimeout(() => {
        if(!process.env.isConnected){
            mongooseconnect()
            .then(() => {
                connectmongo()
            }, e => {
                connectmongo()
            })
            .catch(e => {
                connectmongo()
            })
        }
    }, 1000)
}

connectmongo()

module.exports = {mongooseconnect}
