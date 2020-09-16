const { GqlWrappingType } = require("./GqlWrappingType")

class GqlWrappingTypeOptional extends GqlWrappingType {
    toJSON(){
        return this.name
    }
    toString(){
        return this.name
    }
}

module.exports = GqlWrappingTypeOptional