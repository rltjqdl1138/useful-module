import { METHOD_GET } from '../controller';
export const tags = ['Sample'];
export const summary = 'Read';

export const request = {
  path: '/sample',
  method: METHOD_GET,
};

export const security = ['user','client'];
export const params = {
    path: {},
    query: {},
};

export const execute = async ({ params, client, user }) => {
    
};

export default execute;