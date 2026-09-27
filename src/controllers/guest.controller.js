import { createGuest, getAllGuests, searchGuests, getGuestById, getGuestReservationHistory, updateGuest, deleteGuest } from "../models/guest.model.js";

const createGuestController = async ( req, res ) =>
{
    try
    {
        const {
            name,
            phone,
            email,
            id_proof_type,
            id_proof_number,
            address
        } = req.body;

        if ( !name || !phone )
        {
            return res.status( 400 ).json( {
                success: false,
                message: "Name and phone are required"
            } );
        }

        const guestId = await createGuest(
            name,
            phone,
            email,
            id_proof_type,
            id_proof_number,
            address
        );

        return res.status( 201 ).json( {
            success: true,
            message: "Guest registered successfully",
            guest_id: guestId
        } );
    }
    catch ( error )
    {
        console.error( "CREATE GUEST ERROR:", error );

        return res.status( 500 ).json( {
            success: false,
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        } );
    }
}

const getAllGuestsController = async ( req, res ) =>
{
    try
    {
        const guests = await getAllGuests();

        return res.status( 200 ).json( {
            success: true,
            count: guests.length,
            data: guests
        } );
    }
    catch ( error )
    {
        console.error( error );

        return res.status( 500 ).json( {
            success: false,
            message: "Failed to fetch guests"
        } );
    }
}

const searchGuestsController = async ( req, res ) =>
{
    try
    {
        const { query } = req.query;

        if ( !query )
        {
            return res.status( 400 ).json( {
                success: false,
                message: "Search query is required"
            } );
        }

        const guests = await searchGuests( query );

        return res.status( 200 ).json( {
            success: true,
            count: guests.length,
            data: guests
        } );
    }
    catch ( error )
    {
        console.error( error );

        return res.status( 500 ).json( {
            success: false,
            message: "Failed to search guests"
        } );
    }
}


const getGuestByIdController = async ( req, res ) =>
{
    try
    {
        const { id } = req.params;

        const guest = await getGuestById( id );

        if ( !guest )
        {
            return res.status( 404 ).json( {
                success: false,
                message: "Guest not found"
            } );
        }

        const history = await getGuestReservationHistory( id );

        return res.status( 200 ).json( {
            success: true,
            data: {
                guest,
                reservation_history: history
            }
        } );
    }
    catch ( error )
    {
        console.error( error );

        return res.status( 500 ).json( {
            success: false,
            message: "Failed to fetch guest profile"
        } );
    }
}

const updateGuestController = async ( req, res ) =>
{
    try
    {
        const { id } = req.params;

        const {
            name,
            phone,
            email,
            id_proof_type,
            id_proof_number,
            address
        } = req.body;

        if ( !name || !phone )
        {
            return res.status( 400 ).json( {
                success: false,
                message: "Name and phone are required"
            } );
        }

        const result = await updateGuest(
            id,
            name,
            phone,
            email,
            id_proof_type,
            id_proof_number,
            address
        );

        if ( result.affectedRows === 0 )
        {
            return res.status( 404 ).json( {
                success: false,
                message: "Guest not found"
            } );
        }

        return res.status( 200 ).json( {
            success: true,
            message: "Guest updated successfully"
        } );
    }
    catch ( error )
    {
        console.error( error );

        return res.status( 500 ).json( {
            success: false,
            message: "Failed to update guest"
        } );
    }
}
const deleteGuestController = async ( req, res ) =>
{
    try
    {
        const { id } = req.params;

        const result = await deleteGuest( id );

        if ( result.affectedRows === 0 )
        {
            return res.status( 404 ).json( {
                success: false,
                message: "Guest not found"
            } );
        }

        return res.status( 200 ).json( {
            success: true,
            message: "Guest deleted successfully"
        } );
    }
    catch ( error )
    {
        console.error( error );

        if (
            error.code === "ER_ROW_IS_REFERENCED_2" ||
            error.code === "ER_ROW_IS_REFERENCED"
        )
        {
            return res.status( 409 ).json( {
                success: false,
                message: "Guest cannot be deleted because reservation history exists"
            } );
        }

        return res.status( 500 ).json( {
            success: false,
            message: "Failed to delete guest"
        } );
    }
}


export
{
    createGuestController,
    getAllGuestsController,
    searchGuestsController,
    getGuestByIdController,
    updateGuestController,
    deleteGuestController
}