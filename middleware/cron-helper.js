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

        const userListDentist = await User.find({ role: 'dentist' })

        console.log(userListDentist)

        if(userListDentist.length == 0){
            return res.send({
                success: false,
                message: messages.ERROR
            })
        }

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

        userListDentist.forEach((elem) => {
            const mailOptions = {
                from: '"Dark Mountain" <config.MAIL_USERNAME>',
                to: elem.email,
                subject: `Dark Mountain - Daily Activity - ${date}`,
                html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <style>
                    * {
                        padding: 0%;
                        margin: 0%;
                        box-sizing: border-box;
                    }
                    </style>
                    <title>Dark Mountain - Email</title>
                </head>
                <body style="width: 100%">
                    <table
                    style="
                        margin: 0% auto;
                        background-color: #f0f0f0;
                        padding: 15px 25px 20px 15px;
                    "
                    >
                    <thead>
                        <tr>
                        <th>
                            <h3
                            style="
                                font-size: 1.5rem !important;
                                font-weight: 700 !important;
                                text-align: center;
                                padding: 10px 0px;
                                margin: 0px auto;
                                color: #043049;
                            "
                            >
                            Dark
                            <span style="color: #00d957">Mountain</span>
                            </h3>
                            <br>
                        </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td>
                            <span>Hello ${elem.first_name},</span>
                        </td>
                        </tr>
                        <tr>
                        <td>
                            <p style="text-align: left">
                            Your daily activities are listed below.
                            </p>
                        </td>
                        </tr>
                        <!-- <tr>
                        <td>
                            <br />
                            <strong style="color: #00d957">${otp}</strong>
                        </td>
                        </tr>
                        <tr>
                        <td>
                            <br />
                            <h4>Subscription Details:</h4>
                        </td>
                        </tr>
                        <tr>
                        <td>
                            <table border="1">
                            <thead>
                                <tr>
                                <th style="text-align: left; padding: 5px;">Name</th>
                                <th style="text-align: left; padding: 5px;">Plan Type</th>
                                <th style="text-align: right; padding: 5px;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                <td style="text-align: left; padding: 5px;">${req.body.name}</td>
                                <td style="text-align: left; padding: 5px;">${req.body.type}</td>
                                <td style="text-align: right; padding: 5px;">$${req.body.price}</td>
                                </tr>
                            </tbody>
                            </table>
                        </td>
                        </tr> -->
                        <tr>
                        <td>
                            <br>
                            <p>Thank you</p>
                        </td>
                        </tr>
                        <tr>
                        <td>
                            <br />
                            <em style="margin-top: 15px"
                            >This is an automated message, please do not reply.</em
                            >
                        </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                        <td>
                            <br>
                            <div style="text-align: start">© Dark Mountain</div>
                        </td>
                        </tr>
                    </tfoot>
                    </table>
                </body>
                </html>
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
        });
    } catch (e) {
        console.log(e)
    }
}

