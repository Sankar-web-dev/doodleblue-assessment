const userService = require("../services/user.service");



class UserController{
    async signup(req, res) {
        try {
            const { name, email, password } = req.body;
            if(!name || !email || !password)
            {
                return res.status(400).json({message : "All fields are required"});
            }
            const user = await userService.signup(name, email, password);
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if(!email || !password)
            {
                return res.status(400).json({message : "All fields are required"});
            }
            const user = await userService.login(email, password);
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async logout(req, res) {
        try {
            const result = await userService.logout();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new UserController();
