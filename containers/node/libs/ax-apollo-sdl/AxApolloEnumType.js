const { GqlEnumType } = require("../ax-apollo-sdl")

/*
*
* Reference: https://www.apollographql.com/docs/apollo-server/schema/scalars-enums/#enums
*
 */
class AxApolloEnumType extends GqlEnumType {
    #optionValues
    constructor(name, optionKeys, optionValues){
        optionKeys = super(name, optionKeys).options //They can be transformed (GqlSDL.nameTransform() is run on all names)

        if(optionValues !== undefined && (!Array.isArray(optionValues) || optionValues.length !== optionKeys.length)){
            throw new TypeError("AxApolloEnumType requires optionKeys, if specified, to be the same length as options")
        }

        if(optionValues === undefined){
            optionValues = optionKeys
        }

        this.#optionValues = optionValues
    }
    get optionKeys(){
        return this.options
    }
    getResolverMap(){
        let result = {
            [this.name]: {}
        }

        this.optionKeys.forEach((optionKey, i) => {
            result[this.name][optionKey] = this.#optionValues[i]
        })

        return result
    }
    toJSON(){
        return {...super.toJSON(), map: this.getResolverMap()}
    }
}

module.exports = AxApolloEnumType
