import * as userDto from '@vo/userDto'
import {hashPassword} from '@auth/password'
import {signJWT} from '@auth/jwt'

export const test = async()=>{
    return await userDto.test()
}

/*
 * @ 3.1. Sign up
 * @function create
 *   @writer - Kim ki seop
 *   @description - Sign Up
 *   @params {Object}  payload
 *     @proerty {String}  *id - Unique id in Jigugong. if using social login, It's the same with unique id each platform
 *     @proerty {String}  *platform - Social platform ( ORIGINAL, KAKAO, GOOGLE, NAVER, APPLE )
 *     @proerty {String}  *password(original platform) - password for login
 * 
 *   @return {Object} payload
 *     @description - if success to authenticate, return parameter input ( payload )  
 *   @return {Object} - Case fail
 *     @proerty {String}  message - error message
 *     @proerty {String}  error - http error status code
**/
export const create = async (params) => {
    const args = {
        social_id:        params.id,
        social_platform:  params.platform,
        password:         params.password,
    }
    if(args.error) throw { ...args, status:args.error }
    
    // Input Check 1. id & platform
    if(!args?.social_id?.length)
      throw {status:400, message:'id를 입력해야합니다.'}
    if(!args?.social_platform?.length)
      throw {status:400, message:'platform을 입력해야합니다.'}
  
    // Input Check 2. password
    const crypto_password = await hashPassword(params.password, args.social_id)
  
    // Create Item
    const account = await userDto.RegisterItem({...args, password: crypto_password })
  
    return signJWT(account.id)
};

export const verify = async(params) =>{
    const user = await userDto.GetUserByID(params.id)
    return signJWT(user.id)
}

export const refreshToken = async(params, user) =>{
    const data = signJWT(user.id)
    delete data.refresh_token

    return data
}