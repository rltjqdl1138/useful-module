import {orientdb, model as models} from '@orientdb/orientdb'
import Graph from './graph'
console.log(Graph)
export const RegisterItem = async(model, _attrs)=>{
    const now = Number( new Date() )
    const attrs = {
        ..._attrs,
        created_at: now,
        updated_at: now
    }
    const Model = {
        id:     model,
        attrs:  attrs,
        extraAttr:  null
    }
    return await createQuery(Model)
}
export const GetItem = async ( model, attrs, id )=>{
    const Model = {
        id:     model,
        attrs:  attrs,
        extraAttr:  null
    }
    return await itemQuery(Model, Number(id) )
}
export const UpdateItem = async(model, attrs, id)=>{
    const now = Number( new Date() )
    const Model = {
        id:     model,
        attrs:  { ...attrs, updated_at: now},
        extraAttr:  null,
    }
    return await updateQuery(Model, Number(id))
}
export const DeleteItem = async( model, id )=>{
    const Model = {
        id:     model,
        attrs:  null,
        extraAttr:  null
    }
    return await deleteQuery(Model, Number(id))
}

export const createQuery = async(_model)=>{
    let {id, attrs, extraAttr} = _model

    let model = models[id]
    //let model = models['act_post']
    let id_seq = model.name
    let extend
    if(!model) return;

    let attributes = {}
    let basicAttributes = []
    while(model){
        id_seq = model.name
        attributes = Object.keys(model.attributes).reduce((prev, attr)=>{
            basicAttributes = [...basicAttributes, attr]
            let value = model.attributes[attr].default
            return {
                ...prev,
                [attr]: value === undefined ? null : value
            }
        }, attributes)
        if(model.extend === 'V'){
            extend = 'VERTEX';
            break;
        }
        else if(model.extend === 'E')
            throw {status:500, message:'createQuery 함수는 edge를 생성할 때 쓸 수 없습니다.'}
        
        model = model.extend ? models[model.extend] : null
    }
    
    const simpleInsert = basicAttributes.reduce((prev, attr)=>{
        const query = attr === 'id' ? `sequence('${id_seq}_idseq').next()` : `:${attr}`
        if(attrs[attr] !== undefined)
            attributes[attr] = attrs[attr]
        return prev + (prev.length ? `,${attr}=${query}` : `${attr}=${query}`)
    },'')

    try{
        let insertQuery = ''
        switch(extend){
            case 'VERTEX':
                insertQuery = 'CREATE VERTEX'; break;
            default:
                insertQuery = 'INSERT INTO'
        }
        const query = `${insertQuery} ${id} SET ${simpleInsert}`
        const queryPromise = db.command(query, attributes)
        const result = await queryPromise
        return result
    }catch(e){
        return null;
    }
}