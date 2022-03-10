
import smsService from '@ncloud/sms'
import geoService from '@ncloud/Geocode'

async function example1(){
    const mobile = "<Mobile>"
    const countryCode = "<CountryCode>"
    const key = await smsService.SendAuthenticationMessage(mobile, countryCode)
}
async function example2(){
    const mobile = "<Mobile>"
    const countryCode = "<CountryCode>"
    const Key = "123456"
    const isCorrect = await smsService.CheckKey(mobile, countryCode, Key)
}
async function example3(){
    const mobile = "<Mobile>"
    const countryCode = "<CountryCode>"
    const context = "This prayer has been sent to you for good luck. The original copy came from the South Korea."
    await smsService.sendMessage(context, mobile, countryCode)
}
