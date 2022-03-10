import crypto from 'crypto'
import md5 from 'crypto-js/md5';
import axios from 'axios'
import { NCloudData } from '@config/'

/*
 * @class   MessageService
 * @brief   For Authentication using Message, Access to <Simple & Easy Notification Service> on <Naver Cloud Platform>
 * @author  Kim ki seop
 * 
 * @Method  SendMessage
 *      @description    Send Plain Message
 *      @params {String}    content - text content
 *      @params {String}    mobile - Mobile number
 *      @params {String}    countryCode - Country Code for mobile (default: '82')
 *      @return {Boolean}   Is success to send message
 * 
 * @Method  SendAuthenticationMessage
 *      @description    Send Authenticatio Message and Insert key into key table
 *      @params {String}    mobile - Mobile number
 *      @params {String}    countryCode - Country Code for mobile (default: '82')
 *      @return {Boolean}   Is success to send message
 * 
 * @Method  CheckKey
 *      @description    Verify / check 
 *      @params {String}    countryCode - Country Code for mobile
 *      @params {String}    mobile - Mobile number
 *      @params {Integer}   value - Key for verification
 *      @return {Boolean}   is parameter 'value' same with KeyTable's value
**/
class MessageService {
    constructor(){
        // Naver Cloud Platform Configuration
        this.accessKey = NCloudData?.common?.accessKey
        this.secretKey = NCloudData?.common?.secretKey
        this.serviceID = NCloudData?.sms?.serviceID

        // SMS Configuration
        this.callingNumber = NCloudData?.sms?.callingNumber
        this.disableMessage = NCloudData?.sms?.disableMessage
        this.exp = NCloudData?.sms?.exp || 180000 // (default:3min)

        // Naver Cloud Platform URL
        this.baseURL = 'https://sens.apigw.ntruss.com'
        this.url = `/sms/v2/services/${this.serviceID}/messages`

        // Authentication Table
        this.KeyTable = {}
        const number = this.callingNumber.length === 8 ?
            `${this.callingNumber.slice(0,4)}-${this.callingNumber.slice(4,8)}` :
            `${this.callingNumber.slice(0,3)}-${this.callingNumber.slice(4, this.callingNumber.length-4)}-${this.callingNumber.slice(this.callingNumber.length-4,this.callingNumber.length)}`
        
        // Print Logs
        this.log(`[init] Calling Number: \x1b[95m${number}\x1b[0m`)
    }

    // * Methods *
    async SendMessage(content, mobile, countryCode){
        // * Coordinated Universal Time (UTC+0)
        const timestamp = Date.now()

        const signature = await this._createSignature('POST', timestamp, this.url )
        const header = {
            'Content-Type':'application/json',
            'x-ncp-apigw-timestamp':timestamp,
            'x-ncp-iam-access-key':this.accessKey,
            'x-ncp-apigw-signature-v2':signature
        }
        const body = {
            "type":"SMS",
            "contentType":'COMM',
            "countryCode":countryCode,
            "from": this.callingNumber,
            "content":content,
            "messages":[{ to:mobile }]
        }
        
        if(!this.disableMessage){
            this.log(`Send message to ${mobile} :: ${content}`)
            await axios.post(this.baseURL+this.url, body, {headers:header})
        }else    
            this.log(`[Test] Send message to ${mobile} :: ${content}`)
    }

    async SendAuthenticationMessage(mobile, countryCode='82'){
        // * Random key Generate: 100,000 ~ 999,999
        const key = String( Math.floor( Math.random()*899999 + 100000 ) )

        // * Context
        const context = `[본인확인] 인증번호는 ${key} 입니다.`
        
        try{
            await this.SendMessage(context, mobile, countryCode)
            this._appendKey(countryCode, mobile, key)
            
            if(this.disableMessage)
                this.log(`[Test] Send Authentication message: ${mobile} ${key}`)

            return true
        }catch(e){
            console.log(e.response && e.response.data ? e.response.data : e)
            return false
        }
    }
    
    async CheckKey( mobile, countryCode, value) {
        const key = md5( countryCode+'#'+mobile )
        return value && (value === this.KeyTable[key])
    }

    log(str){
        console.log(`[NCloud] [SMS] ${str}`)
    }
    
    async _createSignature(method, _timestamp, url){
        const timestamp = typeof _timestamp === 'string' ? _timestamp : String(_timestamp)
        return crypto.createHmac('sha256', this.secretKey)
            .update(method).update(" ")
            .update(url).update("\n")
            .update(timestamp).update("\n")
            .update(this.accessKey)
            .digest('base64')
    }

    async _appendKey(countryCode, mobile, value){
        const key = md5( countryCode+'#'+mobile )
        this.KeyTable[key] = value
        setTimeout(() => this._deleteKey(countryCode, mobile, value), this.exp)
    }

    async _deleteKey(countryCode, mobile, value){
        const key = md5( countryCode+'#'+mobile )
        if(this.CheckKey(countryCode, mobile, value)){
            console.log(`Key is expired from ${mobile} (${value})`)
            delete this.KeyTable[key]
        }
    }
}

module.exports = new MessageService()
