const GqlType = require("./GqlType")
const { GqlWrappingType } = require("./GqlWrappingType")
const GqlField = require("./GqlField")

class GqlInputType extends GqlType {
    #fields
    constructor(name, fields){
        super(name)

        if(typeof(fields) !== 'object' || Array.isArray(fields)){
            throw new TypeError('Fields must be an object keyed with the field name with a GqlWrappingType value')
        }

        Object.values(fields).forEach(field => {
            if(!(field instanceof GqlWrappingType)){
                throw new TypeError('Fields must be an object keyed with the field name with a GqlWrappingType value')
            }
        })

        this.#fields = Object.keys(fields).map(field => new GqlField(field, fields[field]))
    }
    get fields(){
        return this.#fields
    }
    addField(name, gqlWrappingType){
        if(!(gqlWrappingType instanceof GqlWrappingType)){
            throw new TypeError('Fields must be a GqlWrappingType value')
        }

        if(this.#fields.map(field => field.name).includes(name)){
            throw new TypeError(`Cannot have a duplicate field: ${name}. Remove first`)
        }

        return this.#fields[this.#fields.push(new GqlField(name, gqlWrappingType)) - 1]
    }
    removeField(name){
        this.#fields = this.#fields.filter(field => field.name !== name)
    }
    toJSON(){
        return {...super.toJSON(), type: 'InputType', fields: this.#fields}
    }
    toString(){
        return `input ${this.name} {\n`
            + Object.values(this.fields).map(field => `\t${field}`).join('\n')
            + `\n}`
    }
}

module.exports = GqlInputType