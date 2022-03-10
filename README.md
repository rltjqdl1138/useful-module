# useful-module
Modularized codes for Node js &amp; React js

## Runner

### Rest API

Rest API in express

#### 1. Controller

##### controller sample
```
import { METHOD_GET } from '@runner/controller';
export const tags = ['Sample'];
export const summary = 'Read';

export const request = {
  path: '/sample',
  method: METHOD_GET,
};

export const security = ['user'];
export const params = {
    path: {},
    query: {},
};

export const execute = async ({ params, client, user }) => {
    
};

export default execute;
```

#### 2. Swagger

@runner/controller.js make data for "api-docs" and "swagger-ui"

##### Example

http://3.36.51.123/swagger-ui.html

#### 3. Pagination

every api have same request and response structure
It is in object "pagingRequestDto" and parsing function "pagingResponseParse"

##### controller sample
```
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
```

##### request

http://<URL+Path>?page=5&limit=10&sort=created_at&order=desc
- page: Integer ( start from 0 )
- limit: Integer
- sort: String
- order: String ( "desc" or "asc" )

##### response

```
{
    "list":[ ... ],
    "pagination":{
        firstPage: 0,
        prevPage: 4,
        currentPage: 5,
        nextPage: 6,
        lastPage: 11,
        limit: 10,
        total: 108,
        sort:'created_at',
        order:'desc'
    }
}
```


### CDN

#### 4. Image Router

```
import imageRouter from '@CDN/ImageRouter'
app.use('/image', imageRouter)
```

## AWS

### Bucket

#### Bucket setting

##### Guide

https://minisp.tistory.com/6

## Naver Cloud

https://www.ncloud.com/

### SMS Service

https://console.ncloud.com/sens

#### Send authentication message
```
import smsService from '@ncloud/sms'

const mobile = "<Mobile>"
const countryCode = "<CountryCode>"
const key = await smsService.SendAuthenticationMessage(mobile, countryCode)
```
#### Send plain message
```
import smsService from '@ncloud/sms'

const mobile = "<Mobile>"
const countryCode = "<CountryCode>"
const context = "This prayer has been sent to you for good luck. The original copy came from the South Korea."
await smsService.sendMessage(context, mobile, countryCode)
```

#### Check authentication message
```
import smsService from '@ncloud/sms'

const mobile = "<Mobile>"
const countryCode = "<CountryCode>"
const Key = "123456"
const isCorrect = await smsService.CheckKey(mobile, countryCode, Key)
```


### Geocode Service

https://console.ncloud.com/naver-service/application

https://api.ncloud-docs.com/docs/ai-naver-mapsgeocoding


## OrientDB

http://orientdb.com/docs/3.0.x/orientjs/OrientJS.html

### Model

#### definition

```
// account model
const extend = 'V'
const name = 'account'
const attributes = {
    id: { type:'LONG', required:true },
    social_id:{type:'STRING', required: true},
    social_platform:{type:'STRING', default: "ORIGINAL"},
    password:{type:'STRING', required:true},

    created_at:{ type:'DATETIME', required:true },
    updated_at:{ type:'DATETIME', required:true },
    expired_at:{ type:'DATETIME', required:true },
}

export default{
    name, 
    attributes,
    extend
}
```

#### point

- If schema is not exist, but model file is exist. Automatically create it.
- If schema is exist, but model file is not exist. Automatically delete it.
- If property is not exist, but model file has it. Automatically create it.
- If property is exist, but model file doesn't have it. Automatically delete it.
- Id property is increasing automatically

### Simple Query

#### Get one item

```
import orientdb from "@orientdb/"

// Get id and password by id
await orientdb.GetItem('account', ['id','password'], id)

// Get all properties by id
await orientdb.GetItem('account', null, id )

// Get item to use "WHERE" query
await orientdb.GetItem('account', null, "nickname='kks'" )
```

#### Create item

```
attrs = {
    social_id="rltjqdl1138@naver.com"
    social_platform="ORIGINAL",
    password="..."
}
await orientdb.RegisterItem('account', attrs)
```

#### Update item

#### Delete item

````
// Delete item by id
await orientdb.DeleteItem('account', id)
````

### Graph Query

