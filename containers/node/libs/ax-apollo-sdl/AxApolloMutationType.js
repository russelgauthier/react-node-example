const AxApolloOperationType = require("./AxApolloOperationType")

class AxApolloMutationType extends AxApolloOperationType {
    constructor(){
        super("Mutation")
    }
}

module.exports = AxApolloMutationType
