import axios from 'axios'
import { NCloudData } from '@config/'

/*
 * @class   GeocodeService
 * @brief   For 
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
    }
   
    async get(lng, lat, floor=4){
        const x = lng.toFixed(floor)
        const y = lat.toFixed(floor)
        
        const url = `${this.baseURL}${this.url}?request=coordsToaddr&coords=${x},${y}&sourcecrs=epsg:4326&orders=roadaddr&output=json`
        // * Header
        const header = {
            'Content-Type':'application/json',
            'x-ncp-apigw-api-key-id': this.clientID,
            'x-ncp-apigw-api-key':  this.clientSecret
        }
        
        try{
            const {data} =  await axios.get(url, {headers:header})

            if(data?.code === 0)
                return data?.results

            return undefined
        }catch(e){
            console.log(e.response && e.response.data ? e.response.data : e)
            return undefined
        }
    }

    log(str){
        console.log(`[NCloud] [GeoCode] ${str}`)
    }
}

module.exports = new GeocodeService()