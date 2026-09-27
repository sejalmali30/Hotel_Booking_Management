import {pool} from "../config/db.js"

const createRoom = async(roomNumber, floor, typeId) =>{
    const [result] = await pool.execute(
        `INSERT INTO rooms (room_number, floor, type_id)
        VALUES (?, ?, ?)`,
        [roomNumber, floor, typeId]
    )
    return result.insertId
}

const getAllRooms = async(status) =>{
    let query = `SELECT r.room_id, r.room_number, r.floor, r.type_id,
    rt.name AS room_type, rt.base_price, r.status 
    FROM rooms r JOIN room_types rt ON r.type_id = rt.type_id`;

    const params = []
    if(status){
        query += ` WHERE r.status=?`
        params.push(status)
    }
     query += ` ORDER BY r.room_id`

     const [rows] = await pool.execute(query, params)
     return rows
}

const getRoomById = async (roomId) => {
    const[rows] = await pool.execute(
        `SELECT r.room_id, r.room_number, r.floor, r.type_id,
        rt.name AS room_type, rt.base_price, r.status 
        FROM rooms r JOIN room_types rt ON r.type_id = rt.type_id
        WHERE r.room_id = ?`, [roomId] 
    )
    return rows[0]
}

const updateRoom = async(roomId, roomNumber, floor, typeId) =>{
    const [result] = await pool.execute(
        `UPDATE rooms SET room_number = ?, floor = ?, type_id = ?
        WHERE room_id = ?`,
        [roomNumber, floor, typeId , roomId]
    )
    return result
}

const updateRoomStatus = async (roomId, status) => {
    const [result] = await pool.execute(
        `UPDATE rooms
         SET status = ?
         WHERE room_id = ?`,
        [status, roomId]
    );

    return result;
};

const deleteRoom = async (roomId) => {
    const [result] = await pool.execute(
        `DELETE FROM rooms
         WHERE room_id = ?`,
        [roomId]
    );

    return result;
};

export {
    createRoom,
    getAllRooms,
    getRoomById,
    updateRoom,
    updateRoomStatus,
    deleteRoom
}