const GqlOperationType = require("./GqlOperationType")

class GqlMutationType extends GqlOperationType {
    constructor(){
        super("Mutation")
    }
}

module.exports = GqlMutationType
