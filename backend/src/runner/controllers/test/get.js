import { METHOD_GET } from '@runner/controller';
import * as userService from '@services/userService'

export const tags = ['Sample'];
export const summary = 'Read';

export const request = {
  path: '/test',
  method: METHOD_GET,
};

export const security = ['any'];
export const params = {
    path: {},
    query: {},
};

export const execute = async ({ params, client, user }) => {
    return await userService.test(params)
};

export default execute;