import axios from 'axios'
import { NCloudData } from '@config/'

/*
 * @class   MessageService
 * @brief   For Authentication using Message, Access to <Simple & Easy Notification Service> on <Naver Cloud Platform>
 * @author  Kim ki seop
**/
class GeocodeService {
    constructor(){
        // Naver Cloud Platform Configuration
        this.clientID = NCloudData?.geocode?.clientID
        this.clientSecret = NCloudData?.geocode?.clientSecret

        // Naver Cloud Platform URL
        this.baseURL = 'https://naveropenapi.apigw.ntruss.com'
        this.url = `/map-reversegeocode/v2/gc`

        // Print Logs
        this.log(`[init] Calling Number: \x1b[95m${number}\x1b[0m`)
    }
   
    async get(x, y){
        // * Context
        const url = `${this.baseURL}${this.url}?request=coordsToaddr&coords=${x},${y}&sourcecrs=epsg:4326&orders=roadaddr&output=json`
        // * Header
        const header = {
            'Content-Type':'application/json',
            'x-ncp-apigw-api-key-id': this.clientID,
            'x-ncp-apigw-api-key':  this.clientSecret
        }
        
        try{
            const result =  await axios.get(url, {headers:header})
            return result.data
        }catch(e){
            console.log(e.response && e.response.data ? e.response.data : e)
            return false
        }
    }

    log(str){
        console.log(`[NCloud] [GeoCode] ${str}`)
    }
}

exports.GeocodeService = new GeocodeService()