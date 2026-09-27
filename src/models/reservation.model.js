import {pool} from "../config/db.js";


// Check whether a room has an overlapping reservation
const checkRoomAvailability = async (
    roomId,
    checkInDate,
    checkOutDate,
    excludeReservationId = null
) =>
{
    let query = `
        SELECT reservation_id
        FROM reservations
        WHERE room_id = ?
        AND status IN ('confirmed', 'checked_in')
        AND check_in_date < ?
        AND check_out_date > ?
    `;

    const params = [
        roomId,
        checkOutDate,
        checkInDate
    ];

    // Used while editing an existing reservation
    if (excludeReservationId)
    {
        query += ` AND reservation_id != ?`;
        params.push(excludeReservationId);
    }

    const [ rows ] = await pool.query(query, params);

    return rows.length === 0;
};


// Get available rooms for given dates
const getAvailableRooms = async (
    checkInDate,
    checkOutDate,
    typeId = null
) =>
{
    let query = `
        SELECT
            rm.room_id,
            rm.room_number,
            rm.floor,
            rm.status,
            rt.type_id,
            rt.name AS room_type,
            rt.base_price,
            rt.max_occupancy,
            rt.description
        FROM rooms rm
        JOIN room_types rt
            ON rm.type_id = rt.type_id
        WHERE rm.status != 'maintenance'
        AND NOT EXISTS (
            SELECT 1
            FROM reservations r
            WHERE r.room_id = rm.room_id
            AND r.status IN ('confirmed', 'checked_in')
            AND r.check_in_date < ?
            AND r.check_out_date > ?
        )
    `;

    const params = [
        checkOutDate,
        checkInDate
    ];

    if (typeId)
    {
        query += ` AND rm.type_id = ?`;
        params.push(typeId);
    }

    query += ` ORDER BY rm.room_number`;

    const [ rows ] = await pool.query(query, params);

    return rows;
};


// Create reservation
const createReservation = async (
    guestId,
    roomId,
    staffId,
    checkInDate,
    checkOutDate,
    numGuests
) =>
{
    const connection = await pool.getConnection();

    try
    {
        await connection.beginTransaction();

        const [ result ] = await connection.query(
            `INSERT INTO reservations
            (
                guest_id,
                room_id,
                staff_id,
                check_in_date,
                check_out_date,
                num_guests,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
            [
                guestId,
                roomId,
                staffId,
                checkInDate,
                checkOutDate,
                numGuests
            ]
        );

        await connection.query(
            `UPDATE rooms
             SET status = 'reserved'
             WHERE room_id = ?`,
            [roomId]
        );

        await connection.commit();

        return result.insertId;
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


// Get all reservations
const getAllReservations = async (status, date) =>
{
    let query = `
        SELECT
            r.reservation_id,
            r.guest_id,
            g.name AS guest_name,
            g.phone AS guest_phone,
            r.room_id,
            rm.room_number,
            rt.name AS room_type,
            r.staff_id,
            s.name AS staff_name,
            r.check_in_date,
            r.check_out_date,
            r.num_guests,
            r.status,
            r.created_at
        FROM reservations r
        JOIN guests g
            ON r.guest_id = g.guest_id
        JOIN rooms rm
            ON r.room_id = rm.room_id
        JOIN room_types rt
            ON rm.type_id = rt.type_id
        JOIN staff s
            ON r.staff_id = s.staff_id
        WHERE 1 = 1
    `;

    const params = [];

    if (status)
    {
        query += ` AND r.status = ?`;
        params.push(status);
    }

    if (date)
    {
        query += `
            AND r.check_in_date <= ?
            AND r.check_out_date >= ?
        `;

        params.push(date, date);
    }

    query += ` ORDER BY r.created_at DESC`;

    const [ rows ] = await pool.query(query, params);

    return rows;
};


// Get one reservation with complete details
const getReservationById = async (reservationId) =>
{
    const [ rows ] = await pool.query(
        `SELECT
            r.reservation_id,

            g.guest_id,
            g.name AS guest_name,
            g.phone AS guest_phone,
            g.email AS guest_email,
            g.id_proof_type,
            g.id_proof_number,
            g.address,

            rm.room_id,
            rm.room_number,
            rm.floor,

            rt.type_id,
            rt.name AS room_type,
            rt.base_price,
            rt.max_occupancy,

            s.staff_id,
            s.name AS staff_name,

            r.check_in_date,
            r.check_out_date,
            r.num_guests,
            r.status,
            r.created_at

         FROM reservations r

         JOIN guests g
            ON r.guest_id = g.guest_id

         JOIN rooms rm
            ON r.room_id = rm.room_id

         JOIN room_types rt
            ON rm.type_id = rt.type_id

         JOIN staff s
            ON r.staff_id = s.staff_id

         WHERE r.reservation_id = ?`,
        [reservationId]
    );

    return rows[0];
};


// Update reservation before check-in
const updateReservation = async (
    reservationId,
    roomId,
    checkInDate,
    checkOutDate,
    numGuests
) =>
{
    const [ result ] = await pool.query(
        `UPDATE reservations
         SET
            room_id = ?,
            check_in_date = ?,
            check_out_date = ?,
            num_guests = ?
         WHERE reservation_id = ?
         AND status = 'confirmed'`,
        [
            roomId,
            checkInDate,
            checkOutDate,
            numGuests,
            reservationId
        ]
    );

    return result;
};


export {
    checkRoomAvailability,
    getAvailableRooms,
    createReservation,
    getAllReservations,
    getReservationById,
    updateReservation
};