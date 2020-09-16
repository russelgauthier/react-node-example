module.exports = {
    ...require("./ax-graphql-sdl/GqlSDL"),
    GqlField: require("./ax-graphql-sdl/GqlField"),
    GqlFieldWithDefaults: require("./ax-graphql-sdl/GqlFieldWithDefaults"),
    GqlType: require("./ax-graphql-sdl/GqlType"),
    ...require("./ax-graphql-sdl/GqlWrappingType")
}
