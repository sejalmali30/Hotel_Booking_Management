import {pool} from "../config/db.js";


// Get reservation details before check-in
const getReservationForCheckIn = async (reservationId) =>
{
    const [ rows ] = await pool.query(
        `SELECT
            r.reservation_id,
            r.room_id,
            r.status AS reservation_status,
            rm.status AS room_status
         FROM reservations r
         JOIN rooms rm
            ON r.room_id = rm.room_id
         WHERE r.reservation_id = ?`,
        [reservationId]
    );

    return rows[0];
};


// Perform check-in
const performCheckIn = async (reservationId, staffId) =>
{
    const connection = await pool.getConnection();

    try
    {
        await connection.beginTransaction();


        // 1. Insert check-in
        const [ checkInResult ] = await connection.query(
            `INSERT INTO check_ins
            (
                reservation_id,
                actual_checkin_time,
                checked_in_by
            )
            VALUES (?, NOW(), ?)`,
            [reservationId, staffId]
        );


        // 2. Update reservation
        await connection.query(
            `UPDATE reservations
             SET status = 'checked_in'
             WHERE reservation_id = ?`,
            [reservationId]
        );


        // 3. Update room
        await connection.query(
            `UPDATE rooms rm
             JOIN reservations r
                ON rm.room_id = r.room_id
             SET rm.status = 'occupied'
             WHERE r.reservation_id = ?`,
            [reservationId]
        );


        // 4. Create pending invoice
        const [ invoiceResult ] = await connection.query(
            `INSERT INTO invoices
            (
                reservation_id,
                room_charges,
                tax_amount,
                total_amount,
                payment_status,
                generated_by
            )
            VALUES (?, 0, 0, 0, 'pending', ?)`,
            [reservationId, staffId]
        );


        await connection.commit();


        return {
            checkinId: checkInResult.insertId,
            invoiceId: invoiceResult.insertId
        };
    }
    catch (error)
    {
        await connection.rollback();
        throw error;
    }
    finally
    {
        connection.release();
    }
};

// Get all currently checked-in guests
const getActiveCheckIns = async () =>
{
    const [ rows ] = await pool.query(
        `SELECT
            ci.checkin_id,
            ci.reservation_id,
            ci.actual_checkin_time,

            g.guest_id,
            g.name AS guest_name,
            g.phone AS guest_phone,

            rm.room_id,
            rm.room_number,
            rt.name AS room_type,

            r.check_in_date,
            r.check_out_date,
            r.num_guests

         FROM check_ins ci

         JOIN reservations r
            ON ci.reservation_id = r.reservation_id

         JOIN guests g
            ON r.guest_id = g.guest_id

         JOIN rooms rm
            ON r.room_id = rm.room_id

         JOIN room_types rt
            ON rm.type_id = rt.type_id

         WHERE r.status = 'checked_in'
         AND ci.actual_checkout_time IS NULL

         ORDER BY ci.actual_checkin_time DESC`
    );

    return rows;
};


export {
    getReservationForCheckIn,
    performCheckIn,
    getActiveCheckIns
};