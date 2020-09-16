const { GqlWrappingType } = require("./GqlWrappingType")

class GqlField {
    #name
    #type

    constructor(name, gqlWrappingType){
        if(typeof(name) !== "string" || !name.length){
            throw new TypeError('Field name must be a non-empty string')
        }
        if(!(gqlWrappingType instanceof GqlWrappingType)){
            throw new TypeError('Type must be a GqlWrappingType')
        }

        this.#name = name
        this.#type = gqlWrappingType
    }
    get name(){
        return this.#name
    }
    get type(){
        return this.#type
    }
    set type(gqlWrappingType){
        if(!(gqlWrappingType) instanceof GqlWrappingType){
            throw new TypeError('Type must be a GqlWrappingType')
        }

        this.#type = gqlWrappingType
    }
    toJSON(){
        return {name: this.#name, type: this.#type.toJSON()}
    }
    toString(){
        return `${this.#name}: ${this.#type}`
    }
}

module.exports = GqlField