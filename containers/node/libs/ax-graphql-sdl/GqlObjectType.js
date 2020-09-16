const GqlType = require("./GqlType")
const { GqlWrappingType } = require("./GqlWrappingType")
const GqlField = require("./GqlField")

class GqlObjectType extends GqlType {
    #fields
    #implementedInterfaces = []
    constructor(name, fields = {}, implementedInterfaces = []){
        super(name)

        if(typeof(fields) !== 'object' || Array.isArray(fields)){
            throw new TypeError('Fields must be an object keyed with the field name with a GqlWrappingType value')
        }

        Object.values(fields).forEach(field => {
            if(!(field instanceof GqlWrappingType) && !(field instanceof GqlField)){
                throw new TypeError('Fields must be an object keyed with the field name with a GqlWrappingType or GqlField value')
            }
        })

        if(!Array.isArray(implementedInterfaces)){
            this.#implementedInterfaces.push(implementedInterfaces)
        } else {
            this.#implementedInterfaces = implementedInterfaces
        }

        this.#implementedInterfaces.forEach(implementedInterface => {
            if(!(implementedInterface instanceof GqlInterfaceType)){
                throw new TypeError('GqlObjectType & GqlInterfaceType can only implement other GqlInterfaceTypes. If implemented interfaces provided, provide single GqlInterface or an array of GqlInterfaces')
            }
        })

        this.#fields = Object.keys(fields).map(field => {
            let fieldValue = fields[field]

            return fieldValue instanceof GqlWrappingType ? new GqlField(field, fieldValue) : fieldValue
        })
    }
    getField(name=""){
        if(name === undefined || typeof(name) !== "string" || !name.length){
            throw new TypeError('GqlObjectType & GqlInterfaceType field getter requires a non-empty string')
        }

        return this.#fields.filter(field => field.name !== name)?.[0] || null
    }
    get fields(){
        return this.#fields
    }
    get implementedInterfaces(){
        return this.#implementedInterfaces
    }
    set fields(fields){
        fields.forEach(field => {
            if(!(field instanceof GqlField)){
                throw new TypeError('GqlObjectType can only add fields of type GqlField')
            }
        })

        this.#fields = fields
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
    addInterface(gqlInterfaceType){
        if(!(gqlInterfaceType instanceof GqlInterfaceType)){
            throw new TypeError('GqlObjectType & GqlInterfaceType can only implement other GqlInterfaceTypes')
        }

        if(this.#implementedInterfaces.map(intrface => intrface.name).includes(gqlInterfaceType.name)){
            throw new TypeError(`GqlObjectType & GqlInterfaceType cannot add interfaces duplicate names: ${gqlInterfaceType.name}`)
        }

        this.#implementedInterfaces.push(gqlInterfaceType)
    }
    removeField(name){
        this.#fields = this.#fields.filter(field => field.name !== name)
    }
    toJSON(){
        return {...super.toJSON(), type: 'ObjectType', fields: this.#fields}
    }
    toString(){
        return `type ${this.name} `
            + (!this.#implementedInterfaces.length ? "" : `implements ` + this.#implementedInterfaces.map(implementedInterface => {
                return implementedInterface.name
            }).join(" & ") + " ")
            + `{\n`
            + Object.values(this.fields).map(field => `\t${field}`).join('\n')
            + `\n}`
    }
}

module.exports = GqlObjectType

const GqlInterfaceType = require("./GqlInterfaceType")