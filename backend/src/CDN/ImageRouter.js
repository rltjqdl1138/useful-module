import multiparty from 'multiparty'
import express from 'express'
import url from 'url'
import * as Bucket from '@AWS/bucket'

const router = express.Router()
const ROOT = 'resource'

router.get('/*', (req,res) => {
  const {pathname} = url.parse(req.url, true)
  res.redirect(`https://${Bucket.domain}/${ROOT}${pathname}`)
})

router.post('/', (req, res) => {
  const form = new multiparty.Form()
  // form data
  form.on('part', (part)=>{
    if(!part.filename) return part.resume()

    const filename = part.filename
    const pathname = `${ROOT}/raw/${filename}`
    const processFunctions = [makeSmallImage, makeMiddleImage, makeThumbnail]

    Bucket
      .getImageWithUpload(part, pathname)
      .then( image => processImage(image, filename, processFunctions) )
  })
  // Error handling
  form.on('error', (err) => res.status(500).end(err) )
  // close form
  form.on('close', ()=> res.end() )

  form.parse(req)
})

function processImage(image, filename, functions=[]){
  const promiseList = functions.map((item) => item(image, filename))
  return Promise.all(promiseList)
}

function makeMiddleImage(data, filename){
  const pathname = `${ROOT}/middle/${filename}`
  const Image =
    sharp(data, {failOnError:false})
      .withMetadata()
      .resize(640)
      .jpeg({mozjpeg:true})

  return Bucket.getImageWithUpload(pathname, Image)
}

function makeSmallImage(data, filename){
  const pathname = `${ROOT}/small/${filename}`
  const Image =
    sharp(data, {failOnError:false})
      .withMetadata()
      .resize(320)
      .jpeg({mozjpeg:true})

  return Bucket.getImageWithUpload(pathname, Image)
}

function makeThumbnail(data, filename){
  const pathname = `${ROOT}/thumb/${filename}`
  const Image =
    sharp(data, {failOnError:false})
      .withMetadata()
      .resize(170,170)
      .jpeg({mozjpeg:true})

  return Bucket.getImageWithUpload(pathname, Image)
}

module.exports = router