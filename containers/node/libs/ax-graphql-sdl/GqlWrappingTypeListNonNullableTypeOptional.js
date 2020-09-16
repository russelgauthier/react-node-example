const { GqlWrappingType } = require("./GqlWrappingType")

class GqlWrappingTypeListNonNullableTypeOptional extends GqlWrappingType {
    toJSON(){
        return `[${this.name}]!`
    }
    toString(){
        return `[${this.name}]!`
    }
}

module.exports = GqlWrappingTypeListNonNullableTypeOptional
