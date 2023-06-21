const moment = require('moment');
const moments = require('moment-timezone');
const nodemailer = require("nodemailer");
const config = require("../config/config");
const messages = require("../config/messages");
const User = require("../models/user");
const fetch = require("node-fetch");


exports.sendDailyReminder = async () => {
    try {
        console.log("SEND DAILY REMINDER 001")

        // const email = "anas31197@gmail.com"

        const userListDentist = await User.find({ role: 'dentist' })

        console.log(userListDentist)

        if(userListDentist.length == 0){
            return res.send({
                success: false,
                message: messages.ERROR
            })
        }

        // let transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         type: 'OAuth2',
        //         user: config.MAIL_USERNAME,
        //         pass: config.MAIL_PASSWORD,
        //         clientId: config.OAUTH_CLIENTID,
        //         clientSecret: config.OAUTH_CLIENT_SECRET,
        //         refreshToken: config.OAUTH_REFRESH_TOKEN
        //     }
        // });

        let transporter = nodemailer.createTransport({
            host: "smtp.dynu.com",
            port: 587,
            // secure: true, // upgrade later with STARTTLS
            auth: {
                user: "info@hilextech.com",
                pass: "B7QT2lJY2l0xAnB",
            },
        })

        let date = new Date().toLocaleString();
        console.log(date);

        userListDentist.forEach((elem) => {
            const mailOptions = {
                from: '"Dark Mountain" <info@hilextech.com>',
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
                        <tr>
                        <td>
                            <br />
                            <strong style="color: #00d957">Activities</strong>
                        </td>
                        </tr>
                        <tr>
                            <td>
                                <table>
                                    <tbody>
                                    <tr>
                                        <td style="text-align: left; padding: 5px">Activity1:</td>
                                        <td style="text-align: left; padding: 5px">
                                        --
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: left; padding: 5px">Activity2:</td>
                                        <td style="text-align: left; padding: 5px">
                                        --
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: left; padding: 5px">Activity3:</td>
                                        <td style="text-align: left; padding: 5px">
                                        --
                                        </td>
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
                    console.log(info, 'Email Send Successfully');
                    // res.send({ email:  })
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
        const pendingUserList = await User.find(data);
        console.log("!!!", pendingUserList, "!!!", new Date(date.getTime() + 60 * 60 * 24 * 1000))
        // let transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         type: 'OAuth2',
        //         user: config.MAIL_USERNAME,
        //         pass: config.MAIL_PASSWORD,
        //         clientId: config.OAUTH_CLIENTID,
        //         clientSecret: config.OAUTH_CLIENT_SECRET,
        //         refreshToken: config.OAUTH_REFRESH_TOKEN
        //     }
        // });

        let transporter = nodemailer.createTransport({
            host: "smtp.dynu.com",
            port: 587,
            // secure: true, // upgrade later with STARTTLS
            auth: {
                user: "info@hilextech.com",
                pass: "B7QT2lJY2l0xAnB",
            },
        })

        pendingUserList.map((elem) => {
            // if ((elem.created_at.getTime() + 60 * 60 * 24 * 1000) < date && (elem.created_at.getTime() + 60 * 60 * 36 * 1000) > date) {
                console.log(new Date(elem.created_at.getTime() + 60 * 60 * 24 * 1000), new Date(elem.created_at.getTime()), (elem.created_at.getTime() + 60 * 60 * 24 * 1000).toLocaleString().length, date.toLocaleString().length)

                const mailOptions = {
                    from: '"Dark Mountain" <info@hilextech.com>',
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
                                    You haven't subscribed yet, please buy visit - <website> to buy plans.
                                    </p>
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
                        console.log(info, "Email for subs payment reminder after 24 hours.");
                        // res.send({ email: email })
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
            'subscription_details.end_date': {'$lte': new Date(date.getTime() + 60 * 60 * 24 * 1000 * 10), '$gte': new Date(date.getTime() + 60 * 60 * 24 * 1000 * 8)}
        }
        // let transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         type: 'OAuth2',
        //         user: config.MAIL_USERNAME,
        //         pass: config.MAIL_PASSWORD,
        //         clientId: config.OAUTH_CLIENTID,
        //         clientSecret: config.OAUTH_CLIENT_SECRET,
        //         refreshToken: config.OAUTH_REFRESH_TOKEN
        //     }
        // });

        let transporter = nodemailer.createTransport({
            host: "smtp.dynu.com",
            port: 587,
            // secure: true, // upgrade later with STARTTLS
            auth: {
                user: "info@hilextech.com",
                pass: "B7QT2lJY2l0xAnB",
            },
        })

        const renewalUserList = await User.find(data);
        console.log(renewalUserList, "RENEWAL RUNNING")
        renewalUserList.forEach((elem) => {
            const mailOptions = {
                from: '"Dark Mountain" <info@hilextech.com>',
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
                            <tr>
                            <td>
                                <br />
                                <h4>Previous Subscription Details:</h4>
                            </td>
                            </tr>
                            <tr>
                            <td>
                            <table>
                                <tbody>
                                <tr>
                                    <td style="text-align: left; padding: 5px">Name:</td>
                                    <td style="text-align: left; padding: 5px">
                                    ${elem.subscription_details.name}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; padding: 5px">Plan Type:</td>
                                    <td style="text-align: left; padding: 5px">
                                    ${elem.subscription_details.type}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; padding: 5px">Price:</td>
                                    <td style="text-align: left; padding: 5px">
                                    ${elem.subscription_details.price}
                                    </td>
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
                    console.log(info, 'Email for renewal before 10 days.');
                    // res.send({ email: email })
                }
            })
        })
    } catch (e) {
        console.log(e)
    }
}

exports.paypalTransaction = async () => {
    try {
        const date = new Date()
        console.log(new Date(date.getTime()))
        let data = {
            'role': 'dentist',
            'subscription_details.end_date': {'$lte': new Date(date.getTime())}
        }

        const paypalTransList = await User.find(data);
        console.log(paypalTransList, "Paypal trans list")

        paypalTransList.forEach(async (elem) => {
            console.log(elem, elem._id, elem?.paypal_ID, 'users for paypal')
            let headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${config.PAY_CLIENT_ID}:${config.PAY_CLIENT_SECRET_KEY}`)
            }
            if(elem?.paypal_ID && elem?.all_subscription_details[0]?.type == "Monthly"){
                // ! monthly
                await fetch(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${elem?.paypal_ID}/transactions?start_time=2018-01-21T07:50:20.940Z&end_time=2023-10-21T07:50:20.940Z`, {
                    method: 'GET',
                    headers: headers,
                }).then((res) => {
                    // console.log('res', res)
                    return res.json()
                }).then(async (json) => {
                    console.log('json: ', json, json?.transactions[0]?.time, new Date(json?.transactions[0]?.time).getTime())
                    if(new Date(json?.transactions[0]?.time).getTime() > new Date(date.getTime() - 60 * 60 * 24 * 1000).getTime()){
                        let new_date = new Date(json?.transactions[0]?.time)
                        let end_date = new Date(new_date.setMonth(new_date.getMonth()+1))
                        // let end_date = new Date(new Date(json?.transactions[0]?.time).getTime() + 60 * 60 * 24 * 1000)
                        console.log('correct', new Date(json?.transactions[0]?.time).getTime(), new Date(date.getTime() - 60 * 60 * 24 * 1000).getTime(), end_date)
                        let addOrder = {
                            subscription_id: elem?.subscription_details?._id,
                            end_date: end_date,
                            start_date: json?.transactions[0]?.time,
                            status: true,
                            name: elem?.subscription_details?.name,
                            price: elem?.subscription_details?.price,
                            country: elem?.subscription_details?.country,
                            type: elem?.subscription_details?.type,
                        }
                        let updateUser = await User.findOneAndUpdate({
                            _id: elem._id
                        }, {
                            $set: {
                                'subscription_details.end_date': end_date,
                                'subscription_details.start_date': json?.transactions[0].time,
                                'subscription_details.status': true,
                            },
                            $push: {
                                all_subscription_details: addOrder
                            },
                        });
                        if(!updateUser){
                            console.log("error")
                        }
                    } else {
                        console.log('incorrect')
                    }
                }).catch((err) => {
                    console.log("error: ", err)
                })
            } else if (elem?.paypal_ID && elem?.all_subscription_details[0]?.type == "Yearly"){
                // ! yearly
                await fetch(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${elem?.paypal_ID}/transactions?start_time=2018-01-21T07:50:20.940Z&end_time=2023-10-21T07:50:20.940Z`, {
                    method: 'GET',
                    headers: headers,
                }).then((res) => {
                    // console.log('res', res)
                    return res.json()
                }).then(async (json) => {
                    console.log('json: ', json, json?.transactions[0]?.time, new Date(json?.transactions[0]?.time).getTime())
                    if(new Date(json?.transactions[0]?.time).getTime() > new Date(date.getTime() - 60 * 60 * 24 * 1000).getTime()){
                        let new_date = new Date(json?.transactions[0]?.time)
                        let end_date = new Date(new_date.setFullYear(new_date.getFullYear()+1))
                        // let end_date = new Date(new Date(json?.transactions[0]?.time).getTime() + 60 * 60 * 24 * 1000 * 12)
                        console.log('correct', new Date(json?.transactions[0]?.time).getTime(), new Date(date.getTime() - 60 * 60 * 24 * 1000).getTime(), end_date)
                        let addOrder = {
                            subscription_id: elem?.subscription_details?._id,
                            end_date: end_date,
                            start_date: json?.transactions[0]?.time,
                            status: true,
                            name: elem?.subscription_details?.name,
                            price: elem?.subscription_details?.price,
                            country: elem?.subscription_details?.country,
                            type: elem?.subscription_details?.type,
                        }
                        let updateUser = await User.findOneAndUpdate({
                            _id: elem._id
                        }, {
                            $set: {
                                'subscription_details.end_date': end_date,
                                'subscription_details.start_date': json?.transactions[0].time,
                                'subscription_details.status': true,
                            },
                            $push: {
                                all_subscription_details: addOrder
                            },
                        });
                        if(!updateUser){
                            console.log("error")
                        }
                    } else {
                        console.log('incorrect')
                    }
                }).catch((err) => {
                    console.log("error: ", err)
                })
            }
        })
        
    } catch (e){
        console.log(e)
    }
}