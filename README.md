# useful-module
Modularized codes for Node js &amp; React js


## Contents
#### 1. Runner
##### 1.1 Rest API
###### 1) Controller
Controller for Restful API
###### 2) Swagger
Automade swagger page
###### 3) Pagination
Common structure for pagination
##### 1.2 CDN
###### 4) Image Router
Controller for image upload / download
##### 1.3 Babel
###### babelrc.js
###### run
###### build

##### 1.4 pm2
###### ecosystem.config.js

#####

#### 2. Data
##### 2.1 AWS Bucket
###### 1) Bucket Setting
AWS bucket setting

##### 2.2 Inmemory cache

##### 2.3 Redis

##### 2.4 MQTT

#### 3. Naver Cloud Platform
##### 3.1 SMS Service
###### 1) Send authentication message
Send 6-digit authentication
###### 2) Send plain message
Send short sms ( 80byte limited )
###### 3) Check authentication message
Verify sms authentication message from 1) Send authentication message 
##### 3.2 Geocode Service

#### 4. OrientDB
##### 4.1 Model
###### 1) model definition
Model structure for orientDB
###### 2) point
All classes are synchronized with model
( Create / Drop class ), ( Create / Drop property )
##### 4.2 Simple Query
###### 3) Get one item
###### 4) List many item
###### 5) Create item
###### 6) Update item
###### 7) Delete item
##### 4.3 Graph Query
###### 8) Simple Query

#### 5. Authentication
##### 5.1 Original ( ID and password )
##### 5.2 Facebook
##### 5.3 Google
##### 5.4 Apple
##### 5.5 Kakao ( RestAPI )
##### 5.6 Kakao ( Webpage )
##### 5.7 Naver
##### 5.8 Huawei
##### 5.9 Metamask

#### 6. Chatting ( socket.io )

#### 7. Push notification

#### 8. Import ( payment )

#### 9. Clayful ( commerce )


## 1. Runner

### 1.1 Rest API

Rest API in express

#### 1) Controller

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

#### 2) Swagger

@runner/controller.js make data for "api-docs" and "swagger-ui"

##### Example

http://3.36.51.123/swagger-ui.html

#### 3) Pagination

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


### 1.2 CDN

#### 4) Image Router

```
import imageRouter from '@CDN/ImageRouter'
app.use('/image', imageRouter)
```

#### 5) Create SVG Image
```
```
### 1.3 Babel

#### 6) babelrc.js
#### 7) run
#### 8) build

### 1.4 pm2
#### 9) ecosystem.config.js

### 1.5 Scheduler
#### 10) node-cron

## 2. Data

### 2.1 AWS Bucket

#### Bucket setting

##### Guide

https://minisp.tistory.com/6

### 2.2 Inmemory cache

### 2.3 Redis

### 2.4 MQTT

## 3. Naver Cloud

https://www.ncloud.com/

### 3.1 SMS Service

https://console.ncloud.com/sens

#### 1) Send authentication message
```
import smsService from '@ncloud/sms'

const mobile = "<Mobile>"
const countryCode = "<CountryCode>"
const key = await smsService.SendAuthenticationMessage(mobile, countryCode)
```
#### 2) Send plain message
```
import smsService from '@ncloud/sms'

const mobile = "<Mobile>"
const countryCode = "<CountryCode>"
const context = "This prayer has been sent to you for good luck. The original copy came from the South Korea."
await smsService.sendMessage(context, mobile, countryCode)
```

#### 3) Check authentication message
```
import smsService from '@ncloud/sms'

const mobile = "<Mobile>"
const countryCode = "<CountryCode>"
const Key = "123456"
const isCorrect = await smsService.CheckKey(mobile, countryCode, Key)
```


### 3.2 Geocode Service

https://console.ncloud.com/naver-service/application

https://api.ncloud-docs.com/docs/ai-naver-mapsgeocoding

#### 4) Get address
```
import GeocodeService from '@ncloud/Geocode'

await GeocodeService.get(126.97798167509505,37.56474939020642)
```

