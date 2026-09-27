import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createStaff, findStaffByUsername, findStaffById } from "../models/staff.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const registerStaff = async ( req, res ) =>
{
    try
    {
        const { name, username, password, role, phone } = req.body
        if ( !name || !username || !password || !role || !phone )
        {
            throw new ApiError( 400, "All fields are required" )
        }

        const existingStaff = await findStaffByUsername( username )
        if ( existingStaff )
        {
            throw new ApiError( 409, "Username already exists" )
        }

        const passwordHash = await bcrypt.hash( password, 10 )

        const staffId = await createStaff(
            name, username, passwordHash, role, phone
        )

        return res.status( 201 ).json(
            new ApiResponse( 201, {
                staffId,
                name,
                username,
                role,
                passwordHash
            }, "Staff registered successfully" )
        )
    } catch ( error )
    {
        console.error( "REGISTER STAFF ERROR:", error );

        return res.status( error.statusCode || 500 ).json(
            new ApiResponse(
                error.statusCode || 500,
                null,
                error.message || "Internal server error"
            )
        );
    }
}

const loginStaff = async ( req, res ) =>
{
    try
    {
        const { username, password } = req.body
        if ( !username || !password )
        {
            throw new ApiError( 400, "Username and password are required" )
        }

        const staff = await findStaffByUsername( username )

        if ( !staff )
        {
            throw new ApiError( 401, "Invalid username or password" )
        }

        const passwordMatch = await bcrypt.compare(
            password,
            staff.password_hash
        )
        if ( !passwordMatch )
        {
            throw new ApiError( 401, "Invalid username or password" )
        }

        const token = jwt.sign(
            {
                staff_id: staff.staff_id,
                role: staff.role
            },
            process.env.JWT_SECRET,

            {
                expiresIn: "1d"
            }
        )

        return res.status( 200 )
            .json( new ApiResponse( 200,
                {
                    token,
                    staff: {
                        staff_id: staff.staff_id,
                        name: staff.name,
                        username: staff.username,
                        role: staff.role,
                        phone: staff.phone
                    }
                },
                "Login successful!"
            ) )
    } catch ( error )
    {
        console.error( error );

        throw new ApiError( 400, "Internal server error" )
    }
}

const getMe = async ( req, res ) =>
{
    try
    {
        const staff = await findStaffById( req.staff.staff_id );

        if ( !staff )
        {
            throw new ApiError( 404, "Staff not found" )
        }

        return res.status( 200 ).json( new ApiResponse( 200, staff ) );

    } catch ( error )
    {
        console.error( error );

        throw new ApiError( 400, "Internal server error" )
    }
};
export
{
    registerStaff,
    loginStaff,
    getMe
}