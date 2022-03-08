import { METHOD_POST } from '../controller';
export const tags = ['Sample'];
export const summary = 'Create';

export const request = {
  path: '/sample',
  method: METHOD_POST,
};

export const security = ['user','client'];
export const params = {
    path: {},
    query: {},
    body: {}
};

export const execute = async ({ params, client, user }) => {
    
};

export default execute;