import { createRoomType, getAllRoomTypes, getRoomTypeById, updateRoomType, deleteRoomType } from "../models/roomType.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createRoomTypeController = async ( req, res ) =>
{
    try
    {
        const { name,
            base_price,
            max_occupancy,
            description } = req.body

        if ( !name || base_price === undefined || !max_occupancy )
        {
            return res.status( 400 ).json( {
                message: "Name, base price and maximum occupancy are required"
            } )
        }
        if ( base_price < 0 )
        {
            return res.status( 400 ).json( {
                message: "Base price cannot be negative"
            } )
        }
        if ( max_occupancy <= 0 )
        {
            return res.status( 400 ).json( {
                message: "Maximum occupancy must be greater than 0"
            } )
        }
        const typeId = await createRoomType(
            name,
            base_price,
            max_occupancy,
            description
        )

        return res.status( 201 ).json(
            new ApiResponse( 201, { typeId }, "Room type created successfully" )
        )
    } catch ( error )
    {
        console.log( error )
        if ( error.code == 'ER_DUP_ENTRY' )
        {
            return res.status( 409 ).json( {
                message: "Room type name already exists"
            } )
        }
        throw new ApiError( 500, "Internal server error" )
    }
}

const getAllRoomTypesController = async ( req, res ) =>
{
    try
    {
        const roomTypes = await getAllRoomTypes()

        return res.status( 200 ).json(
            new ApiResponse( 200, { roomTypes } )
        )
    } catch
    {
        console.log( error )
        throw new ApiError( 500, "Internal server error" )
    }
}

const getRoomTypeByIdController = async ( req, res ) =>
{
    try
    {
        const { id } = req.params
        const roomType = await getRoomTypeById( id )

        if ( !roomType )
        {
            throw new ApiError( 404, "Room type not found" )
        }

        return res.status( 200 ).json(
            new ApiResponse( 200, { roomType } )
        )
    } catch ( error )
    {
        console.error( "GET ROOM TYPE ERROR:", error );

        return res.status( error.statusCode || 500 ).json(
            new ApiResponse(
                error.statusCode || 500,
                null,
                error.message || "Internal server error"
            )
        )
    }
}

const updateRoomTypeController = async ( req, res ) =>
{
    try
    {
        const { id } = req.params

        const { name, base_price, max_occupancy, description } = req.body
        if ( !name || base_price === undefined || !max_occupancy )
        {
            return res.status( 400 ).json( {
                message: "Name, base price and maximum occupancy are required"
            } )
        }
        if ( base_price < 0 )
        {
            return res.status( 400 ).json( {
                message: "Base price cannot be negative"
            } );
        }
        if ( max_occupancy <= 0 )
        {
            return res.status( 400 ).json( {
                message: "Maximum occupancy must be greater than 0"
            } );
        }
        const result = await updateRoomType(
            id, name, base_price, max_occupancy, description
        )
        if ( result.affectedRows === 0 )
        {
            return res.status( 404 ).json( {
                message: "Room type not found"
            } )
        }
        return res.status( 200 ).json(
            new ApiResponse( 200, "Room type updated successfully" )
        )
    } catch ( error )
    {
        console.error( error );

        if ( error.code === "ER_DUP_ENTRY" )
        {
            return res.status( 409 ).json( {
                message: "Room type name already exists"
            } );
        }
        throw new ApiError( 500, "Internal server error" )
    }
}

const deleteRoomTypeController = async ( req, res ) =>
{
    try
    {
        const { id } = req.params
        const result = await deleteRoomType( id )

        if ( result.affectedRows === 0 )
        {
            return res.status( 404 ).json( {
                message: "Room type not found"
            } )
        }
        return res.status( 200 ).json(
            new ApiResponse( 200,{result}, "Room type deleted successfully" )
        )
    } catch
    {
        console.error( error );

        // Room is still referencing this room type
        if ( error.code === "ER_ROW_IS_REFERENCED_2" )
        {
            return res.status( 409 ).json( {
                message: "Cannot delete this room type because rooms are using it"
            } );
        }
        throw new ApiError( 500, "Internal server error" )
    }
}

export
{
    createRoomTypeController,
    getAllRoomTypesController,
    getRoomTypeByIdController,
    updateRoomTypeController,
    deleteRoomTypeController
}