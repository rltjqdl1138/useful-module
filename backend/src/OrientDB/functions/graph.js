import {orientdb, model as models} from '@orientdb/orientdb'

class Graph{
    constructor(_model){
        const model = parseModel(_model)
        this.select = `${model.select}`,
        this.name = `${model.name}`
        this.match = `${model.match}`
    }
    In(_edge, _nextModel){
        const nextModel = parseModel(_nextModel)
        const edge = _edge?.length ? `'${_edge}'` : ''
        this.select = `${this.select} ${nextModel.select}`
        this.match = `${this.match}.in(${edge})${nextModel.match}`
        this.name = `${this.name},${nextModel.name}`
        return this
    }
    InE(_edge, _nextModel){
        const nextModel = parseModel(_nextModel)
        const edge = _edge?.length ? `'${_edge}'` : ''
        this.select = `${this.select} ${nextModel.select}`
        this.match = `${this.match}.inE(${edge})${nextModel.match}`
        this.name = `${this.name},${nextModel.name}`
        return this
    }
    InV(_edge, _nextModel){
        const nextModel = parseModel(_nextModel)
        const edge = _edge?.length ? `'${_edge}'` : ''
        this.select = `${this.select} ${nextModel.select}`
        this.match = `${this.match}.inV(${edge})${nextModel.match}`
        this.name = `${this.name},${nextModel.name}`
        return this
    }
    Out(_edge, _nextModel){
        const nextModel = parseModel(_nextModel)
        const edge = _edge?.length ? `'${_edge}'` : ''
        this.select = `${this.select} ${nextModel.select}`
        this.match = `${this.match}.out(${edge})${nextModel.match}`
        this.name = `${this.name},${nextModel.name}`
        return this
    }
    OutE(_edge, _nextModel){
        const nextModel = parseModel(_nextModel)
        const edge = _edge?.length ? `'${_edge}'` : ''
        this.select = `${this.select} ${nextModel.select}`
        this.match = `${this.match}.outE(${edge})${nextModel.match}`
        this.name = `${this.name},${nextModel.name}`
        return this
    }
    OutV(_edge, _nextModel){
        const nextModel = parseModel(_nextModel)
        const edge = _edge?.length ? `'${_edge}'` : ''
        this.select = `${this.select} ${nextModel.select}`
        this.match = `${this.match}.outV(${edge})${nextModel.match}`
        this.name = `${this.name},${nextModel.name}`
        return this
    }
    async Run( option = {} ){
        const {page, skip, limit, order, sort, where} = option
        const orderOption = sort && order ? `ORDER BY ${sort} ${order}` : ''
        const whereOption = where?.length ? `WHERE ${where}` : ''

        let limitOption = ''
        if(!limit);
        else if(skip !== undefined)
            limitOption = `SKIP ${skip} LIMIT ${limit}` 
        else if(page !== undefined)
            limitOption = `SKIP ${limit * page} LIMIT ${limit}`
            
        try{
            const select = `SELECT ${this.select.slice(0,this.select.length - 1)}`
            const match = this.match
            const name = `RETURN ${this.name}`
            const query = `${select} FROM (MATCH ${match} ${name}) ${whereOption} ${orderOption} ${limitOption}`
            // Run
            const queryPromise = orientdb.query(query)
            const countPromise = this.Count(where)
            const result = await queryPromise
            const count = await countPromise
            if(!result)
                return {list:[], count:0}
            const items = result.map(e=>this.parseObject(e))
            return { items, count }
        }catch(e){
            throw e
            //return {list:[], count:0}
        }
    }
    async Count(where){
        const whereOption = where?.length ? `WHERE ${where}` : ''
        try{
            const select = `SELECT COUNT(*) AS count`
            const match = this.match
            const name = `RETURN ${this.name}`
            const query = `${select} FROM (MATCH ${match} ${name}) ${whereOption}`
            const result = await orientdb.query(query)
            if(!result)
                return 0
            return result[0]?.count
        }catch(e){
            return 0
        }
    }
    parseObject(item){
        const mapping = {}
        Object.keys(item).forEach( e =>{
            const parsed_key = e.split('__')
            const key = parsed_key[0]
            const prop = parsed_key[1]
            mapping[key] = mapping[key] ? {...mapping[key], [prop]:item[e]} : {[prop]:item[e]}
        })
        return mapping
    }
}


const parseModel = (_model)=>{
    let { id, name, where, attrs, extraAttr} = _model
    let model = models[id]
    if(!model) return;
    if(id && !name?.length)
        name = id
    else if(typeof name !== 'string')
        name = null
    
    let basicAttributes = []
    while(model){
        basicAttributes = [...basicAttributes, ...Object.keys(model.attributes)]
        if(model.extend === 'V' || model.extend === 'E') break;
        model = model.extend ? models[model.extend] : null
    }
    if(attrs?.length && typeof attrs === 'object')
        attrs = attrs.reduce((prev, attr)=>
            basicAttributes.find(e => attr === e) ? [...prev, attr] : prev
        ,[])
    if(!attrs?.length)
        attrs = basicAttributes
    if(where?.length && typeof where === 'string')
        where = `(${where})`
    else
        where = null

    if(!extraAttr)
        extraAttr = {}
        
    // * Select
    const simpleSelect = attrs.reduce((prev, attr) =>  prev + `${name}.${attr} as ${name}__${attr},`, '')
    const select = Object.keys(extraAttr).reduce( (prev, attr) => `${prev}${extraAttr[attr]} as ${name}__${attr},`, simpleSelect )

    // * Match
    let match = ''
    if(id)
        match = `class:${id}`
    if(name)
        match = match.length ? `${match}, as:${name}` : `as:${name}`
    if(where)
        match = match.length ? `${match}, where:${where}` : `where:${where}`
    match = `{${match}}`

    return {
        select,
        name,
        match
    }
}

module.exports = Graph