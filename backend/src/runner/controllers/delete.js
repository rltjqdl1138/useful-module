import { METHOD_DELETE } from '../controller';
export const tags = ['Sample'];
export const summary = 'Delete';

export const request = {
  path: '/sample',
  method: METHOD_DELETE,
};

export const security = ['user','client'];
export const params = {
    path: {},
    query: {},
};

export const execute = async ({ params, client, user }) => {
    
};

export default execute;