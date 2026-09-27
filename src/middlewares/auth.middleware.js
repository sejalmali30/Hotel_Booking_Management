import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"

const authMiddleware = ( req, res, next ) =>
{
    try
    {
        const authHeader = req.headers.authorization
        if ( !authHeader )
        {
            throw new ApiError( 401, "Authorization token required" )
        }

        console.log( "AUTH HEADER:", req.headers.authorization );
        const token = authHeader.split( " " )[ 1 ]

        if ( !token )
        {
            throw new ApiError( 401, "Invalid authorization format" )
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )
        req.staff = decoded
        next()
    } catch ( error )
    {
        console.error( "REGISTER GUEST ERROR:", error );

        return res.status( 500 ).json( {
            success: false,
            message: error.message,
            error: error.code
        } );
    }
}

export { authMiddleware }