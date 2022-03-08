import { METHOD_PUT } from '@runner/controller';
export const tags = ['Sample'];
export const summary = 'Update';

export const request = {
  path: '/sample',
  method: METHOD_PUT,
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