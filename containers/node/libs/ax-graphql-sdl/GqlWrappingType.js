const GqlType = require("./GqlType")

class GqlWrappingType {
    #gqlType
    constructor(gqlType){
        if(!(gqlType instanceof GqlType)){
            throw new TypeError('Can only wrap a valid GqlType')
        }

        this.#gqlType = gqlType
    }
    get gqlType(){
        return this.#gqlType
    }
    get name(){
        return this.#gqlType.name
    }
    set gqlType(gqlType){
        if(!(gqlType instanceof GqlType)){
            throw new TypeError('Can only wrap a valid GqlType')
        }

        this.#gqlType = gqlType
    }
    toJSON(){
        let result = {}

        result.isArray = this instanceof GqlWrappingTypeListNonNullableTypeNonNullable ||
            this instanceof GqlWrappingTypeListNonNullableTypeOptional ||
            this instanceof GqlWrappingTypeListOptionalTypeNonNullable ||
            this instanceof GqlWrappingTypeListOptionalTypeOptional

        result.required = result.isArray && (
            this instanceof GqlWrappingTypeListNonNullableTypeNonNullable ||
            this instanceof GqlWrappingTypeListNonNullableTypeOptional
        ) || !result.isArray && this instanceof GqlWrappingTypeNonNullable

        result.requiredInner = result.isArray && (
            this instanceof GqlWrappingTypeListNonNullableTypeNonNullable ||
            this instanceof GqlWrappingTypeListOptionalTypeNonNullable
        )

        result.name = this.#gqlType.name()

        return result
    }
}

module.exports = {
    GqlWrappingType
}

module.exports = {
    ...module.exports,
    GqlWrappingTypeNonNullable: require("./GqlWrappingTypeNonNullable"),
    GqlWrappingTypeOptional: require("./GqlWrappingTypeOptional"),
    GqlWrappingTypeListOptionalTypeNonNullable: require("./GqlWrappingTypeListOptionalTypeNonNullable"),
    GqlWrappingTypeListOptionalTypeOptional: require("./GqlWrappingTypeListOptionalTypeOptional"),
    GqlWrappingTypeListNonNullableTypeNonNullable: require("./GqlWrappingTypeListNonNullableTypeNonNullable"),
    GqlWrappingTypeListNonNullableTypeOptional: require("./GqlWrappingTypeListNonNullableTypeOptional")
}