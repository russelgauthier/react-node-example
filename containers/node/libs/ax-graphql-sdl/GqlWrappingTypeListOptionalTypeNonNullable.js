const { GqlWrappingType } = require("./GqlWrappingType")

class GqlWrappingTypeListOptionalTypeNonNullable extends GqlWrappingType {
    toJSON(){
        return `[${this.name}!]`
    }
    toString(){
        return `[${this.name}!]`
    }
}

module.exports = GqlWrappingTypeListOptionalTypeNonNullable