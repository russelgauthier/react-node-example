const { GqlWrappingType } = require("./GqlWrappingType")

class GqlWrappingTypeListOptionalTypeOptional extends GqlWrappingType {
    toJSON(){
        return `[${this.name}]`
    }
    toString(){
        return `[${this.name}]`
    }
}

module.exports = GqlWrappingTypeListOptionalTypeOptional