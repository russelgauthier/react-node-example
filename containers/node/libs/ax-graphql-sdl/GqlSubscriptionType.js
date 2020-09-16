const GqlOperationType = require("./GqlOperationType")

class GqlSubscriptionType extends GqlOperationType {
    constructor(){
        super("Subscription")
    }
}

module.exports = GqlSubscriptionType
