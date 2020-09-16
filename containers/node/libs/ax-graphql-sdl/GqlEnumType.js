const GqlType = require("./GqlType")
const { GqlSDL } = require("./GqlSDL")

class GqlEnumType extends GqlType {
    #name
    #options = []
    constructor(name, options){
        super(name)

        this.#name = name

        //Either it can be an array of Strings
        if(!Array.isArray(options) || !options.length){
            throw new TypeError('Values for GqlEnum must be a non-empty array of strings')
        }

        options.map(option => {
            if(typeof(option) !== "string"){
                throw new TypeError('Values for GqlEnum must be a non-empty array of strings')
            }

            return GqlSDL.nameTransform(option, true)
        })

        this.#options = options
    }

    get options(){
        return this.#options
    }

    toJSON(){
        return {
            type: 'EnumType',
            name: this.#name,
            values: this.#options
        }
    }
    toString(){
        return `enum ${this.#name} {\n\t`
            + this.#options.join('\n\t')
            + '\n}'
    }
}

module.exports = GqlEnumType