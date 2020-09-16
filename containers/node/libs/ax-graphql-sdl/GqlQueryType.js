const GqlOperationType = require("./GqlOperationType")

class GqlQueryType extends GqlOperationType {
    constructor(){
        super("Query")
    }
}

module.exports = GqlQueryType