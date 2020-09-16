const { GqlObjectType } = require("../ax-apollogoose-sdl")
const AxApolloGooseGqlField = require("./AxApolloGooseGqlField")

const mongoose = require("mongoose")

class AxApolloGooseGqlObjectType extends GqlObjectType {
    #hiddenOutput = false
    constructor(name, fields={}, implementedInterfaces=[], hiddenOutput=false){
        super(name, fields, implementedInterfaces)

        if(typeof(hiddenOutput) !== "boolean"){
            throw new TypeError("AxApolloGooseGqlObjectType: hiddenOutput must be a boolean(default=false)")
        }

        this.#hiddenOutput = hiddenOutput

        //Resetting fields to AxApolloGooseGqlField type
        this.fields = this.fields.map(field => {
            let gqlField = AxApolloGooseGqlField.cloneFromGqlFieldType(field)

            //Adding hiddenOutput field, if set & removing temp field
            if(gqlField.type.hiddenOutput !== undefined){
                gqlField.hiddenOutput = gqlField.type.hiddenOutput

                delete gqlField.type.hiddenOutput
            } else if(gqlField.type.gqlType.hiddenOutput){
                gqlField.hiddenOutput = gqlField.type.gqlType.hiddenOutput
            }

            return gqlField
        })
    }
    get hiddenOutput(){
        return this.#hiddenOutput
    }
    set hiddenOutput(hidden){
        if(typeof(hidden) !== "boolean"){
            throw new TypeError("AxApolloGooseGqlObjectType: hiddenOutput must be a boolean(default=false)")
        }

        this.#hiddenOutput = hidden
    }
    addField(name, gqlWrappingType, refField, refModel){
        if(refField !== undefined && refField.length){
            if(!(gqlWrappingType instanceof GqlWrappingType)){
                throw new TypeError('Fields must be a GqlWrappingType value')
            }
            if(this.fields.map(field => field.name).includes(name)){
                throw new TypeError(`Cannot have a duplicate field: ${name}. Remove first`)
            }
            if(typeof(refModel) !== "function" || !(refModel() instanceof mongoose.Model)){
                throw new TypeError("AxApolloGooseGqlObjectType->addField refModel must be a Mongoose model")
            }

            return this.fields[this.fields.push(new AxApolloGooseGqlField(name, gqlWrappingType, refField, refModel)) - 1]
        } else {
            return super.addField(name, gqlWrappingType)
        }
    }
    toJSON(){
        return {...super.toJSON(), hiddenOutput: this.hiddenOutput}
    }
    toString(){
        return !this.hiddenOutput ? super.toString() : ""
    }
}

module.exports = {
    AxApolloGooseGqlObjectType,
    AxApolloGooseGqlField
}
