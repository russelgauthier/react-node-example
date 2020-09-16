/**
 * Author: Russel Gauthier(c) <russel@russelgauthier.com> - All Rights Reserved
 *
 * Consult LICENCE file for more details
 *
 **/
const MongoClient = require('mongodb').MongoClient

const {env} = require('./../config/config')
/*
const mongoconnection = (function(dbName, url){
    let client = null
    let db = null

    async function getDb(){
        try {
            if (!client) {
                client = await MongoClient.connect(url, {useNewUrlParser: true})
            }
            if (!db) {
                db = client.db(dbName)
            }

            return db
        } catch(e){
            throw new Error(e.message)
        }
    }
    async function close(){
        try {
            if (client) {
                await client.close()
            }
        } catch(e){
            throw new Error(e.message)
        }
    }

    return {
        getDb,
        close
    }
})(env.mongo.dbName, env.mongo.url)

*/

module.exports = {mongoconnection}