const { GqlSDL, GqlField, GqlInterfaceType, GqlObjectType, GqlWrappingType } = require("./ax-apollo-sdl.js")

module.exports = {
    ...require("./ax-apollo-sdl"),
    GqlField,
    GqlInterfaceType,
    GqlObjectType,
    GqlSDL,
    GqlWrappingType
}

module.exports = {
    ...module.exports,
    GqlInterfaceType: require("./ax-apollogoose-sdl/AxApolloGooseGqlInterfaceType"),
    ...require("./ax-apollogoose-sdl/AxApolloGooseSdl")
}
