import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { authData } from '@config/';
const PASSWORD = authData.JWTPassword

/*
 * @ 1.3. Jwt callback function
 * @function jwt_callback
 *   @writer - Kim ki seop
 *   @description - Verify jwt token and get User data
 *   @params {Object} - payload
 *     @property {Integer} id - Unique numeric id
 *     @property {Datetime} iat - Time to sign this token,
 *                                If iat is lower than user.expired_at, Server judge that token is signed before critical info is changed
 *   @return {Object} User
**/
export const jwt_callback = async (payload, done) => {
    try{
        const user = await userDto.getUserBySeq(payload.seq)

        // Case 1: User is not exist
        if(!user) return done({  })
    
        // Case 2: Token is expired
        //const expireDate = Math.floor(user.expired_at / 1000)
        //if(payload.iat < expireDate){
        //    return done({ message: 'Expired jwt' })
        //}
        // Case 3: Success
        done(null, user)
    }catch(e){
        console.log(e)
        // Case 4: Trouble in loading data
        done(e)
    }
}

/*
 * @ 1.4. PassportSetting
 *   @writer - Kim ki seop
 *   @description - Set passport setting ( Bearer, JWT callback )
**/
export const jwt_config = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey:    PASSWORD,
};
passport.use('jwt', new JwtStrategy(jwt_config, jwt_callback));


export const verifyClient = async(payload) =>{
    const apiKey = payload['api-key']
    const clientID = payload['client-id']
    const client = await clientDto.getClient(clientID)
    if(!client) return;
    const cryptoKey = await createPassword(client.password, clientID)
    return cryptoKey === apiKey ? client : undefined
}