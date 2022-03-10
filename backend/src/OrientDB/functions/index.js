import * as temp from './temp'
import Graph from './graph'

export const graphQuery = (model)=>{
    return new Graph(model)
}

export const createQuery = temp.createQuery
export const RegisterItem = temp.RegisterItem
export const GetItem = temp.GetItem