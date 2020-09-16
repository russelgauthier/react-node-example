const AxApolloOperationType = require("./AxApolloOperationType")

class AxApolloSubscriptionType extends AxApolloOperationType {
    constructor(){
        super("Subscription")
    }
}

module.exports = AxApolloSubscriptionType
