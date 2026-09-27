import { pool } from "../config/db.js"

const createGuest = async (
    name,
    phone,
    email,
    idProofType,
    idProofNumber,
    address
) =>
{
    const [ result ] = await pool.query(
        `INSERT INTO guests (name, phone, email, id_proof_type, id_proof_number, address)
        VALUES(?, ?, ?, ?, ?, ?)`,
        [ name,
            phone,
            email,
            idProofType,
            idProofNumber,
            address ]
    )
    return result.insertId
}

const getAllGuests = async () =>
{
    const [ rows ] = await pool.query(
        `SELECT *
         FROM guests
         ORDER BY guest_id DESC`
    );

    return rows;
}

const searchGuests = async ( query ) =>
{
    const [ rows ] = await pool.query(
        `SELECT *
         FROM guests
         WHERE name LIKE ?
            OR phone LIKE ?
         ORDER BY name`,
        [ `%${ query }%`, `%${ query }%` ]
    );

    return rows
}

const getGuestById = async ( guestId ) =>
{
    const [ rows ] = await pool.query(
        `SELECT *
         FROM guests
         WHERE guest_id = ?`,
        [ guestId ]
    );

    return rows[ 0 ];
}

const getGuestReservationHistory = async ( guestId ) =>
{
    const [ rows ] = await pool.query(
        `SELECT
            r.reservation_id,
            r.room_id,
            rm.room_number,
            rt.name AS room_type,
            r.check_in_date,
            r.check_out_date,
            r.num_guests,
            r.status,
            r.created_at
         FROM reservations r
         JOIN rooms rm
            ON r.room_id = rm.room_id
         JOIN room_types rt
            ON rm.type_id = rt.type_id
         WHERE r.guest_id = ?
         ORDER BY r.check_in_date DESC`,
        [ guestId ]
    );

    return rows;
}

const updateGuest = async (
    guestId,
    name,
    phone,
    email,
    idProofType,
    idProofNumber,
    address
) =>
{
    const [ result ] = await pool.query(
        `UPDATE guests
         SET name = ?,
             phone = ?,
             email = ?,
             id_proof_type = ?,
             id_proof_number = ?,
             address = ?
         WHERE guest_id = ?`,
        [
            name,
            phone,
            email,
            idProofType,
            idProofNumber,
            address,
            guestId
        ]
    );

    return result
}

const deleteGuest = async ( guestId ) =>
{
    const [ result ] = await pool.query(
        `DELETE FROM guests
         WHERE guest_id = ?`,
        [ guestId ]
    );

    return result;
};


export
{
    createGuest,
    getAllGuests,
    searchGuests,
    getGuestById,
    getGuestReservationHistory,
    updateGuest,
    deleteGuest
}