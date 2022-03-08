import {orientDBData} from '@config/';
import fs from 'fs'

const args = {};
const OrientDBClient = require("orientjs").OrientDBClient;

const LoadModels=()=>{
    const path = __dirname + '/models'
    const files = fs.readdirSync(path, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory())
            continue;
        else if (file.name.match(/\.js$/) !== null) {
            if(file.name === 'index.js') continue;
            const model = require('./models/' + file.name);
            const name = model?.default?.name
            if(!name?.length) continue;
            args[name] = model.default        
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
        this.reconnectCount = 10
        this._initializeDB(orientDBData)
            .then( success => success && this.UpdateClasses())
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

    async UpdateClasses(){
        let classes = await this.query(BROWSE_PLAIN_CLASS)
        classes = classes.filter( e => !SYSTEM_CLASS.find( v => v == e.name || v == e.superClass) )
        const classNames = classes.map( e => e.name)

        const deprecated = classes.filter( e => !args[e.name] )
        const newbie = Object.values(args).filter( e => !classNames.includes(e.name) )
        const old = classes.filter( e => args[e.name] )
        
        await Promise.all( newbie.map( e => this.createClass(e) ) )
        await Promise.all( deprecated.map( e => this.removeClass(e) ) )
        await Promise.all( old.map( e => this.updateClass(e) ))
    }

    async createClass({name, extend, attributes}){
        let result = false
        if(!extend)
            result = await this.command(`CREATE CLASS ${name} IF NOT EXISTS`)  
        else if(extend == 'V' || extend == 'E' || args[extend])
            result = await this.command(`CREATE CLASS ${name} IF NOT EXISTS EXTENDS ${extend}`)
        else
            return

        this.log(`[init] CREATE CLASS ${name}`)
        await Promise.all( Object.entries(attributes).map( e  => this.createProperty(name, ...e) ) )

        if(result && attributes?.id)
            await this.command(`CREATE SEQUENCE ${name}_idseq IF NOT EXISTS TYPE ORDERED`)
            || await this.command(`ALTER SEQUENCE ${name}_idseq START 0`)
    }

    removeClass({name}){
        if(name === 'V' || name === 'E' || SYSTEM_CLASS.includes(name) ) return;
        this.log(`[init] DROP CLASS ${name}`)
        this.command(`DROP CLASS ${name}`)
        this.command(`DROP SEQUENCE ${name}_idseq IF EXISTS`)
    }
    async updateClass({name, properties}){
        const {attributes} = args[name]
        const names = properties.map( e => e.name)
        const deprecated = properties.filter( e => !attributes[e.name])
        const newbie = Object.entries( attributes )
                    .filter( ([key]) => !names.includes(key) )
                    .map( ([name, val]) => ({...val, name} ) )

        await Promise.all( deprecated.map( e => this.removeProperty(name, e.name) ) )
        await Promise.all( newbie.map( e => this.createProperty(name, e.name, e) ) )
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
        this.interval = this.interval || setInterval(()=>{
            this._initializeDB(orientDBData)
                .then( success => success && clearInterval(this.interval))
        },10000)
    }

    async query(query, params){
        try{
            if(!this.dbSession || !this.ready)
                throw {status:500, message:'데이터베이스 로딩되지 않음'}

            return await this.dbSession.query(query, {params}).all()
        }catch(e){
            console.log(query)
            this.ErrorHandler(e, query, params)
        }
    }
    async command(query, params){
        try{
            if(!this.dbSession || !this.ready)
                throw {status:500, message:'데이터베이스 로딩되지 않음'}

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
