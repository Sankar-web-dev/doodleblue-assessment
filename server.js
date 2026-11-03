const express = require('express');
require('dotenv').config();

const connectDB = require("./config/db");

const app=express();
const userRoutes = require("./routes/user.routers");


app.use(express.json());
app.use("/api/v1", userRoutes);



app.get('/',(req,res)=>
{
    
    res.status(200).json({message:"Api is running"});
})


const PORT = process.env.PORT || 3000;

connectDB().then(() => {

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
});
}).catch(err => {
    console.error("Failed to start the server due to db connection error",err.message);
    process.exit(1);
    
});

