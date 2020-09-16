class AxApolloGooseException extends Error {
    constructor(message){
        super(`AxApolloGooseException: ${message}`)
        this.name = this.constructor.name

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = AxApolloGooseException