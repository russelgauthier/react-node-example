/**
 * Author: Russel Gauthier(c) <russel@russelgauthier.com> - All Rights Reserved
 *
 * Consult LICENCE file for more details
 *
 **/

const { GqlField } = require("../ax-apollogoose-sdl")
const mongoose = require("mongoose")

/*
*
* For documentation go to: https://github.com/russelgauthier/ax-paas/issues/104
* Adds refField to GqlField to make determining reference fields determinable in other classes
*
*
* @param {!string} name: {!string}, field name
* @param {!GqlWrappingType} gqlWrappingType
* @param {string} refField - Name of another field that is being referred to
* @param {string} refTo  - Name of the schema that is being referred to
* @param {mongoose.Model} refModel - Model that is being referred to
* @param {boolean} - [hiddenOutput=false] - Whether the field is hidden or not
*
 */
class AxApolloGooseGqlField extends GqlField {
    #refTo = null
    #refField = null
    #refModel = null
    #hiddenOutput = false
    constructor(name, gqlWrappingType, refField, refTo, refModel, hiddenOutput=false){
        super(name, gqlWrappingType)

        if(refField !== undefined){
            if(typeof(refField) !== "string" || !refField.length){
                throw new TypeError(`AxApolloGooseGqlField: refField must be a non-empty string or undefined`)
            }
            if(refTo === undefined || typeof(refTo) !== "string" || !refTo.length){
                throw new TypeError(`AxApolloGooseGqlField: refTo is required if refField is provided and must be a non-empty string`)
            }
            if(refModel !== undefined && (typeof(refModel) !== "function" || !(refModel() instanceof mongoose.Model))){
                throw new TypeError("AxApolloGooseGqlField refModel must be a Mongoose model")
            }

            this.#refField = refField
            this.#refTo = refTo
            this.#refModel = refModel
        }

        if(typeof(hiddenOutput) !== "boolean"){
            throw new TypeError("AxApolloGooseGqlField hiddenOutput must be a boolean(default=false)")
        }

        this.#hiddenOutput = hiddenOutput
    }
    get hiddenOutput(){
        return this.#hiddenOutput
    }
    get refField(){
        return this.#refField
    }
    get refModel(){
        return this.#refModel
    }
    get refTo(){
        return this.#refTo
    }
    set hiddenOutput(hiddenOutput){
        if(typeof(hiddenOutput) !== "boolean"){
            throw new TypeError("AxApolloGooseGqlField hiddenOutput must be a boolean(default=false)")
        }

        this.#hiddenOutput = hiddenOutput
    }
    set refModel(refModel){
        if(typeof(refModel) !== "function" || !(refModel() instanceof mongoose.Model)){
            throw new TypeError("AxApolloGooseGqlField refModel must be a Mongoose model")
        }

        this.#refModel = refModel
    }

    /*
    *
    * Takes an existing GqlField and converts to AxApolloGooseGqlField
    *
    * @param {GqlField}
    * @returns {!AxApolloGooseGqlField}
    *
     */
    static cloneFromGqlFieldType(gqlField){
        if(gqlField instanceof AxApolloGooseGqlField){
            return gqlField
        }

        if(!(gqlField instanceof GqlField)){
            throw new TypeError("AxApolloGooseGqlField: Can only clone GqlField")
        }

        return new AxApolloGooseGqlField(gqlField.name, gqlField.type)
    }
    toJSON(){
        let result = super.toJSON()

        if(this.#refField){
            result = {...result, refField: this.#refField, refTo: this.#refTo, refModel: this.#refModel, hiddenOutput: this.#hiddenOutput}
        }

        return result
    }
    toString(){
        return !this.hiddenOutput ? super.toString() : ""
    }
}

module.exports = AxApolloGooseGqlField