const GqlFieldWithDefaults = require("./GqlFieldWithDefaults")
const GqlInputType = require("./GqlInputType")
const { GqlWrappingType } = require("./GqlWrappingType")

class GqlSelection {
    #name
    #outputType
    #args = []

    /*
    *
    * @param name: {!String}, name of the selection
    * @param outputType: {!GqlWrappingType}
    * @param args: {Object} - Key-value pair, {{!String}:GqlWrappingType|GqlInputType|GqlInterfaceType}
    *
     */
    constructor(name, outputType, args = {}){
        if(typeof(name) !== "string" || !name.length){
            throw new TypeError('Selection name must be a non-empty string')
        }

        if(!(outputType instanceof GqlWrappingType)){
            throw new TypeError('Output type of Selection must be a GqlWrappingType')
        }

        //Args is either undefined, or an object
        if(typeof(args) !== "object" || Array.isArray(args)){
            throw new TypeError("Selection args must be an object keyed with the argument name with a non-input GqlWrappingType value, or an object containing GqlWrappingType(name) and defaultValue")
        }

        this.#args = Object.keys(args).map(arg => {
            if(args[arg]?.type !== undefined){
                if(!(args[arg].type instanceof GqlWrappingType)){
                    throw new TypeError("Selection args must be an object keyed with the argument name with a non-input GqlWrappingType value, or an object containing GqlWrappingType(name) and defaultValue")
                }

                //NB: If defaultValue doesn't match the type that is given, ApolloGraphQL, and perhaps other implementations don't pass the argument to the resolver when not provided in Query
                return new GqlFieldWithDefaults(arg, args[arg].type, JSON.stringify(args[arg]?.defaultValue))
            } else {
                if(!(args[arg] instanceof GqlWrappingType) && !args[arg].gqlType instanceof GqlInputType){
                    throw new TypeError("Selection args must be an object keyed with the argument name with a non-input GqlWrappingType value, or an object containing GqlWrappingType(name) and defaultValue")
                }

                return new GqlFieldWithDefaults(arg, args[arg])
            }
        })


        this.#name = name
        this.#outputType = outputType
    }

    get name(){
        return this.#name
    }
    get outputType(){
        return this.#outputType
    }

    set name(name){
        if(typeof(name) !== "string"){
            throw new TypeError("Selection name has to be a string")
        }
        this.#name = name
    }
    toJSON(){
        return {
            name: this.#name,
            args: this.#args,
            outputType: this.#outputType
        }
    }
    toString(){
        let result = `${this.#name}`

        let argsString = Object.values(this.#args).join(', ')

        result += (argsString.length ? `(${argsString})` : "")
            + `: ${this.#outputType}`

        return result
    }
}

module.exports = GqlSelection