const { GraphQLScalarType } = require('graphql')

module.exports = {
    ...require("./ax-graphql-sdl"),
    GraphQLScalarType
}

const {
    AxApolloSDL,
    AxApolloCustomScalarType,
    AxApolloMutationType, AxApolloQueryType, AxApolloSubscriptionType,
    AxApolloUnionType
} = require("./ax-apollo-sdl/AxApolloSDL")

module.exports = {
    ...module.exports,
    GqlSDL: AxApolloSDL,
    GqlCustomScalarType: AxApolloCustomScalarType,
    GqlEnumType: require("./ax-apollo-sdl/AxApolloEnumType"),
    GqlMutationType: AxApolloMutationType, GqlQueryType: AxApolloQueryType, GqlSubscriptionType: AxApolloSubscriptionType,
    GqlSelection: require("./ax-apollo-sdl/AxApolloSelection"),
    GqlUnionType: AxApolloUnionType
}

//Deleting classes not to be exported
for(let className of ["GraphQLScalarType", "GqlOperationType", "GqlQueryType", "GqlMutationType", "GqlSubscriptionType"]){
    delete module.exports[className]
}