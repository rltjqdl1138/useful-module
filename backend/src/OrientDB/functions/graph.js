import {orientdb, model as models} from '@orientdb/orientdb'

class Graph{
  constructor(_model){
    const model = parseModel(_model)
    this.select = [model.select],
    this.name = [model.name]
    this.match = model.match
  }
  In(_edge, _nextModel){
    const nextModel = parseModel(_nextModel)
    const edge = _edge?.length ? `'${_edge}'` : ''
    this.select.push(nextModel.select)
    this.name.push(nextModel.name)
    this.match = `${this.match}.in(${edge})${nextModel.match}`
    return this
  }
  InE(_edge, _nextModel){
    const nextModel = parseModel(_nextModel)
    const edge = _edge?.length ? `'${_edge}'` : ''
    this.select.push(nextModel.select)
    this.name.push(nextModel.name)
    this.match = `${this.match}.inE(${edge})${nextModel.match}`
    return this
  }
  InV(_edge, _nextModel){
    const nextModel = parseModel(_nextModel)
    const edge = _edge?.length ? `'${_edge}'` : ''
    this.select.push(nextModel.select)
    this.name.push(nextModel.name)
    this.match = `${this.match}.inV(${edge})${nextModel.match}`
    return this
  }
  Out(_edge, _nextModel){
    const nextModel = parseModel(_nextModel)
    const edge = _edge?.length ? `'${_edge}'` : ''
    this.select.push(nextModel.select)
    this.name.push(nextModel.name)
    this.match = `${this.match}.out(${edge})${nextModel.match}`
    return this
  }
  OutE(_edge, _nextModel){
    const nextModel = parseModel(_nextModel)
    const edge = _edge?.length ? `'${_edge}'` : ''
    this.select.push(nextModel.select)
    this.name.push(nextModel.name)
    this.match = `${this.match}.outE(${edge})${nextModel.match}`
    return this
  }
  OutV(_edge, _nextModel){
    const nextModel = parseModel(_nextModel)
    const edge = _edge?.length ? `'${_edge}'` : ''
    this.select.push(nextModel.select)
    this.name.push(nextModel.name)
    this.match = `${this.match}.outV(${edge})${nextModel.match}`
    return this
  }
  async Run( option = {} ){
    const {page, skip, limit, order, sort, where} = option
    const orderOption = sort && order ? `ORDER BY ${sort} ${order}` : ''
    const whereOption = where?.length ? `WHERE ${where}` : ''

    let limitOption = ''
    if(!limit);
    else if(skip !== undefined) limitOption = `SKIP ${skip} LIMIT ${limit}` 
    else if(page !== undefined) limitOption = `SKIP ${limit * page} LIMIT ${limit}`
        
    const match = this.match
    const select = this.select.join(',')
    const name = this.name.join(',')
    const query = `SELECT ${select} FROM (MATCH ${match} RETURN ${name}) ${whereOption} ${orderOption} ${limitOption}`
    
    console.log(query)
    // Run
    const queryPromise = orientdb.query(query)
    const countPromise = this.Count(where)
    const result = await queryPromise
    const count = await countPromise

    const items = result.map((e) => this.parseObject(e))
    
    const pagination = limitOption && pagingResponseParse({current:page, total:count, limit, sort, order})
    return { items, pagination }
  }

  async Count(where){
    const whereOption = where?.length ? `WHERE ${where}` : ''
    try{
      const match = this.match
      const name = this.name.join(',')
      const query = `SELECT COUNT(*) AS count FROM (MATCH ${match} RETURN ${name}) ${whereOption}`
      const result = await orientdb.query(query) || [{count:0}]
      return result[0]?.count
    }catch(e){
      return 0
    }
  }

  parseObject(item){
    return Object
      .entries(item)
      .reduce((prev,[key, value])=>{
        const parsed_key = key.split('__')
        const className = parsed_key[0]
        let propertyName = parsed_key[1]
        if(propertyName === "rid") propertyName = "@rid"
        const properties = prev[className] || {}
        prev[className] = {...properties, [propertyName]:value}
        return prev
    }, {})
  }
}


const parseModel = (_model)=>{
  let { id, name, where, attrs, extraAttr} = _model
  let model = models[id]
  if(!model) return;

  else if(!name?.length) name = id
  else if(typeof name !== 'string') name = id
  
  let basicAttributes = []

  while(model && model !== "V" && model !== 'E'){
    basicAttributes.push( ...Object.keys(model.attributes) )
    model = models[model.extend] || null
  }

  if(attrs?.length > 0 && typeof attrs === 'object'){
    attrs = attrs.filter( e => basicAttributes.includes(e))
  }

  if(!attrs?.length) attrs = basicAttributes
  if(!extraAttr) extraAttr = {}

  if( typeof where === 'string' && where.length > 0 ) where = `(${where})`
  else where = null

  // * Select
  const simpleSelect = attrs.map((attr) => `${name}.${attr} as ${name}__${attr}`)
  const extraSelect = Object.entries(extraAttr).map(([key, val]) => `${val} as ${name}__${key}`)
  const select = [`${name}.@rid as ${name}__rid`, ...simpleSelect, ...extraSelect].join(',')
  // * Match
  let match = [`class:${id}`]
  name && match.push(`as:${name}`)
  where && match.push(`where:${where}`)
  match = `{${match.join(',')}}`

  return {
      select,
      name,
      match
  }
}


export const pagingResponseParse = (pageObject) => {
  const {current, total, limit, sort, order } = pageObject
  let prev_page = null
  let next_page = null
  let last_page = null
  
  if(typeof total === 'number'){
      if(total === 0)
          last_page = 0
      else
          last_page = Math.floor( (total-1)/limit )
      prev_page = last_page >= current && current > 0 ? current - 1 : null
      next_page = last_page <= current ? null : current + 1
  }

  return {
      firstPage:  0,
      prevPage:   prev_page,
      currentPage:current,
      nextPage:   next_page,
      lastPage:   last_page,
      limit,
      total:      total,
      sort,
      order
  }
}
module.exports = Graph