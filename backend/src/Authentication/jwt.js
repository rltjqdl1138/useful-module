import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import * as jwt from 'jsonwebtoken'

import * as userDto from '@vo/userDto'
import { authData } from '@config/';
const { JWTPassword } = authData

/*
 * @function jwt_callback
 *   @writer - Kim ki seop
 *   @description - Jwt callback function
 *   @params {Object} - payload
 *     @property {Integer} id - Unique numeric id
 *     @property {Datetime} iat - Time to sign this token,
 *   @return {Object} User
**/
export async function jwt_callback (payload, done) {
  try {
    const user = await userDto.GetItem(payload.id)

    // Case 1: User is not exist
    if(!user) return done({  })

    // Case 2: Token is expired
    const expireDate = Math.floor(user.expired_at / 1000)
    if(payload.iat < expireDate) return done({ message: 'Expired jwt' })
    
    // Case 3: Success
    done(null, user)
  } catch(e){
    // Case 4: Trouble in loading data
    console.log(e)
    done(e)
  }
}

/*
 * @object jwt_config
 *   @writer - Kim ki seop
 *   @description - object for passport setting ( Bearer, JWT callback )
**/
export const jwt_config = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey:    JWTPassword,
};

/*
 * @function signJWT
 *   @writer - Kim ki seop
 *   @description - sign access_token and refresh_token
 *   @params {number} - 
**/
export function signJWT (id) {
  const access_token = jwt.sign({ token_type: 'access_token', id}, JWTPassword, { expiresIn: '24h' });
  const refresh_token = jwt.sign({ token_type: 'refresh_token', id}, JWTPassword);

  return {
    access_token,
    refresh_token,
    token_type: 'bearer',
  }
}

passport.use('jwt', new JwtStrategy(jwt_config, jwt_callback));