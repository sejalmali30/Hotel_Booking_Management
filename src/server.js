import { app } from "./app.js"
//import dns from "dns";
import dotenv from "dotenv";
import {pool} from "./config/db.js"

dotenv.config();

const startServer = async () =>
{
    try
    {
        await pool.query( "SELECT 1" )
        console.log( "Database connection established successfully" )

        app.listen( process.env.PORT || 8000, () =>
        {
            console.log( `Server is running on port : ${ process.env.PORT }` )
        } )

    }catch ( error ){
        console.error("Database connection failed:", error)
    }
}

startServer();
