const User = require("../models/user.model")
const bcrypt = require("bcrypt")
const tokenService = require("../jwt/token.service");

class UserService
{
    async signup(name,email,password)
    {
        const existingUser = await User.findOne({email});
        if(existingUser)
        {
            throw new Error("User already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({name,email,password:hashedPassword});
        return user;
    }

    async login(email,password)
    {
        const user = await User.findOne({email}).select("+password");
        if(!user)
        {
            throw new Error("User not found");
        }
        if(!user.isActive)
        {   
            throw new Error("User is not active");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid)
        {
            throw new Error("Invalid password");
        }
        const payload = { id: user._id, email: user.email ,isActive :user.isActive};
        const token = tokenService.generateToken(payload);
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        return { user:userWithoutPassword, token };
    }

    async logout()
    {
        return { message: "Logout successful" };
    }
}

module.exports = new UserService();