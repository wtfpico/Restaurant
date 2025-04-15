import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://dennisboatengac:Dennis123@cluster0.zdunt.mongodb.net/Restaurant').then(()=>console.log("connected"))

}