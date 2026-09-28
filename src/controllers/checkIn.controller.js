import
    {
        getReservationForCheckIn,
        performCheckIn,
        getActiveCheckIns
    } from "../models/checkIn.model.js";


// POST /api/reservations/:id/checkin
const checkInController = async ( req, res ) =>
{
    try
    {
        const { id } = req.params;

        // Get reservation and room details
        const reservation = await getReservationForCheckIn( id );

        // Reservation does not exist
        if ( !reservation )
        {
            return res.status( 404 ).json( {
                success: false,
                message: "Reservation not found"
            } );
        }

        // Check reservation status
        if ( reservation.reservation_status !== "confirmed" )
        {
            return res.status( 409 ).json( {
                success: false,
                message:
                    `Check-in is not allowed. Reservation status is '${ reservation.reservation_status }'`
            } );
        }

        // Room should be reserved before check-in
        if ( reservation.room_status !== "reserved" )
        {
            return res.status( 409 ).json( {
                success: false,
                message:
                    `Check-in is not allowed. Room status is '${ reservation.room_status }'`
            } );
        }

        // Perform check-in
        const result = await performCheckIn(
            id,
            req.staff.staff_id
        );

        return res.status( 200 ).json( {
            success: true,
            message: "Guest checked in successfully",
            checkin_id: result.checkinId,
            invoice_id: result.invoiceId
        } );
    }
    catch ( error )
    {
        console.error( "CHECK-IN ERROR:", error );

        return res.status( 500 ).json( {
            success: false,
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        } );
    }
};


// GET /api/checkins/active
const getActiveCheckInsController = async ( req, res ) =>
{
    try
    {
        const checkIns = await getActiveCheckIns();

        return res.status( 200 ).json( {
            success: true,
            count: checkIns.length,
            data: checkIns
        } );
    }
    catch ( error )
    {
        console.error( error );

        return res.status( 500 ).json( {
            success: false,
            message: "Failed to fetch active check-ins"
        } );
    }
};


export
{
    checkInController,
    getActiveCheckInsController
};