import { ApiError } from "../utils/ApiError.js"

const roleMiddleware = (...allowedRoles) => {

    return(req, res, next) =>{
        if(!req.staff){
            throw new ApiError( 401, "Authentication required" )
        }
        if(!allowedRoles.includes(req.staff.role)){
            throw new ApiError( 403, "Access denied" )
        }
        next()
    }
}

export {roleMiddleware}