##### response
```
{
    "status": {
        "code": 0,
        "name": "ok",
        "message": "done"
    },
    "results": [
        {
            "name": "roadaddr",
            "code": {
                "id": "1114011400",
                "type": "L",
                "mappingId": "09140114"
            },
            "region": {
                "area0": {
                    "name": "kr",
                    "coords": {
                        "center": {
                            "crs": "",
                            "x": 0,
                            "y": 0
                        }
                    }
                },
                "area1": {
                    "name": "서울특별시",
                    "coords": {
                        "center": {
                            "crs": "EPSG:4326",
                            "x": 126.9783882,
                            "y": 37.5666103
                        }
                    },
                    "alias": "서울"
                },
                "area2": {
                    "name": "중구",
                    "coords": {
                        "center": {
                            "crs": "EPSG:4326",
                            "x": 126.997602,
                            "y": 37.563843
                        }
                    }
                },
                "area3": {
                    "name": "태평로2가",
                    "coords": {
                        "center": {
                            "crs": "EPSG:4326",
                            "x": 126.9763563,
                            "y": 37.5629892
                        }
                    }
                },
                "area4": {
                    "name": "",
                    "coords": {
                        "center": {
                            "crs": "",
                            "x": 0,
                            "y": 0
                        }
                    }
                }
            },
            "land": {
                "type": "",
                "number1": "119",
                "number2": "",
                "addition0": {
                    "type": "building",
                    "value": "더 플라자"
                },
                "addition1": {
                    "type": "zipcode",
                    "value": "04525"
                },
                "addition2": {
                    "type": "roadGroupCode",
                    "value": "111403101004"
                },
                "addition3": {
                    "type": "",
                    "value": ""
                },
                "addition4": {
                    "type": "",
                    "value": ""
                },
                "name": "소공로",
                "coords": {
                    "center": {
                        "crs": "",
                        "x": 0,
                        "y": 0
                    }
                }
            }
        }
    ]
}
```

## 4. OrientDB

http://orientdb.com/docs/3.0.x/orientjs/OrientJS.html

### 4.1 Model

#### 1) definition

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

#### 2) point

- If schema is not exist, but model file is exist. Automatically create it.
- If schema is exist, but model file is not exist. Automatically delete it.
- If property is not exist, but model file has it. Automatically create it.
- If property is exist, but model file doesn't have it. Automatically delete it.
- Id property is increasing automatically

### 4.2 Simple Query

#### 3) Get one item

```
import orientdb from "@orientdb/"

// Get id and password by id
await orientdb.GetItem('account', ['id','password'], id)

// Get all properties by id
await orientdb.GetItem('account', null, id )

// Get item to use "WHERE" query
await orientdb.GetItem('account', null, "nickname='kks'" )
```

#### 4) List many item

```
```

#### 5) Create item

```
attrs = {
    social_id="rltjqdl1138@naver.com"
    social_platform="ORIGINAL",
    password="..."
}
await orientdb.RegisterItem('account', attrs)
```

#### 6) Update item

```
```

#### 7) Delete item

````
// Delete item by id
await orientdb.DeleteItem('account', id)
````

### 4.3 Graph Query

#### 8) Simple list
```
import orientdb from "@orientdb/"

Model1 = {

}
Model2 = {

}
Model3 = {

}
await orientdb.graphQuery( Model1 )
```

#### 9) List with edge
```

```

## 5. Authentication

### 5.1 Original ( ID and password )
```
```
### 5.2 Facebook
```
```
### 5.3 Google
```
```
### 5.4 Apple
```
```
### 5.5 Kakao ( RestAPI )
```
```
### 5.6 Kakao ( Webpage )
```
```
### 5.7 Naver
```
```
### 5.8 Huawei
```
```
### 5.9 Metamask
```
```

## 6. Chatting ( socket.io )

## 7. Push notification

## 8. Import ( payment )

## 9. Clayful ( commerce )
