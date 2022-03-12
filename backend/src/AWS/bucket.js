
import AWS from 'aws-sdk'
import {bucketData} from '@config/'

AWS.config.update({
  region: bucketData.region,
  accessKeyId: bucketData.accessID,
  secretAccessKey: bucketData.accessKey
})

export const domain = bucketData.domain

/*
 * @function getImage
 *   @writer - Kim ki seop
 *   @description - load image data from stream
 *   @params {Stream} partStream
 *   @return {Buffer} 
**/
export const getImage = (partStream)=>{
  const chunks = [];
  return new Promise((resolve, reject) => {
    partStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    partStream.on('error', (err) => reject(err));
    partStream.on('end', ( ) => resolve(Buffer.concat(chunks)));
    partStream.resume()
  })
}

/*
 * @function getImageWithUpload
 *   @writer - Kim ki seop
 *   @description - load image data from stream and upload to bucket
 *   @params {Stream} partStream
 *   @return {Buffer} 
**/
export const getImageWithUpload = (partStream, filename)=>{
  const chunks = [];
  return new Promise((resolve, reject) => {
    partStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    partStream.on('error', (err) => reject(err));
    partStream.on('end', ( ) => resolve(Buffer.concat(chunks)));
    uploadToBucket(filename, part)
  })
}

/*
 * @function uploadToBucket
 *   @writer - Kim ki seop
 *   @description - Upload image to bucket
 *   @params {String} filename
 *   @params {Buffer} Body
 *   @params {Stream} upload stream
**/
const uploadToBucket = (filename, Body)=>{
  const params = { Bucket: bucketData.name, Key:filename, Body, ContentType: 'image' }
  const upload = new AWS.S3.ManagedUpload({ params });
  return upload.promise()
}