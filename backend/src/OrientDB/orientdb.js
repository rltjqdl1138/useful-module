import {orientDBData} from '@config/';
import fs from 'fs'

const args = {};
const OrientDBClient = require("orientjs").OrientDBClient;

const LoadModels=()=>{
  const path = __dirname + '/models';
  const files = fs.readdirSync(path, { withFileTypes: true });
  for (const file of files) {
    if (!file.isDirectory() && file.name.match(/\.js$/) !== null) {
      if(file.name === 'index.js') continue;

      const model = require('./models/' + file.name);
      const name = model?.default?.name

      if(name?.length > 0) args[name] = model.default
    }
  }
}
LoadModels()

/*
 * @class   Database
 * @brief   Parents class for OrientDB
 * @author  jigugong Inc, Kim ki seop
 * 
**/
class Database{
  constructor(){
    this._initializeDB(orientDBData)
      .then((success) => success && this.updateClasses())
      /*
      .then((success) => success && this.loadClasses())
      .then((classes) => this.getClassesFromDB(classes))
      .then(() => console.log(args))*/
  }

  async _initializeDB({host, port, user, password, database}){
    const sessionOption = {
      name: database,
      username: user,
      password: password
    }
    try{
      this.db = await OrientDBClient.connect({host, port})
      this.dbSession = await this.db.session(sessionOption);
      this.ready = true;
      this.log(`[init] Connected to ${host}:${port}`)
      return true
    }
    catch(e){
      this.dbSession && this.dbSession.close()
      this.dbSession = null
      this.db && this.db.close()
      this.db = null
      this.log(`[init] Fail to connect`)
      return false
    }
  }
  getClassesFromDB(classes){
    const setting = ({name:className, properties})=>{
      args[className] = properties.reduce((prev, {mandatory, name, type, default:defaultValue} ) => ({
        ...prev,
        [name]:{
          required: mandatory,
          type: DATA_TYPES[type],
          default: defaultValue
        }
      }), {})
    }
    
    classes.map(({name, properties}) => setting({name, properties}))
  }
  async loadClasses(){
    const classes = await this.query(BROWSE_PLAIN_CLASS)
    return classes.filter((e) => !SYSTEM_CLASS.find( v => v == e.name || v == e.superClass))
  }
  async updateClasses(){
    const classes = await this.loadClasses()
    const classNames = classes.map((e) => e.name)

    const deprecated = classes
      .filter((e) => !args[e.name] )
      .map((e) => this.removeClass(e) )

    const newClass = Object
        .values(args)
        .filter((e) => !classNames.includes(e.name) )
        .map((e) => this.createClass(e) )

    const oldClass = classes
      .filter((e) => args[e.name] )
      .map((e) => this.updateClass(e) )
    
    await Promise.all( [...deprecated, ...newClass, ...oldClass] )
  }

  async createClass({name, extend, attributes}){
    let result
    if (!extend || typeof extend !== 'string'){
      result = await this.command(`CREATE CLASS ${name} IF NOT EXISTS`)
    } else if (extend == 'V' || extend == 'E' || args[extend]){
      result = await this.command(`CREATE CLASS ${name} IF NOT EXISTS EXTENDS ${extend}`)
    } else{
      throw Error(`${extend} class is not defined`)
    }

    const newProperties = Object
      .entries(attributes)
      .map((e)=> this.createProperty(name, ...e))
    await Promise.all(newProperties)

    if(result && attributes?.id){
      await this.command(`CREATE SEQUENCE ${name}_idseq IF NOT EXISTS TYPE ORDERED`)
      || await this.command(`ALTER SEQUENCE ${name}_idseq START 0`)
    }
    this.log(`[init] CREATE CLASS ${name}`)
  }

  async removeClass({name}){
    if(name === 'V' || name === 'E' || SYSTEM_CLASS.includes(name) ) return;
    try{
      await this.command(`DROP CLASS ${name}`)
      await this.command(`DROP SEQUENCE ${name}_idseq IF EXISTS`)
      this.log(`[init] DROP CLASS ${name}`)
    }catch(e){
      // if data is exist in class, pass the drop sequence

    }
  }

  async updateClass({name, properties}){
    const {attributes} = args[name]
    const names = properties.map( e => e.name)

    const deprecated = properties
      .filter((e) => !attributes[e.name])
      .map((e) => this.removeProperty(name, e.name))
  
    const newProperties = Object
      .entries(attributes)
      .filter(([key]) => !names.includes(key))
      .map(([name, val]) => ({...val, name}))
      .map((e) => this.createProperty(name, e.name, e))

    await Promise.all( [...deprecated, ...newProperties] )
  }

  createProperty(className, propertyName, {type, required}){
    const QUERY = `CREATE PROPERTY ${className}.${propertyName} ${type}`
    const MANDATORY = required ? ' (MANDATORY TRUE)' : '' 
    
    this.log("[init] " + QUERY)
    return this.command(QUERY+MANDATORY)
  }
  removeProperty(className, propertyName){
    const QUERY = `DROP PROPERTY ${className}.${propertyName}`

    this.log("[init] " + QUERY)
    return this.command(QUERY)
  }
  
  reconnect(){
    const makeInterval = ()=>{
      this._initializeDB(orientDBData)
        .then( success => success && clearInterval(this.interval))
    }
    this.interval = this.interval || setInterval(makeInterval, 10000)
  }

  async query(query, params){
    try{
      if(!this.dbSession || !this.ready){
        throw {status:500, message:'데이터베이스 로딩되지 않음'}
      }
      return await this.dbSession.query(query, {params}).all()
    }catch(e){
      this.ErrorHandler(e, query, params)
    }
  }

  async command(query, params){
    try{
      if(!this.dbSession || !this.ready){
        throw {status:500, message:'데이터베이스 로딩되지 않음'}
      }
      return await this.dbSession.command(query,{params}).one()
    }catch(e){
      this.ErrorHandler(e, query, params)
    }
  }

  ErrorHandler(error, query, params){
    if(error?.code === 10){
      this.ready = false
      this.reconnect()
    }
    else{
      this.log(query)
    }
    throw error
  }

  log(str){
    console.log(`[Database] ${str}`)
  }
}

export const orientdb = new Database()
export const model = args

const BROWSE_PLAIN_CLASS = `SELECT name, superClass, properties FROM ( SELECT EXPAND(classes) from metadata:schema )`
const SYSTEM_CLASS = ["OFunction", "OTriggered", "OSequence", "OShape", "OSecurityPolicy", "OSchedule", "ORestricted", "OIdentity", "OSequence","OTriggered","OSecurityPolicy","OShape","OSchedule","OIdentity","ORestricted","_studio"]
const DATA_TYPES = ['','INTEGER','','LONG','','','DATETIME','STRING','']