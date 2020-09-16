class GqlType {
    #name
    constructor(name){
        if(typeof(name) !== "string" || !name.length){
            throw new TypeError('Type name must be a non-empty string')
        }

        this.#name = name
    }

    get name(){
        return this.#name
    }
    get Optional(){
        return new GqlWrappingTypeOptional(this)
    }
    get NonNullable(){
        return new GqlWrappingTypeNonNullable(this)
    }
    get ListOptional(){
        let _this = this

        return {
            toString(){
                return _this.toJSON()
            },
            toJSON(){
                return {
                    typeOptional: _this.ListOptional.TypeOptional,
                    typeNonNullable: _this.ListOptional.TypeNonNullable
                }
            },
            get TypeOptional(){
                return new GqlWrappingTypeListOptionalTypeOptional(_this)
            },
            get TypeNonNullable(){
                return new GqlWrappingTypeListOptionalTypeNonNullable(_this)
            }
        }
    }
    get ListNonNullable(){
        let _this = this

        return {
            toString(){
                return _this.toJSON()
            },
            toJSON(){
                return {
                    typeOptional: _this.ListNonNullable.TypeOptional,
                    typeNonNullable: _this.ListNonNullable.TypeNonNullable
                }
            },
            get TypeOptional(){
                return new GqlWrappingTypeListNonNullableTypeOptional(_this)
            },
            get TypeNonNullable(){
                return new GqlWrappingTypeListNonNullableTypeNonNullable(_this)
            }
        }
    }
    getWrappingType(isArray = false, required = false, requiredInner = false){
        if(typeof(isArray) !== "boolean" || typeof(required) !== "boolean" || typeof(requiredInner) !== "boolean"){
            throw new TypeError("getWrappingType requires isArray, required & requiredInner to be boolean")
        }

        let result = null

        if(isArray && required && requiredInner){
            result = this.ListNonNullable.TypeNonNullable
        } else if(isArray && required && !requiredInner){
            result = this.ListNonNullable.TypeOptional
        } else if(isArray && !required && requiredInner){
            result = this.ListOptional.TypeNonNullable
        } else if(isArray && !required && !requiredInner){
            result = this.ListOptional.TypeOptional
        } else if(!isArray && required){
            result = this.NonNullable
        } else if(!isArray && !required){
            result = this.Optional
        }

        return result
    }
    toJSON(){
        return {
            optional: this.Optional,
            listOptional: this.ListOptional,
            nonNullable: this.NonNullable,
            listNonNullable: this.ListNonNullable,

            name: this.#name
        }
    }
    toString(){
        return this.toJSON()
    }
}

module.exports = GqlType

const {
    GqlWrappingTypeOptional, GqlWrappingTypeNonNullable,
    GqlWrappingTypeListOptionalTypeNonNullable, GqlWrappingTypeListOptionalTypeOptional,
    GqlWrappingTypeListNonNullableTypeNonNullable, GqlWrappingTypeListNonNullableTypeOptional
} = require("./GqlWrappingType")
