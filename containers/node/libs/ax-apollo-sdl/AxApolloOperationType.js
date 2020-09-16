const { GqlOperationType } = require("../ax-apollo-sdl")
const AxApolloSelection = require("./AxApolloSelection")

class AxApolloOperationType extends GqlOperationType {
    constructor(name){
        super(name)
    }
    addSelectionByParams(name, outputType, args, resolverFnc){
        let gqlSelection = new AxApolloSelection(name, outputType, args, resolverFnc)

        return this.addSelection(gqlSelection)
    }
    addSelectionsByParams(params){
        if(!Array.isArray(params)){
            throw new TypeError(`AxApolloOperationType->addSelectionByParams to ${this.name}Type requires an array of params`)
        }

        return params.map(param => this.addSelectionByParams(param.name, param.outputType, param.args, param.resolverFnc))
    }
    getResolverMap(){
        let result = {
            [this.name]: {}
        }

        Object.values(this.selectionSet).filter(selection => selection.resolverFnc !== undefined)
            .forEach(selection => result[this.name][selection.name] = selection.resolverFnc)

        return result
    }
}

module.exports = AxApolloOperationType
