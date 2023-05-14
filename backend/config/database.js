const mongoose =require("mongoose");


mongoose.set("strictQuery", false);
exports.connectDatabase=()=>{
    mongoose
    .connect(process.env.MONGO_URI)
    .then((con)=>console.log(`Database is connected successfully :${con.connection.host}`))
    .catch((err)=>console.log(err));
};