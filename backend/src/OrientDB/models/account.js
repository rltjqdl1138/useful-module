const extend = 'V'
const name = 'account'
const attributes = {
    id: { type:'LONG', required:true },
    social_id:{type:'STRING', required: true},
    social_platform:{type:'STRING', required: true},
    password:{type:'STRING', required:true},

    created_at:{ type:'DATETIME', required:true },
    updated_at:{ type:'DATETIME', required:true },
    expired_at:{ type:'DATETIME', required:true },

    role_byte:{type:'integer', default:0},
    notification_key:{type:'STRING'},
}

export default{
    name, 
    attributes,
    extend
}