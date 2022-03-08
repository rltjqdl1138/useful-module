import {orientdb, model} from './orientdb'
import * as functions from './functions'
module.exports = {
    ...functions,
    //db: orientdb,
    models: model
}


