const messages = require("../config/messages");
const User = require("../models/user");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

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
                name: userFound.first_name,
                email: userFound.email,
                scope: userFound.role,
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
        name: userFound.first_name,
        email: userFound.email,
        scope: userFound.role,
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

const forgotPassword =  (req, res) => {
    var {email} = req.body;
    
    console.log(email);
    
    if(email){
        email = email.toLowerCase().trim();
    }

    User.findOne({email}, async (err, user) => {
        if(err || !user){
            return res.status(400).json({error: "User with this email does not exists."})
        }

        const otp = Math.floor(1000 + Math.random() * 9000);
        const token = jwt.sign({_id: user._id, otp: otp}, messages.FORGOT_PWD_KEY, {expiresIn: '2m'})
        console.log(otp, "FP");
        let testAccount = await nodemailer.createTestAccount();

        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587, // remove this
            secure: false, // remove this
            auth: {
                user: testAccount.user, // user 
                pass: testAccount.pass, // password
              },
        })

        const data = { 
            from: '"Dark Mountain"<noreply@darkmountain.com>',
            to: email,
            subject: "Password Reset Link",
            html: `
                <h2>Please use this OTP to reset your password.</h2>
                <a>${otp}</a>
            `
        };

        transporter.sendMail(data, (error, info) => {
            if (error) {
                console.log(error);
              } else {
                console.log(info);
                res.send({data: token, otp: otp})
              }
        })
    })
}

const resetPassword = (req, res) => {
    var {email, token, otp} = req.body;

    if(email){
        email = email.toLowerCase().trim();
    }

    User.findOne({email}, (err, user) => {
        // optional to search for user
        if(err || !user){
            return res.status(400).json({error: "User with this email does not exists."})
        }

        jwt.verify(token, messages.FORGOT_PWD_KEY, (error, decodedData) => {
            if(error){
                return res.status(401).json({
                    error: "OTP expired"
                })
            } else if (decodedData.otp != otp){
                return res.status(401).json({
                    error: "Incorrect otp"
                })
            } else if (decodedData.otp == otp) {
                res.status(200).send({success: "Success"})
            } else {
                res.status(740).send({error: "Please enter correct otp."})
            }
            console.log(decodedData.otp, "Decoded");
        })
    })
}

const updatePassword = (req, res) => {
    let {email, newPass, cnfPass} = req.body;

    // console.log(email, newPass, cnfPass);

    if(email){
        email = email.toLowerCase().trim();
    }

    newPass = newPass.trim();
    cnfPass = cnfPass.trim();

    if(newPass === cnfPass){
        if(newPass.length < 6 && cnfPass.length < 6){
            return res.status(400).json({error: messages.PASSWORD_6DIGIT})
        }
        User.findOne({email}, (err, user) => {
            if (err || !user) {
                return res.status(400).json({ error: "User with this token does not exists." });
            }

            const obj = {
                password: user.generateHash(newPass)
            }

            user = _.extend(user, obj);
            user.save((error, result) => {
                if(error){
                    return res.status(400).json({error: "Reset password error."})
                } else {
                    return res.status(200).json({message: "Your password has been changed."})
                }
            })
        })
    } else {
        return res.status(400).json({error: "New Password and Confirm Password field do not match, please try again."})
    }
}

module.exports = {
    loginAuth,
    refresh,
    forgotPassword,
    resetPassword,
    updatePassword
}