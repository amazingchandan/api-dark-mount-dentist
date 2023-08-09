const jwt = require("jsonwebtoken");
const config = require("../config/config");

exports.auth = (req, res, next) => {
    const token = req.get('authorization')?.split(' ')[1]; // Bearer YOUR_TOKEN
console.log(token, "TOKENNNNNNNNNNNNNNN")
    if (!token) {
        req.isAuth = false;
        next();
    }
   
    try {      
        let decodedToken;
        let decodedToken1;
        decodedToken = jwt.verify(token, config.admin_jwt_secret);
        decodedToken1 = jwt.verify(token, config.user_jwt_secret);
        if (!decodedToken || !decodedToken1) {
            req.isAuth = false;
        } else {
            req.sessionUserData = decodedToken ? decodedToken : decodedToken1;
            req.isAuth = true;
        }
        if (!req.isAuth) {
            const err = new Error(error_code.NOT_AUTHERIZED.CODE);
            err.statusCode = 0;
            throw err;
        }
        next();
    } catch (err) {
        
        req.isAuth = false;
        next();
    }
}