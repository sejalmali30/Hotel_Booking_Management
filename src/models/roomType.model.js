import {pool} from "../config/db.js"

const createRoomType = async ( name, basePrice, maxOccupancy, description ) =>
{
    const [ result ] = await pool.execute(
        `INSERT INTO room_types
        (name, base_price, max_occupancy, description)
        VALUES (?, ?, ?, ?)`,
        [ name, basePrice, maxOccupancy, description ]
    )
    return result.insertId
}

const getAllRoomTypes = async () =>{
    const [rows] = await pool.execute(
        `SELECT type_id, name, base_price, max_occupancy, description FROM room_types ORDER BY type_id`
    )
    return rows
}

const getRoomTypeById = async(type_id) => {
    const [rows] = await pool.execute(
        `SELECT type_id, name, base_price, max_occupancy, description FROM room_types WHERE type_id = ? `,
        [type_id]
    )
    return rows[0]
}

const updateRoomType = async(
    typeId,
    name,
    basePrice,
    maxOccupancy,
    description
) => {
    const [result] = await pool.execute(
        `UPDATE room_types SET name = ?, base_price = ?, max_occupancy=?, description = ? WHERE type_id = ?`,
        [name, basePrice, maxOccupancy, description, typeId]
    )
    return result
}

const deleteRoomType = async (typeId) => {
    const [result] = await pool.execute(
        `DELETE FROM room_types
         WHERE type_id = ?`,
        [typeId]
    );

    return result;
};

export {
    createRoomType,
    getAllRoomTypes,
    getRoomTypeById,
    updateRoomType,
    deleteRoomType
}