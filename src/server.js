import {app} from "./app.js"
import dns from "dns";
import dotenv from "dotenv";

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4'])
app.listen(process.env.PORT || 8000, () =>{
    console.log(`Server is running on port : ${process.env.PORT }`)
})

