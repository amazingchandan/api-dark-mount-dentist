const moment = require('moment');
const moments = require('moment-timezone');
const nodemailer = require("nodemailer");
const config = require("../config/config");
const messages = require("../config/messages");
const User = require("../models/user");

exports.sendDailyReminder = async () => {
    try {
        console.log("SEND DAILY REMINDER 001")

        const email = "anas31197@gmail.com"

        const userList = await User.find({ role: 'dentist' })

        console.log(userList)

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: config.MAIL_USERNAME,
                pass: config.MAIL_PASSWORD,
                clientId: config.OAUTH_CLIENTID,
                clientSecret: config.OAUTH_CLIENT_SECRET,
                refreshToken: config.OAUTH_REFRESH_TOKEN
            }
        });

        let date = new Date().toLocaleString();
        console.log(date);

        const mailOptions = {
            from: config.MAIL_USERNAME,
            to: email,
            subject: `Dark Mountain - Daily Activity - ${date}`,
            html: `
            <div style="width: 100%;">
            <h3 
            style="font-size: 1.5rem !important;
            font-weight: 700 !important;
            background-color: #043049;
            box-shadow: 0 0 22px rgba(0, 0, 0, 0.13), 0 1px 3px rgba(0, 0, 0, 0.2);
            text-align: center;
            padding: 10px 0px;
            margin: 0px auto;
            color:#FFFFFF;"
            >
            Dark
            <span style="color: #00d957;">Mountain</span>
            </h3>
            <p 
            style="font-size: 20px;
            font-weight: 900;
            line-height: 25px;
            text-align: left;
            color: #000000;"
            >
            Daily Activity
            </p>
            <p style="text-align: left;">Use the code below to reset your password</p>
            <div style="text-align: left;">
            <strong 
            style="font-size: 18px;
            line-height: 30px;
            color: #00d957;"
            >
            Activities Here
            </strong>
                </div>
                <p style="text-align: left;">The verification code will be valid for 10 minutes. Please do not share this code with anyone.</p>
                <em style="margin-top: 15px">This is an automated message, please do not reply.</em>
                </div>
                `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log(info);
                res.send({ email: email })
            }
        })
    } catch (e) {
        console.log(e)
    }
}

exports.sendReminderForPendingSubs = async () => {
    try {
        console.log("SUBS PENDING 001")
        const pendingUserList = await User.find({ role: 'dentist', subscription_details: { status: false } })
        let date = new Date().getTime()
        console.log("!!!", pendingUserList, "!!!", date)
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: config.MAIL_USERNAME,
                pass: config.MAIL_PASSWORD,
                clientId: config.OAUTH_CLIENTID,
                clientSecret: config.OAUTH_CLIENT_SECRET,
                refreshToken: config.OAUTH_REFRESH_TOKEN
            }
        });
        pendingUserList.map((elem) => {
            if ((elem.created_at.getTime() + 60 * 60 * 24 * 1000) < date) {
                console.log(new Date(elem.created_at.getTime() + 60 * 60 * 24 * 1000), new Date(elem.created_at.getTime()), (elem.created_at.getTime() + 60 * 60 * 24 * 1000).toLocaleString().length, date.toLocaleString().length)

                const mailOptions = {
                    from: config.MAIL_USERNAME,
                    to: elem.email,
                    subject: `Dark Mountain - Subs Pending - ${date}`,
                    html: `
                    <div style="width: 100%;">
                    <h3 
                    style="font-size: 1.5rem !important;
                    font-weight: 700 !important;
                    background-color: #043049;
                    box-shadow: 0 0 22px rgba(0, 0, 0, 0.13), 0 1px 3px rgba(0, 0, 0, 0.2);
                    text-align: center;
                    padding: 10px 0px;
                    margin: 0px auto;
                    color:#FFFFFF;"
                    >
                    Dark
                    <span style="color: #00d957;">Mountain</span>
                    </h3>
                    <p 
                    style="font-size: 20px;
                    font-weight: 900;
                    line-height: 25px;
                    text-align: left;
                    color: #000000;"
                    >
                    Subscription Pending
                    </p>
                    <p style="text-align: left;">Use the code below to reset your password</p>
                    <div style="text-align: left;">
                    <strong 
                    style="font-size: 18px;
                    line-height: 30px;
                    color: #00d957;"
                    >
                    Due Date Here
                    </strong>
                        </div>
                        <p style="text-align: left;">The verification code will be valid for 10 minutes. Please do not share this code with anyone.</p>
                        <em style="margin-top: 15px">This is an automated message, please do not reply.</em>
                        </div>
                        `
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(info);
                        res.send({ email: email })
                    }
                })

            }
        })
    } catch (e) {
        console.log(e)
    }
}

exports.sendRenewalEmail = async () => {
    console.log("RENEWAL RUNNING")
    try {
        const date = new Date()
        console.log(date, new Date(date.getTime() + 60 * 60 * 24 * 1000 * 10))
        const renewalUserList = await User.find({ role: 'dentist', subscription_details: { status: true } })
        console.log(renewalUserList)
    } catch (e) {
        console.log(e)
    }
}