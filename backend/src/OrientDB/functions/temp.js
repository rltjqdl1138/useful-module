import {orientdb, model as models} from '@orientdb/orientdb'

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
export const GetItem = async ( model, attrs, where )=>{
    const Model = {
        id:     model,
        attrs:  attrs,
        extraAttr:  null
    }
    return await itemQuery(Model, where )
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

export const itemQuery = async(_model, _where)=>{
    let { id, attrs, extraAttr } = _model
    let basicAttributes = []
    let model = models[id]
    if(!model) return;
    
    while(model && model.extend !== "V" && model.extend !== 'E'){
        basicAttributes.push( ...Object.keys(model.attributes) )
        model = models[model.extend] || null
    }

    if(attrs?.length && typeof attrs === 'object'){
        attrs = attrs.filter( e => basicAttributes.includes(e))
        //attrs.push("@rid")
    }
    if(!attrs?.length)
        attrs = null

    if(extraAttr)
        attrs.push(...Object.entries(extraAttr).map( ([key,value])=>`${value} as ${key}`))

    const SelectQuery = attrs ? attrs.join(',') : "*"
    
    // * Select
    try{
        let whereQuery= ''
        if( typeof _where === 'string')
            whereQuery= `WHERE ${_where}`
        else if( typeof _where === 'number')
            whereQuery= `WHERE id=${_where}`
            
        const query = `SELECT ${SelectQuery} FROM ${id} ${whereQuery}`
        // Run
        const queryPromise = orientdb.query(query)
        const result = await queryPromise
        return result[0]
    }catch(e){
        return undefined
    }
}


export const createQuery = (_model)=>{
    let {id, attrs, extraAttr} = _model

    let model = models[id]

    let id_seq = model.name
    let extend
    if(!model) return;

    let attributes = {}
    // set default values
    while(model){
        id_seq = model.name
        attributes = Object
            .entries(model.attributes)
            .reduce((prev, [key,attr])=>{
                const defaultValue = attr.default
                if(defaultValue !== undefined && attrs[key] === undefined)
                    attrs[key] = defaultValue
                return {
                    ...prev,
                    [key]: defaultValue === undefined ? null : defaultValue
                }
        }, attributes)

        if(model.extend === 'V'){
            extend = 'VERTEX';
            break;
        }
        
        else if(model.extend === 'E')
            throw {status:500, message:'createQuery 함수는 edge를 생성할 때 쓸 수 없습니다.'}
        
        model = models[model.extend] || null
    }

    let idQuery = ''
    if(attributes.id !== undefined){
        delete attributes['id']
        idQuery = `id=sequence('${id_seq}_idseq').next(),`
    }
    const SetQuery = idQuery + Object
        .keys(attributes)
        .map( key => `${key}=:${key}`)
        .join(',')

    const InsertQuery = extend === 'VERTEX' ? 'CREATE VERTEX' : 'INSERT INTO'

    const query = `${InsertQuery} ${id} SET ${SetQuery}`
    return orientdb.command(query, attrs)
}