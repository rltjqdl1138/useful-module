import orientdb from "@orientdb/"

export const GetItem = id => orientdb.GetItem('account', null, id)
export const GetUserByID = (id) => orientdb.GetItem('account', null, `social_id="${id}"`)
export const RegisterItem = attrs => orientdb.RegisterItem('account', attrs)
