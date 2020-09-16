const mongoose = require("mongoose")
const MongooseMiddlewareGenException = require("./MongooseMiddlewareGenException")

class MongooseMiddlewareGen {
    #model
    constructor(model){
        if(!(model() instanceof mongoose.Model)){
            throw new MongooseMiddlewareGenException("model must be a mongoose Model")
        }

        this.#model = model
    }
    deleteMany(type, _this){
        if(typeof(type) !== "string"){
            throw new MongooseMiddlewareGenException("deleteMany: Type must be a string")
        }
        let validTypes = ["parentChildTree"]

        if(!validTypes.includes(type)){
            throw new MongooseMiddlewareGenException(`deleteMany: Provided type is invalid: ${type}. Valid types are: ${JSON.stringify(validTypes)}`)
        }

        return (async _this => {
            let queryModel = _this

            let queryResults = await this.#model.find(queryModel.getQuery(), {_id: 1, _children: 1})
            for(let queryResult of queryResults){
                if(queryResult._children.length){
                    await this.#model.deleteMany({_id: {$in: queryResult._children}})
                }
            }
        })(_this)
    }
    deleteOne(type, _this){
        if(typeof(type) !== "string"){
            throw new MongooseMiddlewareGenException("deleteOne: Type must be a string")
        }
        let validTypes = ["parentChildTree"]

        if(!validTypes.includes(type)){
            throw new MongooseMiddlewareGenException(`deleteOne: Provided type is invalid: ${type}. Valid types are: ${JSON.stringify(validTypes)}`)
        }

        return (async _this => {
            let itemDoc = _this
            if(itemDoc._parent !== null){
                await this.#model.updateOne({_id: itemDoc._parent}, {$pull: {_children: itemDoc._id}}, {runValidators: true, new: true})
            }

            if(itemDoc._children.length){
                await this.#model.deleteMany({_parent: itemDoc._id}, {runValidators: true, new: true})
            }
        })(_this)
    }
    findOneAndUpdate(type, _this){
        if(typeof(type) !== "string"){
            throw new MongooseMiddlewareGenException("findOneAndUpdate: Type must be a string")
        }
        let validTypes = ["parentChildTree"]

        if(!validTypes.includes(type)){
            throw new MongooseMiddlewareGenException(`findOneAndUpdate: Provided type is invalid: ${type}. Valid types are: ${JSON.stringify(validTypes)}`)
        }

        return (async _this => {
            let updateQuery = _this.getUpdate()
            let query = _this.getQuery()
            let itemDoc = null

            if(updateQuery?.$set?._parent){
                let parentId = updateQuery?.$set?._parent

                itemDoc = await this.#model.findOne(query, {_parent: 1, _id: 1}).lean()
                if(itemDoc._parent.toString() !== parentId) {
                    await this.#model.updateOne({_id: itemDoc._parent}, {$pull: {_children: itemDoc._id}}, {runValidators: true, new: true})
                    await this.#model.updateOne({_id: parentId}, {$push: {_children: itemDoc._id}}, {runValidators: true, new: true})
                }
            }
        })(_this)
    }
    save(type, _this){
        if(typeof(type) !== "string"){
            throw new MongooseMiddlewareGenException("save: Type must be a string")
        }
        let validTypes = ["parentChildTree"]

        if(!validTypes.includes(type)){
            throw new MongooseMiddlewareGenException(`save: Provided type is invalid: ${type}. Valid types are: ${JSON.stringify(validTypes)}`)
        }

        return (async _this => {
            const itemDoc = _this

            if(itemDoc._parent !== null){
                await this.#model.findOneAndUpdate({_id: itemDoc._parent}, {$push: {_children: itemDoc._id}}, {runValidators: true, new: true})
            }
        })(_this)
    }
}

module.exports = MongooseMiddlewareGen