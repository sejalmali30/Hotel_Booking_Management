import {pool} from "../config/db.js";

const createStaff = async (name, email, passwordHash, role, phone) => {
    const [result] = await pool.execute(
        "INSERT INTO staff (name, username, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)",
        [name, email, passwordHash, role, phone]
    )
    return result.insertId;
}

const findStaffByUsername = async (username) =>{
    const [rows] = await pool.execute(
        "SELECT staff_id, name, username, password_hash, role, phone FROM staff WHERE username = ?",
        [username]
    )
    return rows[0]
}

const findStaffById = async (staffId) => {
    const [rows] = await pool.execute(
        "SELECT staff_id, name, username, role, phone FROM staff WHERE staff_id = ?",
        [staffId]
    )
    return rows[0]
}

export {
    createStaff,
    findStaffByUsername,
    findStaffById
}