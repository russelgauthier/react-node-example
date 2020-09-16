const { GqlCustomScalarType, GraphQLScalarType } = require("../ax-apollo-sdl")

/*
*
* Reference: https://www.apollographql.com/docs/apollo-server/schema/scalars-enums/#custom-graphqlscalartype-instance
*
 */
class AxApolloCustomScalarType extends GqlCustomScalarType {
    #description
    #parseValueFnc
    #serializeFnc
    #parseLiteralFnc
    #hasResolver = false

    /*
    *
    * @param name: {!String} - name of the custom scalar
    * @param description: {String} - description of the custom scalar
    * @param parseValueFnc: {function} - Parse Value Function
    * @param serializeFnc: {function} - Serialize Function
    * @param parseLiteralFnc: {function} - Parse Literal Function
    *
    * NB: Either description, parseValueFnc, serializeFnc, parseLiteralFnc are all defined or they aren't defined
    *
    * @return {!GqlCustomScalarType}
    *
     */
    constructor(name, description, parseValueFnc, serializeFnc, parseLiteralFnc){
        super(name)

        if(description !== undefined && parseValueFnc !== undefined && serializeFnc !== undefined && parseLiteralFnc !== undefined){
            if(typeof(description) !== "string"){
                throw new TypeError("AxGqlCustomScalarType description must be a string")
            }
            if(typeof(parseValueFnc) !== "function"){
                throw new TypeError("GqlCustomScalarType parseValueFnc must be a function")
            }
            if(typeof(serializeFnc) !== "function"){
                throw new TypeError("GqlCustomScalarType serializeFnc must be a function")
            }
            if(typeof(parseLiteralFnc) !== "function"){
                throw new TypeError("GqlCustomScalarType parseLiteralFnc must be a function")
            }

            this.#parseValueFnc = parseValueFnc
            this.#serializeFnc = serializeFnc
            this.#parseLiteralFnc = parseLiteralFnc
            this.#hasResolver = true
        }

        this.#description = description
    }
    get description(){
        return this.#description
    }
    getResolverMap(){
        let result = {}

        if(this.#hasResolver){
            result[this.name] = new GraphQLScalarType({
                name: this.name,
                description: this.#description,
                parseValue: this.#parseValueFnc,
                serialize: this.#serializeFnc,
                parseLiteral: this.#parseLiteralFnc
            })
        }

        return result
    }
    toJSON(){
        return {
            ...super.toJSON(),
            description: this.#description
        }
    }
}

module.exports = AxApolloCustomScalarType