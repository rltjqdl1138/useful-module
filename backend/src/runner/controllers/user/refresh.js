import { METHOD_GET } from '@runner/controller';
import * as userService from '@services/userService'

export const tags = ['User'];
export const summary = 'token refresh';

export const request = {
    path: '/auth/refresh',
    method: METHOD_GET,
};

export const security = ['user'];
export const params = {
    path: {},
    query: {}
};

export const execute = async ({ params, user }) => {
    return await userService.refreshToken(params, user)
};

export default execute;