import swaggerUi from 'swagger-ui-express';
import { METHOD_DELETE, METHOD_GET, METHOD_POST, METHOD_PUT } from './controller';
import { swaggerData, serverData } from '@config/'

const { name, version, description } = require('../../package.json');
swaggerData.info.title = name;
swaggerData.info.version = version;
swaggerData.info.description = description;

const methods = [METHOD_GET, METHOD_POST, METHOD_PUT, METHOD_DELETE];
const swaggerHandler = ({ pages, definitions }) => {
    swaggerData.definitions = definitions;
    
    pages.sort((a, b) => {
        const ix1 = a?.data?.tags?.length ? a.data.tags[0] : a.path
        const ix2 = b?.data?.tags?.length ? b.data.tags[0] : b.path
        return ix1 > ix2 ? 1 : ix1 < ix2 ? -1 : a.path > b.path ? 1 : a.path < b.path ? -1 : 0;
    });

    pages.forEach((v) => {
        if (!v.data?.tags || !v.data?.summary) return;
        if (!swaggerData.paths[v.path]) swaggerData.paths[v.path] = {};
        const responses = Object.keys(v.response).length > 0
            ? v.response
            : {
                '200': { description: 'Success'},
                '400': { description: 'Parameter Error' },
                '401': { description: 'Authorized Error' },
                '404': { description: 'Not found data' },
            }
        swaggerData.paths[v.path][v.method] = {
            ...v.data,
            tags: v.data.tags || [],
            responses
        };
    });

    return [
        [
            '/swagger-ui.html',
            swaggerUi.serve,
            swaggerUi.setup(null, {
                swaggerOptions: {
                    url: `${serverData.scheme}://${serverData.host}/api-docs`,
                },
            }),
        ],
        [
            '/api-docs',
            (req, res) => {
                swaggerData.host = serverData.host || req.headers.host;
                swaggerData.schemes = [serverData.scheme];

                return res.status(200).json(swaggerData);
            },
        ],
    ];
};

export default swaggerHandler;
