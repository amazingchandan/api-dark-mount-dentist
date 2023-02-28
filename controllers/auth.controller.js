const User = require("../models/user");
const jwt = require("jsonwebtoken");

const loginAuth = (req, res) => {

    const regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    if (req.body.email == undefined || req.body.password == undefined) {
        return res.status(404).send({ error: "Please fill all the required fields." })
    } else if (!regex.test(req.body.email)){
        return res.status(550).send({error: "Please type proper format of email."})
    } else if (req.body.password.length < 6) {
        return res.status(500).send({ error: "Password should be at least 6 digits." })
    }

    User.findOne({ email: req.body.email.toLowerCase().trim() }).exec((err, userFound) => {
        if (err) {
            return res.status(500).send({ error: "Internal server error." })
        } else if (!(userFound && userFound.validatePassword(req.body.password))) {
            res.status(401).send({ error: "Email or password is incorrect. Please try again or sign up using different email" })
        } else {
            const claims = {
                iss: 'http://www.abc.com',
                sub: userFound.email,
                scope: userFound.name,
            };

            const access_token = jwt.sign(claims, "NcRfUjXn2r5u8x/A?D(G+KaPdSgVkYp3", {
                algorithm: 'HS256',
                expiresIn: 180000,
            });

            const refresh_token = jwt.sign(claims, "NcRfUjXn2r5u8x/A?D(G+KaPdSgVkYp3", {
                algorithm: 'HS256',
                expiresIn: 180000,
            });

            // jwt set in cookie
            res.cookie('access_token', access_token, {
                httpOnly: true,
                maxAge: 180000,
                // sameSite: 'none',
                // secure: true,
            });
            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                maxAge: 180000,
                // sameSite: 'none',
                // secure: true,
            });
            res.status(200).send({ msg: userFound });
        }
    })
}

const refresh = (req, res) => {
    const claims = {
        iss: req.claims.iss,
        sub: req.claims.sub,
        scope: req.claims.scope
    };
    try {
        const access_token = jwt.sign(claims, "NcRfUjXn2r5u8x/A?D(G+KaPdSgVkYp3", {
            algorithm: 'HS256',
            expiresIn: 180000
        });
        const refresh_token = jwt.sign(claims, "NcRfUjXn2r5u8x/A?D(G+KaPdSgVkYp3", {
            algorithm: 'HS256',
            expiresIn: 180000
        });

        // parsing in cookie
        res.cookie('access_token', access_token, {
            httpOnly: true,
            maxAge: 180000,
            // secure: true
        });
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            maxAge: 180000,
            // secure: true
        });
        res.status(200).send({ msg: "Login successful" });
    } catch (e) {
        console.warn(e);
    }
}

module.exports = {
    loginAuth,
    refresh
}