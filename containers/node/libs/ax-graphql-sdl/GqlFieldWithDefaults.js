const GqlField = require("./GqlField")

class GqlFieldWithDefaults extends GqlField {
    #defaultValue
    constructor(name, gqlWrappingType, defaultValue){
        super(name, gqlWrappingType)

        this.#defaultValue = defaultValue
    }

    toJSON(){
        let json = super.toJSON()

        if(this.#defaultValue !== undefined){
            json.defaultValue = this.#defaultValue
        }

        return json
    }
    toString(){
        let result = super.toString()

        if(this.#defaultValue !== undefined){
            result += ` = ${this.#defaultValue}`
        }

        return result
    }
}

module.exports = GqlFieldWithDefaults