exports.sendReminderForPendingSubs = async () => {
    try {
        let date = new Date();
        let data = {
            'role': 'dentist',
            'subscription_details.status': false,
            'created_at': {'$lte': new Date(date.getTime() + 60 * 60 * 48 * 1000),
                            '$gte': new Date(date.getTime() + 60 * 60 * 24 * 1000)}
        }
        // start_date : {$gte: }
        const pendingUserList = await User.find(data)
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
            // if ((elem.created_at.getTime() + 60 * 60 * 24 * 1000) < date && (elem.created_at.getTime() + 60 * 60 * 36 * 1000) > date) {
                console.log(new Date(elem.created_at.getTime() + 60 * 60 * 24 * 1000), new Date(elem.created_at.getTime()), (elem.created_at.getTime() + 60 * 60 * 24 * 1000).toLocaleString().length, date.toLocaleString().length)

                const mailOptions = {
                    from: '"Dark Mountain" <config.MAIL_USERNAME>',
                    to: elem.email,
                    subject: `Dark Mountain - Subscription Pending - ${date}`,
                    html: `
                    <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8" />
                            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                            <style>
                            * {
                                padding: 0%;
                                margin: 0%;
                                box-sizing: border-box;
                            }
                            </style>
                            <title>Dark Mountain - Email</title>
                        </head>
                        <body style="width: 100%">
                            <table
                            style="
                                margin: 0% auto;
                                background-color: #f0f0f0;
                                padding: 15px 25px 20px 15px;
                            "
                            >
                            <thead>
                                <tr>
                                <th>
                                    <h3
                                    style="
                                        font-size: 1.5rem !important;
                                        font-weight: 700 !important;
                                        text-align: center;
                                        padding: 10px 0px;
                                        margin: 0px auto;
                                        color: #043049;
                                    "
                                    >
                                    Dark
                                    <span style="color: #00d957">Mountain</span>
                                    </h3>
                                    <br>
                                </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                <td>
                                    <span>Hello ${elem.first_name},</span>
                                </td>
                                </tr>
                                <tr>
                                <td>
                                    <p style="text-align: left">
                                    Your daily activities are listed below.
                                    </p>
                                </td>
                                </tr>
                                <!-- <tr>
                                <td>
                                    <br />
                                    <strong style="color: #00d957">${otp}</strong>
                                </td>
                                </tr>
                                <tr>
                                <td>
                                    <br />
                                    <h4>Subscription Details:</h4>
                                </td>
                                </tr>
                                <tr>
                                <td>
                                    <table border="1">
                                    <thead>
                                        <tr>
                                        <th style="text-align: left; padding: 5px;">Name</th>
                                        <th style="text-align: left; padding: 5px;">Plan Type</th>
                                        <th style="text-align: right; padding: 5px;">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                        <td style="text-align: left; padding: 5px;">${req.body.name}</td>
                                        <td style="text-align: left; padding: 5px;">${req.body.type}</td>
                                        <td style="text-align: right; padding: 5px;">$${req.body.price}</td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </td>
                                </tr> -->
                                <tr>
                                <td>
                                    <br>
                                    <p>Thank you</p>
                                </td>
                                </tr>
                                <tr>
                                <td>
                                    <br />
                                    <em style="margin-top: 15px"
                                    >This is an automated message, please do not reply.</em
                                    >
                                </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                <td>
                                    <br>
                                    <div style="text-align: start">© Dark Mountain</div>
                                </td>
                                </tr>
                            </tfoot>
                            </table>
                        </body>
                        </html>
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

            // }
        })
    } catch (e) {
        console.log(e)
    }
}

exports.sendRenewalEmail = async () => {
    try {
        const date = new Date()
        console.log(date, new Date(date.getTime() + 60 * 60 * 24 * 1000 * 10))
        let data = {
            'role': 'dentist',
            'subscription_details.status': true,
            'subscription_details.end_date': {'$lte': new Date(date.getTime() + 60 * 60 * 24 * 1000 * 10)}
        }
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
        const renewalUserList = await User.find(data);
        console.log(renewalUserList, "RENEWAL RUNNING")
        renewalUserList.forEach((elem) => {
            const mailOptions = {
                from: '"Dark Mountain" <config.MAIL_USERNAME>',
                to: elem.email,
                subject: `Dark Mountain - Subscription Pending - ${date}`,
                html: `
                <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8" />
                        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <style>
                        * {
                            padding: 0%;
                            margin: 0%;
                            box-sizing: border-box;
                        }
                        </style>
                        <title>Dark Mountain - Email</title>
                    </head>
                    <body style="width: 100%">
                        <table
                        style="
                            margin: 0% auto;
                            background-color: #f0f0f0;
                            padding: 15px 25px 20px 15px;
                        "
                        >
                        <thead>
                            <tr>
                            <th>
                                <h3
                                style="
                                    font-size: 1.5rem !important;
                                    font-weight: 700 !important;
                                    text-align: center;
                                    padding: 10px 0px;
                                    margin: 0px auto;
                                    color: #043049;
                                "
                                >
                                Dark
                                <span style="color: #00d957">Mountain</span>
                                </h3>
                                <br>
                            </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                            <td>
                                <span>Hello ${elem.first_name},</span>
                            </td>
                            </tr>
                            <tr>
                            <td>
                                <p style="text-align: left">
                                Your subscription is about to end, please renew the current plan or login to Dark Mountain to explore new plans.
                                </p>
                            </td>
                            </tr>
                            <!-- <tr>
                            <td>
                                <br />
                                <strong style="color: #00d957">${otp}</strong>
                            </td>
                            </tr> -->
                            <tr>
                            <td>
                                <br />
                                <h4>Previous Subscription Details:</h4>
                            </td>
                            </tr>
                            <tr>
                            <td>
                                <table border="1">
                                <thead>
                                    <tr>
                                    <th style="text-align: left; padding: 5px;">Name</th>
                                    <th style="text-align: left; padding: 5px;">Plan Type</th>
                                    <th style="text-align: right; padding: 5px;">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                    <td style="text-align: left; padding: 5px;">${req.body.name}</td>
                                    <td style="text-align: left; padding: 5px;">${req.body.type}</td>
                                    <td style="text-align: right; padding: 5px;">$${req.body.price}</td>
                                    </tr>
                                </tbody>
                                </table>
                            </td>
                            </tr>
                            <tr>
                            <td>
                                <br>
                                <p>Thank you</p>
                            </td>
                            </tr>
                            <tr>
                            <td>
                                <br />
                                <em style="margin-top: 15px"
                                >This is an automated message, please do not reply.</em
                                >
                            </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                            <td>
                                <br>
                                <div style="text-align: start">© Dark Mountain</div>
                            </td>
                            </tr>
                        </tfoot>
                        </table>
                    </body>
                    </html>
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
        })
    } catch (e) {
        console.log(e)
    }
}