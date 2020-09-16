class AxApolloGooseMongoPredicatesReaderException extends Error {
    constructor(message){
        super(`AxApolloGooseMongoPredicatesReaderException: ${message}`)
        this.name = this.constructor.name

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = AxApolloGooseMongoPredicatesReaderException