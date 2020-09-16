class MongooseMiddlewareGenException extends Error {
    constructor(message){
        super(`AxMongooseMiddlewareGenException: ${message}`)
        this.name = this.constructor.name

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = MongooseMiddlewareGenException