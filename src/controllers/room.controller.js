import { createRoom, getAllRooms, getRoomById, updateRoom, updateRoomStatus, deleteRoom } from "../models/room.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const allowedStatuses = [
    "available", "reserved", "occupied", "maintenance", "cleaning"
]

const createRoomController = async ( req, res ) =>
{
    try
    {
        const { room_number, floor, type_id } = req.body

        if ( !room_number || !type_id )
        {
            return res.status( 400 ).json( {
                message: "Room number and room type are required"
            } )
        }
        const roomId = await createRoom(
            room_number,
            floor,
            type_id
        )
        return res.status( 201 ).json(
            new ApiResponse( 201, { room_id: roomId }, "Room created successfully" )
        )
    } catch ( error )
    {
        console.error( "CREATE ROOM ERROR:", error );

        return res.status( error.statusCode || 500 ).json(
            new ApiResponse(
                error.statusCode || 500,
                null,
                error.message || "Internal server error"
            )
        )
    }
}

const getAllRoomsController = async ( req, res ) =>
{
    try
    {
        const { status } = req.query

        if ( status && !allowedStatuses.includes( status ) )
        {
            return res.status( 400 ).json( {
                message: `Invalid status. Allowed values: ${ allowedStatuses.join( ", " ) }`
            } )
        }

        const rooms = await getAllRooms( status )

        return res.status( 200 ).json(
            new ApiResponse( 200, { count: rooms.length, rooms } )
        )
    } catch ( error )
    {
        console.error( "GET ROOMS ERROR:", error );

        return res.status( error.statusCode || 500 ).json(
            new ApiResponse(
                error.statusCode || 500,
                null,
                error.message || "Internal server error"
            )
        )
    }
}

const getRoomByIdController = async ( req, res ) =>
{
    try
    {
        const { id } = req.params

        const room = await getRoomById( id )
        if ( !room )
        {
            throw new ApiError( 404, "Room not found" )
        }
        return res.status( 200 ).json(
            new ApiResponse( 200, room )
        )
    } catch ( error )
    {
        console.log( error )
        throw new ApiError( 500, "Internal server error" )
    }
}

const updateRoomController = async ( req, res ) =>
{
    try
    {
        const { id } = req.params;

        const {
            room_number,
            floor,
            type_id
        } = req.body;

        if ( !room_number || !type_id )
        {
            return res.status( 400 ).json( {
                message: "Room number and room type are required"
            } );
        }

        const result = await updateRoom(
            id,
            room_number,
            floor,
            type_id
        );

        if ( result.affectedRows === 0 )
        {
            return res.status( 404 ).json( {
                message: "Room not found"
            } );
        }

        return res.status( 200 ).json( {
            message: "Room updated successfully"
        } );

    } catch ( error )
    {
        console.error( error );

        if ( error.code === "ER_DUP_ENTRY" )
        {
            return res.status( 409 ).json( {
                message: "Room number already exists"
            } );
        }

        if (
            error.code === "ER_NO_REFERENCED_ROW_2" ||
            error.code === "ER_NO_REFERENCED_ROW"
        )
        {
            return res.status( 400 ).json( {
                message: "Invalid room type"
            } );
        }

        return res.status( 500 ).json( {
            message: "Internal server error"
        } );
    }
};

const updateRoomStatusController = async ( req, res ) =>
{
    try
    {
        const { id } = req.params;
        const { status } = req.body;

        if ( !status )
        {
            return res.status( 400 ).json( {
                message: "Status is required"
            } );
        }

        if ( !allowedStatuses.includes( status ) )
        {
            return res.status( 400 ).json( {
                message: `Invalid status. Allowed values: ${ allowedStatuses.join( ", " ) }`
            } );
        }

        const result = await updateRoomStatus( id, status );

        if ( result.affectedRows === 0 )
        {
            return res.status( 404 ).json( {
                message: "Room not found"
            } );
        }

        return res.status( 200 ).json( {
            message: "Room status updated successfully",
            status
        } );

    } catch ( error )
    {
        console.error( error );

        return res.status( 500 ).json( {
            message: "Internal server error"
        } );
    }
}

const deleteRoomController = async ( req, res ) =>
{
    try
    {
        const { id } = req.params;

        const result = await deleteRoom( id );

        if ( result.affectedRows === 0 )
        {
            return res.status( 404 ).json( {
                message: "Room not found"
            } );
        }

        return res.status( 200 ).json( {
            message: "Room deleted successfully"
        } );

    } catch ( error )
    {
        console.error( error );

        // Room is referenced by reservations
        if ( error.code === "ER_ROW_IS_REFERENCED_2" )
        {
            return res.status( 409 ).json( {
                message: "Cannot delete this room because it is used in a reservation"
            } );
        }

        return res.status( 500 ).json( {
            message: "Internal server error"
        } );
    }
};

export
{
    createRoomController,
    getAllRoomsController,
    getRoomByIdController,
    updateRoomController,
    updateRoomStatusController,
    deleteRoomController
}