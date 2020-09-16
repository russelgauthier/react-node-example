const { GqlWrappingType } = require("./GqlWrappingType")

class GqlWrappingTypeListNonNullableTypeNonNullable extends GqlWrappingType {
    toJSON(){
        return `[${this.name}!]!`
    }
    toString(){
        return `[${this.name}!]!`
    }
}

module.exports = GqlWrappingTypeListNonNullableTypeNonNullable