class AxApolloGooseMongooseReaderException extends Error {
    constructor(message){
        super(`AxApolloGooseMongooseReaderException: ${message}`)
        this.name = this.constructor.name

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = AxApolloGooseMongooseReaderException