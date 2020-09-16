const { GqlSelection } = require("../ax-graphql-sdl")

class AxApolloSelection extends GqlSelection {
    #resolverFnc
    constructor(name, outputType, args, resolverFnc){
        if(typeof(resolverFnc) !== "undefined" && typeof(resolverFnc) !== "function"){
            throw new TypeError(`AxApolloSelection resolverFnc must be a function`)
        }

        super(name, outputType, args)

        this.#resolverFnc = resolverFnc
    }
    get resolverFnc(){
        return this.#resolverFnc
    }
    toJSON(){
        return {...super.toJSON(), resolverFnc: this.#resolverFnc}
    }
}

module.exports = AxApolloSelection