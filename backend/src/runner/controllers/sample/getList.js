import { METHOD_GET, pagingRequestDto, pagingResponseParse } from '@runner/controller';
export const tags = ['Sample'];
export const summary = 'Read';

export const request = {
  path: '/sample/list',
  method: METHOD_GET,
};

export const security = ['user','client'];
export const params = {
    path: {},
    query: {
        ...pagingRequestDto
    },
};

export const execute = async ({ params, client, user }) => {
    const {items, pageObject} = {}
    return { list:items, pagination: pagingResponseParse(pageObject)}
};

export default execute;