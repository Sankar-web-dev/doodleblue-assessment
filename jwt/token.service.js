const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

class TokenService {
    generateToken = (payload) => {
        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
        return token;
    };
}

module.exports = new TokenService();