const { GqlWrappingType } = require("./GqlWrappingType")

class GqlWrappingTypeNonNullable extends GqlWrappingType {
    toJSON(){
        return `${this.name}!`
    }
    toString(){
        return `${this.name}!`
    }
}

module.exports = GqlWrappingTypeNonNullable
