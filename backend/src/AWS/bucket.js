
import AWS from 'aws-sdk'
import {bucketData} from '@config/'

AWS.config.update({
    region:         bucketData.region,
    accessKeyId:    bucketData.accessID,
    secretAccessKey:bucketData.accessKey
})

export const domain = bucketData.domain

export const getImage = (part)=>{
    const chunks = [];
    return new Promise((resolve, reject) => {
        part.on('data',   (chunk) => chunks.push(Buffer.from(chunk)));
        part.on('error',  ( err ) => reject(err));
        part.on('end',    (     ) => resolve(Buffer.concat(chunks)));
        part.resume()
    })
}

export const getImageWithUpload = (part, filename)=>{
    const chunks = [];
    return new Promise((resolve, reject) => {
        part.on('data',   (chunk) => chunks.push(Buffer.from(chunk)));
        part.on('error',  ( err ) => reject(err));
        part.on('end',    (     ) => resolve(Buffer.concat(chunks)));
        uploadToBucket(filename, part)
    })
}

const uploadToBucket = (filename, Body)=>{
    const params = { Bucket: bucketData.name, Key:filename, Body, ContentType: 'image' }
    const upload = new AWS.S3.ManagedUpload({ params });
    return upload.promise()
}