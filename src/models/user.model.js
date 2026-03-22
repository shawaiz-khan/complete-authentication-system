import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: [true, "Username already taken"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email already taken"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        unique: [true, "Password already taken"],
    },
});

const UserModel = mongoose.models.users || mongoose.model("users", userSchema);

export default UserModel;