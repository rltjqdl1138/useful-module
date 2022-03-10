import fs from 'fs';
import express from 'express';
import passport from 'passport';
import md5 from 'crypto-js/md5';

export const METHOD_GET = 'get';
export const METHOD_POST = 'post';
export const METHOD_PUT = 'put';
export const METHOD_DELETE = 'delete';

const definitions = {};
const ADMIN_MASK = 1

export const getRoute = async () => {
    const router = initializeRouter()

    const loadFiles = await loadControllers()
    const pages = []
  
    for (const obj of loadFiles) {
        const page= setSwagger(obj)
        const {exec} = obj
        const {path, method} = page

        pages.push(page)
        const route_uri = path.replace(/\{([a-zA-Z0-9\_]+)\}/g, ':$1');
        router[method]( route_uri, passportRouter,
            // execute
            async (req, res, next) => {
                if (!exec.execute) 
                    return res.status(404).json({});
                
                const args = {
                    params: {
                        ...req.params,
                        ...req.body,
                        ...req.query,
                    },
                    files:  req.files,
                    body:   req.body,
                    query:  req.query,
                    path:   req.params,
                    user:   req.user,
                };
                try {
                    // user role
                    const params = args.params;
                    const {roles} = roleCheck(exec.security, req.user)
                    args.roles = roles
                   
                    // execute
                    if (exec.execute.length >= 3) 
                        return await exec.execute(req, res, next, { params });
                    
                    const output = await exec.execute(args);
                    res.status(200).json(output);
                } catch (e) {
                    if (e?.status === 301) 
                        return res.redirect(301, e.location);

                    else if (e?.status) 
                        return res.status(e?.status).json({ message: e?.message, data: e?.data });
                    
                    res.status(e?.status || 500)
                        .json({ uri: route_uri, message: e?.message, data: e?.data || JSON.stringify(e) });
                }
            
            },
        );
    }
    return { router, pages, definitions };
};

export const pagingRequestDto = {
    page: {
        type: 'integer',
        description: '페이지',
    },
    limit: {
        type: 'integer',
        description: '페이지당 사이즈',
    },
    sort: {
        type: 'string',
        description: '정렬필드',
        enum:['created_at']
    },
    order: {
        type: 'string',
        description: '정렬방식',
        enum: ['desc','asc']
    },
}

export const pagingRequestParse = (params) => {
    const page = parseInt(params?.page || '0');
    const limit = parseInt(params?.limit || '30');
    const sort = params?.sort || 'created_at';
    const order = params?.order || 'desc';
    return {page, limit, sort, order}
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


const initializeRouter = ()=>{
    const router = express.Router();
    router.use(function (req, res, next) {
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, HEAD, OPTIONS');
        res.header('Access-Control-Allow-Origin', '*');
        next();
    });
  
    router.all('/*', function (req, res, next) {
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, HEAD, OPTIONS');
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
        next();
    });
    return router
}

const loadControllers = async ()=>{
    const loadFiles = [];
    const loadSubPath = async (path, subPath) => {
        const files = await fs.readdirSync(path + subPath, { withFileTypes: true });
        for (const file of files) {
            if (file.isDirectory()) 
                await loadSubPath(path, subPath + '/' + file.name);
            else if (file.name.match(/\.js$/) !== null) {
                const exec = require('./controllers' + subPath + '/' + file.name);
                loadFiles.push({ subPath, file, exec,
                    size: Object.keys(exec.params?.path || {}).length || 0,
                });
            }
        }
    };
    await loadSubPath(__dirname + '/controllers', '')
    
    loadFiles.sort((a, b) => (a.size > b.size ? 1 : a.size < b.size ? -1 : 0));
    return loadFiles
}



const setSwagger = (obj)=>{
    const {exec, subPath, file} = obj
    const parameters = [];
    const responses = {}

    let pageName = '/' + file.name.substring(0, file.name.length - 3);
    if (pageName === '/index') pageName = '';
    const path = exec.request?.path || subPath + pageName;
    const method = exec.request?.method || 'get';
    const params = exec.params || {};
    const response = exec.response || null;
    let consumes = ['application/json'];
    
    Object.keys(params.path || {}).forEach((key) => {
        parameters.push({
            name: key,
            in: 'path',
            required: true,
            ...params.path[key],
        });
    });

    Object.keys(params.query || {}).forEach((key) => {
        parameters.push({
            name: key,
            in: 'query',
            ...params.path[key],
            ...params.query[key],
        });
    });
    if (Object.keys(params.form || {}).length > 0) {
        consumes = ['multipart/form-data'];
        Object.keys(params.form || {}).forEach((key) => {
            parameters.push({
                name: key,
                in: 'formData',
                ...params.form[key],
            });
        });
    } else if (Array.isArray(params.body) && params.body.length > 0) {
        const key = md5(JSON.stringify(params.body)).toString();
        definitions[key] = {
            type: 'array',
            items: {
                type: 'object',
                properties: params.body[0],
            },
        };

        parameters.push({
            name: 'body',
            in: 'body',
            schema: {
                $ref: '#/definitions/' + key,
            },
        });
    } else if (Object.keys(params.body || {}).length > 0) {
        const key = md5(JSON.stringify(params.body)).toString();
        definitions[key] = {
            type: 'object',
            properties: params.body,
        };
        parameters.push({
            name: 'body',
            in: 'body',
            schema: {
                $ref: '#/definitions/' + key,
            },
        });
    }

    if(response && Object.keys(response).length > 0){
        Object.keys(response).forEach((value)=>{
            if(!response[value].body){
                responses[value] = response[value]
                return;
            }
            const key = md5(JSON.stringify(response[value].body)).toString()
            definitions[key] = {
                type: 'object',
                properties: response[value].body
            }
            responses[value] = {
                type: response[value].type || 'object',
                name: value,
                description: response[value].description,
                in: value,
                schema: { $ref: '#/definitions/' + key },
            }
        })
    }


    let security = [];
    if (exec.security && exec.security.length > 0) {
        exec.security = exec.security.map((v) => v?.toLowerCase?.());
        security = [
            {
                user_auth: exec.security?.map((v) => {
                    return v?.indexOf(':') > 0 ? v.substring(0, v.indexOf(':')).toLowerCase() : v.toLowerCase();
                }),
            },
        ];
    }

    return  {
        path,
        method,
        data: {
            tags: exec.tags,
            summary: `${exec.summary}  ${exec.update?`${convertTime(exec.update)}`:''}`,
            security: security,
            description: `path :: ${subPath + '/' + file.name}\n` + (exec.description || ''),
            operationId: method + ':' + path,
            consumes,
            parameters,
        },
        response: responses
    }

}

const passportRouter = (req, res, next) => {
    req.user = undefined;
    passport.authenticate('jwt', { session: false }, async (err, user) => {
        req.user = undefined;
        if (!err) {
            req.user = user || undefined
        }
        next();
    })(req, res, next);
}

const roleCheck = (security, user, client)=>{
    let success = false
    let roles = user ? ['user'] : ['guest']
    
    if(user?.role_byte & ADMIN_MASK)
        roles.push('admin')
        
    if(!security?.length || security.includes('any'))
        success = true

    for (const sec of security){
        if(roles.includes(sec))
            success = true
    }

    if (!success) {
        throw {
            status: 401,
            message:'Required Permissions..',
            data:   security,
        };
    }

    return { success, roles }
}


export default getRoute;