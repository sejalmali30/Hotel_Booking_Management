import { pool } from "../config/db.js";


// Add a bill item
const addBillItem = async (
    invoiceId,
    description,
    quantity,
    unitPrice
) =>
{
    const amount = Number( quantity ) * Number( unitPrice );

    const [ result ] = await pool.query(
        `INSERT INTO bill_items
        (
            invoice_id,
            description,
            quantity,
            unit_price,
            amount
        )
        VALUES (?, ?, ?, ?, ?)`,
        [
            invoiceId,
            description,
            quantity,
            unitPrice,
            amount
        ]
    );

    return result.insertId;
};


// Get all bill items for an invoice
const getBillItemsByInvoice = async ( invoiceId ) =>
{
    const [ rows ] = await pool.query(
        `SELECT
            item_id,
            invoice_id,
            description,
            quantity,
            unit_price,
            amount
         FROM bill_items
         WHERE invoice_id = ?
         ORDER BY item_id ASC`,
        [ invoiceId ]
    );

    return rows;
};


// Get one bill item
const getBillItemById = async ( itemId ) =>
{
    const [ rows ] = await pool.query(
        `SELECT
            item_id,
            invoice_id,
            description,
            quantity,
            unit_price,
            amount
         FROM bill_items
         WHERE item_id = ?`,
        [ itemId ]
    );

    return rows[ 0 ];
};


// Delete a bill item
const deleteBillItem = async ( itemId ) =>
{
    const [ result ] = await pool.query(
        `DELETE FROM bill_items
         WHERE item_id = ?`,
        [ itemId ]
    );

    return result.affectedRows;
};


// Calculate current running charges
const getBillItemsTotal = async ( invoiceId ) =>
{
    const [ rows ] = await pool.query(
        `SELECT
            COALESCE(SUM(amount), 0) AS items_total
         FROM bill_items
         WHERE invoice_id = ?`,
        [ invoiceId ]
    );

    return Number( rows[ 0 ].items_total );
};


export
{
    addBillItem,
    getBillItemsByInvoice,
    getBillItemById,
    deleteBillItem,
    getBillItemsTotal
};