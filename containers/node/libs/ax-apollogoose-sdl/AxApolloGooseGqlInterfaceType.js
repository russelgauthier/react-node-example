const { GqlInterfaceType } = require("../ax-apollogoose-sdl")

class AxApolloGooseGqlInterfaceType extends GqlInterfaceType {
    constructor(name, fields, implementedInterfaces){
        super(name, fields, implementedInterfaces)
    }
    addField(name, gqlWrappingType){
        return super.addField(name, gqlWrappingType)
    }
}

module.exports = AxApolloGooseGqlInterfaceType