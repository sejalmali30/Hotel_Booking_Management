import
{
    addBillItem,
    getBillItemsByInvoice,
    getBillItemById,
    deleteBillItem,
    getBillItemsTotal
} from "../models/billItem.model.js";

import { pool } from "../config/db.js";


// POST /api/invoices/:invoiceId/items
const addBillItemController = async ( req, res ) =>
{
    try
    {
        const { invoiceId } = req.params;

        const {
            description,
            quantity,
            unit_price
        } = req.body;


        // Validation
        if ( !description || !quantity || unit_price === undefined )
        {
            return res.status( 400 ).json( {
                success: false,
                message: "Description, quantity and unit_price are required"
            } );
        }


        if ( Number( quantity ) <= 0 )
        {
            return res.status( 400 ).json( {
                success: false,
                message: "Quantity must be greater than 0"
            } );
        }


        if ( Number( unit_price ) < 0 )
        {
            return res.status( 400 ).json( {
                success: false,
                message: "Unit price cannot be negative"
            } );
        }


        // Check invoice
        const [ invoices ] = await pool.query(
            `SELECT
                invoice_id,
                reservation_id,
                payment_status
             FROM invoices
             WHERE invoice_id = ?`,
            [ invoiceId ]
        );


        if ( invoices.length === 0 )
        {
            return res.status( 404 ).json( {
                success: false,
                message: "Invoice not found"
            } );
        }


        const invoice = invoices[ 0 ];


        // Do not allow adding charges to finalized invoice
        if ( invoice.payment_status !== "pending" )
        {
            return res.status( 409 ).json( {
                success: false,
                message: "Cannot add items to a finalized invoice"
            } );
        }


        const itemId = await addBillItem(
            invoiceId,
            description,
            Number( quantity ),
            Number( unit_price )
        );


        const runningTotal = await getBillItemsTotal( invoiceId );


        return res.status( 201 ).json( {
            success: true,
            message: "Bill item added successfully",
            item_id: itemId,
            running_items_total: runningTotal
        } );
    }
    catch ( error )
    {
        console.error( "FETCH BILL ITEMS ERROR:", error );

        return res.status( 500 ).json( {
            success: false,
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        } );
    }
};



// GET /api/invoices/:invoiceId/items
const getBillItemsController = async ( req, res ) =>
{
    try
    {
        const { invoiceId } = req.params;


        // Check invoice exists
        const [ invoices ] = await pool.query(
            `SELECT invoice_id
             FROM invoices
             WHERE invoice_id = ?`,
            [ invoiceId ]
        );


        if ( invoices.length === 0 )
        {
            return res.status( 404 ).json( {
                success: false,
                message: "Invoice not found"
            } );
        }


        const items = await getBillItemsByInvoice( invoiceId );

        const runningTotal = await getBillItemsTotal( invoiceId );


        return res.status( 200 ).json( {
            success: true,
            data: items,
            running_items_total: runningTotal
        } );
    }
    catch ( error )
    {
        console.error( "FETCH BILL ITEMS ERROR:", error );

        return res.status( 500 ).json( {
            success: false,
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        } );
    }
};



// DELETE /api/invoices/items/:itemId
const deleteBillItemController = async ( req, res ) =>
{
    try
    {
        const { itemId } = req.params;


        const item = await getBillItemById( itemId );


        if ( !item )
        {
            return res.status( 404 ).json( {
                success: false,
                message: "Bill item not found"
            } );
        }


        // Check invoice status
        const [ invoices ] = await pool.query(
            `SELECT payment_status
             FROM invoices
             WHERE invoice_id = ?`,
            [ item.invoice_id ]
        );


        if ( invoices.length === 0 )
        {
            return res.status( 404 ).json( {
                success: false,
                message: "Invoice not found"
            } );
        }


        if ( invoices[ 0 ].payment_status !== "pending" )
        {
            return res.status( 409 ).json( {
                success: false,
                message: "Cannot delete item from a finalized invoice"
            } );
        }


        await deleteBillItem( itemId );


        const runningTotal = await getBillItemsTotal(
            item.invoice_id
        );


        return res.status( 200 ).json( {
            success: true,
            message: "Bill item deleted successfully",
            running_items_total: runningTotal
        } );
    }
    catch ( error )
    {
        console.error( error );

        return res.status( 500 ).json( {
            success: false,
            message: "Failed to delete bill item"
        } );
    }
};


export
{
    addBillItemController,
    getBillItemsController,
    deleteBillItemController
};