const jwt = require("jsonwebtoken");

function authMiddleware (req,res,next)
{
    const authorization = req.headers.authorization;
    const [schema,token] = authorization ? authorization.split(" ") : [];
    if(schema !== "Bearer" || !token)
    {
        return res.status(401).json({message:"Authorization token is missing"})
    }
    const secretKey = process.env.JWT_SECRET;
    
    if(!secretKey)
    {
        return next(new Error("JWT_SECRET is not defines"));
    }
    
    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        return next(new Error("Invalid token"));
    }
}

module.exports = authMiddleware;