import { authData } from '@config/';
import crypto from 'crypto'
const {PasswordHashCount, PasswordHashKey} = authData

/*
 * @ 1.1. Password hashing function
 * @function hashPassword
 *   @writer - Kim ki seop
 *   @description - Crypto password using hash function with salt
 *   @params {String} password
 *   @params {String} extraSalt
 *   @return {String} - encrypted password
**/
export const hashPassword = (password, extraSalt) => new Promise((resolve, reject)=>{
    crypto.pbkdf2(  password, // Raw password
                    (extraSalt+PasswordHashKey).toString('base64'),  // Salt (Crypto Key)
                    PasswordHashCount,    // Hashing count
                    64,       // length
                    'sha512', // method
    (err,buf) => err ? reject(err) : resolve(buf.toString('base64')) )
})
