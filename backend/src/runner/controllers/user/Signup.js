import { METHOD_POST } from '@runner/controller';
import * as userService from '@services/userService'

export const tags = ['User'];
export const summary = 'Sign up';

export const request = {
    path: '/user/signup',
    method: METHOD_POST,
};

export const security = ['any'];
export const params = {
    path: {},
    query: {},
    body:{
        id:{type:'string', description:"ID"},
        platform:{type:'string', description:"platform", enum:["ORIGINAL"]},
        password:{type:'string', description:"password"}
    }
};

export const execute = async ({ params }) => {
    return await userService.create(params)
};

export default execute;
