import
    {
        checkRoomAvailability,
        getAvailableRooms,
        createReservation,
        getAllReservations,
        getReservationById,
        updateReservation
    } from "../models/reservation.model.js";


// GET /api/rooms/available
const getAvailableRoomsController = async ( req, res ) =>
{
    try
    {
        const { checkIn, checkOut, typeId } = req.query;

        if ( !checkIn || !checkOut )
        {
            return res.status( 400 ).json( {
                success: false,
                message: "checkIn and checkOut are required"
            } );
        }

        if ( checkOut <= checkIn )
        {
            return res.status( 400 ).json( {
                success: false,
                message: "checkOut must be after checkIn"
            } );
        }

        const rooms = await getAvailableRooms(
            checkIn,
            checkOut,
            typeId
        );

        return res.status( 200 ).json( {
            success: true,
            count: rooms.length,
            data: rooms
        } );
    }
    catch ( error )
    {
        console.error( error );

        return res.status( 500 ).json( {
            success: false,
            message: "Failed to fetch available rooms"
        } );
    }
};


// POST /api/reservations
const createReservationController = async ( req, res ) =>
{
    try
    {
        const {
            guest_id,
            room_id,
            check_in_date,
            check_out_date,
            num_guests
        } = req.body;

        if (
            !guest_id ||
            !room_id ||
            !check_in_date ||
            !check_out_date ||
            !num_guests
        )
        {
            return res.status( 400 ).json( {
                success: false,
                message: "All reservation fields are required"
            } );
        }

        if ( check_out_date <= check_in_date )
        {
            return res.status( 400 ).json( {
                success: false,
                message: "Check-out date must be after check-in date"
            } );
        }

        const isAvailable = await checkRoomAvailability(
            room_id,
            check_in_date,
            check_out_date
        );

        if ( !isAvailable )
        {
            return res.status( 409 ).json( {
                success: false,
                message: "Room is already booked for the selected dates"
            } );
        }

        const reservationId = await createReservation(
            guest_id,
            room_id,
            req.staff.staff_id,
            check_in_date,
            check_out_date,
            num_guests
        );

        return res.status( 201 ).json( {
            success: true,
            message: "Reservation created successfully",
            reservation_id: reservationId
        } );
    }
    catch ( error )
    {
        console.error( "CREATE RESERVATION ERROR:", error );

        return res.status( 500 ).json( {
            success: false,
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        } );
    }
};


// GET /api/reservations
const getAllReservationsController = async ( req, res ) =>
{
    try
    {
        const { status, date } = req.query;

        const reservations = await getAllReservations(
            status,
            date
        );

        return res.status( 200 ).json( {
            success: true,
            count: reservations.length,
            data: reservations
        } );
    }
    catch ( error )
    {
        console.error( error );

        return res.status( 500 ).json( {
            success: false,
            message: "Failed to fetch reservations"
        } );
    }
};


// GET /api/reservations/:id
const getReservationByIdController = async ( req, res ) =>
{
    try
    {
        const { id } = req.params;

        const reservation = await getReservationById( id );

        if ( !reservation )
        {
            return res.status( 404 ).json( {
                success: false,
                message: "Reservation not found"
            } );
        }

        return res.status( 200 ).json( {
            success: true,
            data: reservation
        } );
    }
    catch ( error )
    {
        console.error( error );

        return res.status( 500 ).json( {
            success: false,
            message: "Failed to fetch reservation"
        } );
    }
};


// PUT /api/reservations/:id
const updateReservationController = async ( req, res ) =>
{
    try
    {
        const { id } = req.params;

        const {
            room_id,
            check_in_date,
            check_out_date,
            num_guests
        } = req.body;

        if (
            !room_id ||
            !check_in_date ||
            !check_out_date ||
            !num_guests
        )
        {
            return res.status( 400 ).json( {
                success: false,
                message: "All reservation fields are required"
            } );
        }

        if ( check_out_date <= check_in_date )
        {
            return res.status( 400 ).json( {
                success: false,
                message: "Check-out date must be after check-in date"
            } );
        }

        // Exclude the current reservation while checking overlap
        const isAvailable = await checkRoomAvailability(
            room_id,
            check_in_date,
            check_out_date,
            id
        );

        if ( !isAvailable )
        {
            return res.status( 409 ).json( {
                success: false,
                message: "Room is already booked for the selected dates"
            } );
        }

        const result = await updateReservation(
            id,
            room_id,
            check_in_date,
            check_out_date,
            num_guests
        );

        if ( result.affectedRows === 0 )
        {
            return res.status( 404 ).json( {
                success: false,
                message: "Reservation not found or already checked in"
            } );
        }

        return res.status( 200 ).json( {
            success: true,
            message: "Reservation updated successfully"
        } );
    }
    catch ( error )
    {
        console.error( error );

        return res.status( 500 ).json( {
            success: false,
            message: "Failed to update reservation"
        } );
    }
}


export
{
    getAvailableRoomsController,
    createReservationController,
    getAllReservationsController,
    getReservationByIdController,
    updateReservationController
}