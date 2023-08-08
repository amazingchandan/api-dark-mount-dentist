//const pdf = require('html-pdf');
const { google } = require('googleapis');
const path = require("path");
const fs = require("fs");
const messages = require("../config/messages");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const cron = require("node-cron");
const { NORECORD } = require("../config/messages");
const User = require("../models/user");
const subscription = require("../models/subscription");
const Xray = require("../models/xray")
const Evaluation = require('../models/evaluation')
const jwt = require('jsonwebtoken');
//localstorage for token
const LocalStorage = require('node-localstorage').LocalStorage;
const paypal = require('paypal-rest-sdk');
// ! countries modal
const Countries = require("../models/countries")
const nodemailer = require("nodemailer");


if (typeof localStorage === "undefined" || localStorage === null) {
    localStorage = new LocalStorage('./scratch');
}

exports.loginUser = async (req, res) => {
    if (!req.body.email || req.body.email.trim() == "") {
        return res.send({
            success: false,
            message: messages.EMAIL
        });
    }
    var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    var REGEX = /^[a-zA-Z0-9_]*$/;
    if (!regex.test(req.body.email)) {
        return res.send({
            success: false,
            message: messages.INVALID_EMAIL
        });
    }
    if (!req.body.password || req.body.password.trim() == "") {
        return res.send({
            success: false,
            message: messages.PASSWORD
        });
    }
    if (req.body.password.length < 6) {
        return res.send({
            success: false,
            message: messages.INVALID_PASSWORD
        });
    }

    try {
        let user = await User.findOne({
            email: req.body.email
        });

        if (!user) {
            return res.send({
                success: false,
                message: messages.NOT_REGISTERED
            });
        }
        if (user.status == false) {
            return res.send({
                success: false,
                message: "User inactive kindly contact your super admin."
            })
        }
        //console.log("user information : ", user);
        //console.log("user status : ", user.status);
        var userInfo = {};
        let result = bcrypt.compareSync(req.body.password, user.password);
        if (!result) {
            return res.send({
                success: false,
                message: messages.INVALID_PASSWORD
            });
        }
        if (result == true) {
            req.body.email = req.body.email.toLowerCase();
            var token;
            if (user.role == 'admin') {
                token = jwt.sign({
                    email: req.body.email,
                    role: user.role
                }, config.admin_jwt_secret, {
                    expiresIn: '365d'
                });
            }
            else {
                token = jwt.sign({
                    email: req.body.email,
                    role: user.role
                }, config.user_jwt_secret, {
                    expiresIn: '365d'
                });
            }
            // localStorage.setItem('myToken', token);
            let date = new Date();
            console.log(user, new Date(user?.subscription_details?.end_date));
            if (new Date(user?.subscription_details?.end_date).getTime() > new Date(date).getTime()) {
                console.log(user.subscription_details.status, new Date(user?.subscription_details?.end_date), "WORKED");
                user.subscription_details.status = true;
            }
            userInfo = {
                id: user._id,
                // email: user.email,
                //first_name: user.first_name,
                //last_name: user.last_name,
                token: token,
                role: user.role,
                subscribed: user.subscription_details.status,

            }
            // console.log(user.subscription_details.status)
            // console.log(userInfo)
            // localStorage.setItem('userInfomation', JSON.stringify(userInfo));
        }
        return res.send({
            success: true,
            message: messages.LOGIN_SUCCESSFULL,
            userInfo: userInfo
        })
    } catch (error) {
        console.log("Error in post Login", error);
        return res.send({
            success: false,
            message: messages.ERROR
        });
    }
};

exports.setAdminUser = async (req, res) => {
    // console.log("user bodyyyyyyyyyyyy : ", req.body)
    const ALPHA_NUMERIC_REGEX = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=\S+$).{7,20}$/;
    var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    var REGEX = /^[a-zA-Z0-9_]*$/;
    let emailCheck = await User.findOne({
        'email': req.body.email
    });
    if (emailCheck != null) {
        return res.send({
            success: false,
            message: messages.ALREADY_EMAIL_EXIST
        });
    }
    else if (!req.body.first_name || req.body.first_name.trim() == "") {
        return res.send({
            success: false,
            message: messages.FIRST_NAME
        });
    }
    else if (!req.body.last_name || req.body.last_name.trim() == "") {
        return res.send({
            success: false,
            message: messages.LAST_NAME
        });
    }
    else if (!req.body.email || req.body.email.trim() == "") {
        return res.send({
            success: false,
            message: messages.EMAIL
        });
    }
    else if (!regex.test(req.body.email)) {
        return res.send({
            success: false,
            message: messages.INVALID_EMAIL
        });
    }
    // else if (!req.body.contact_number || req.body.contact_number == "") {
    //     return res.send({
    //         success: false,
    //         message: messages.MOBILE
    //     });
    // }
    // else if (!req.body.address1 || req.body.address1.trim() == "") {
    //     return res.send({
    //         success: false,
    //         message: messages.ADDRESS1
    //     });
    // }
    // if (req.body.contact_number.length != 10) {
    //     return res.send({
    //         success: false,
    //         message: "Mobile number should be of 10 digit."
    //     });
    // }
    // else if (!req.body.pincode || req.body.pincode == '') {
    //     return res.send({
    //         success: false,
    //         message: messages.PINCODE
    //     });
    // }
    // else if (!req.body.city || req.body.city.trim() == '') {
    //     return res.send({
    //         success: false,
    //         message: messages.CITY
    //     });
    // }
    // else if (!req.body.state || req.body.state.trim() == '') {
    //     return res.send({
    //         success: false,
    //         message: messages.STATE
    //     });
    // }
    // else if (!req.body.country || req.body.country == '') {
    //     return res.send({
    //         success: false,
    //         message: messages.COUNTRY
    //     });
    // }
    else if (!req.body.password || req.body.password.trim() == "") {
        return res.send({
            success: false,
            message: messages.PASSWORD
        });
    }
    /*  if (!REGEX.test(req.body.password)) {
          return res.send({
              success: false,
              message: messages.PASSWORD
          });
      }*/
    else if (req.body.password.length < 7) {
        return res.send({
            success: false,
            message: messages.PASSWORD_7DIGIT
        });
    }
    else if (!ALPHA_NUMERIC_REGEX.test(req.body.password)) {
        return res.send({
            success: false,
            message: messages.ALPHA_NUMERIC_PASSWORD
        });
    }
    else if (!req.body.repassword || req.body.repassword.trim() == "") {
        return res.send({
            success: false,
            message: messages.CONFIRM_PASSWORD
        });
    }
    else if (req.body.password.trim() !== req.body.repassword.trim()) {
        return res.send({
            success: false,
            message: messages.MISS_MATCH_PASSWORD
        });
    }
    // if (req.body.repassword.length < 7) {
    //     return res.send({
    //         success: false,
    //         message: messages.REPASSWORD_7DIGIT
    //     });
    // }

    // if (!req.body.role || req.body.role == "") {
    //      return res.send({
    //          success: false,
    //          message: messages.ROLE
    //      });

    //  }
    else {
        try {
            req.body.password = bcrypt.hashSync(req.body.password, 10);
            // req.body.email = req.body.email.toLowerCase();
            userDataSave = {
                first_name: req.body.first_name.trim(),
                last_name: req.body.last_name.trim(),

                email: req.body.email.trim().toLowerCase(),
                role: "dentist",
                password: req.body.password.trim(),
                // contact_number: req.body.contact_number,
                // status: req.body.status,
                // address1: req.body.address1.trim(),
                // address2: req.body.address2,
                // city: req.body.city.trim(),
                // state: req.body.state.trim(),
                // country: req.body.country,
                // pincode: req.body.pincode,
            }
            let userData = new User(userDataSave).save();
            if (!userData) {
                return res.send({
                    success: false,
                    message: messages.ERROR_REGISTRATION
                });
            }
            return res.send({
                success: true,
                message: messages.REGISTERED
            });
        }

        catch (error) {
            console.log("Error in state", error);
            return res.send({
                success: true,
                message: messages.ERROR
            });
        }
    };
}

exports.getLogin = (req, res) => {
    try {
        user.findOne({ _id: req.params.id }).exec((err, data) => {
            if (err) {
                return res.status(500).send({ error: "Internal server error!" })
            }
            res.status(200).send({ data: data })
        })
    } catch (e) {
        console.warn(e);
    }
}


exports.getUserRecordList = async (req, res) => {
    console.log('GET USERS LIST')
    try {

        var page = 1;
        limit = 10;
        const skip = (page - 1) * 10;
        /*  const getData1=await Xray.find({})
          .populate({ path: 'user_id', select:["first_name" ,'last_name','contact_number','city'],
              $match:{
                  user_id:user_id,
                  count:{
                      $sum:1
                  }
              }
      
      });
      */
        let xrayCount = await Xray.aggregate([

            {
                $group:
                {
                    _id: "$user_id",
                    count: { $sum: 1 }
                }
            }
        ],
        )
        // console.log("---", xrayCount, "--")


        /*  console.log(getData1)
          var getData2;
          const getData1 = await User.find({}).select("_id")
          for(let i=0;i<getData1.length;i++){
              getData2= await Xray.countDocuments({"user_id":getData1[i]._id});
          }
          console.log(getData2,'++**++',getData1)*/

        // const getData = await Tour.find({}).skip(skip).limit(limit).select("destination");
        let getData = await User.find({
            $or: [{
                role: "dentist",
                isActive: "true"
            }],
        }).sort({ _id: -1 });
        //console.log("getData:", getData)
        if (!getData) {
            return res.send({
                success: false,
                message: NORECORD
            });
        }
        return res.send({
            success: true,
            message: "User records for admin",
            getData: getData, xrayCount
        });
    } catch (error) {
        return res.send({
            success: false,
            message: messages.ERROR
        });
    }

}
exports.getUserRecordByID = async (req, res) => {
    console.log("GET USER ID")
    try {
        if (!req.query.dentist_id) {
            return res.send({
                success: false,
                message: "Please enter dentist Id"
            });
        }
        var getData = await User.find({
            _id: req.query.dentist_id,
        });
        // console.log(getData, "******")
        if (!getData) {
            return res.send({
                success: false,
                message: messages.NORECORD
            });
        }
        return res.send({
            success: true,
            message: "Dentist list by Id",
            getData: getData,

        });
    }
    catch (error) {
        return res.send({
            success: false,
            message: messages.ERROR
        });
    }
}

exports.getUserXrayById = async (req, res) => {
    try {
        if (!req.query.dentist_id) {
            return res.send({
                success: false,
                message: "Please enter dentist Id"
            });
        }
        var getData = await Xray.find({
            user_id: req.query.dentist_id,
        }).limit(10).sort({ _id: 'DESC' });
        // console.log(getData, "******")
        if (!getData) {
            return res.send({
                success: false,
                message: messages.NORECORD
            });
        }
        return res.send({
            success: true,
            message: "Xray record by Id",
            getData: getData,

        });
    }
    catch (error) {
        return res.send({
            success: false,
            message: messages.ERROR
        });
    }
}


exports.getXrayList = async (req, res) => {
    try {
        /*  let getData1
          let getData = await Xray.find({
              $or: [{
  
                  isActive: "true"
              }],
          }).sort({ _id: -1 });
          console.log("getDataXray:", getData)
          for (let i = 0; i < getData.length; i++) {
           getData1 = await User.findById(getData[i]._id)
         
         let getData = await Xray.aggregate({ $lookup :{from: 'User',
         localField :'user_id',
         foreignFileld : '_id',
         as : "dentist",
        
      }}).find();*/
        let getData =
            await Xray.find({

                evaluation_status: "true"
            })
                .populate({ path: 'user_id' });
        /* let count1 = await Xray.countDocuments({user_id:"user_id"})
       console.log("++++",count1, "++++")*/
        /* count1 = await Xray.aggregate([
             { $sortByCount: '$user_id' }
         ])*/
        // console.log("++++ ++++", getData, "++//");
        if (!getData) {
            return res.send({
                success: false,
                message: NORECORD
            });
        }
        return res.send({
            success: true,
            message: "Xray records for Admin",
            getData: getData
        });
    } catch (error) {
        return res.send({
            success: false,
            message: messages.ERROR
        });
    }

}

exports.getUserAllSubListByID = async (req, res) => {
    try {
        if (!req.query.dentist_id) {
            return res.send({
                success: false,
                message: "Please enter dentist Id"
            });
        }
        let getData =
            await User.findById(req.query.dentist_id)
                .populate({ path: 'all_subscription_details.subscription_id', select: ["plan_name", 'amount', "type"] });

        // console.log("++", getData, "++")
        if (!getData) {
            return res.send({
                success: false,
                message: NORECORD
            });
        }
        return res.send({
            success: true,
            message: "user subscription record",
            getData: getData
        });
    } catch (error) {
        return res.send({
            success: false,
            message: error
        });
    }

}



exports.setPricingPlan = async (req, res) => {
    console.log(req.body)
    // return;
    if (!req.body.plan_name || req.body.plan_name.trim() == "") {
        return res.send({
            success: false,
            message: "Please enter plan name"
        });
    }
    if (!req.body.amount || req.body.amount == "") {
        return res.send({
            success: false,
            message: "Please enter pricing amount"
        });
    }
    try {
        let planCheck = await subscription.findOne({
            plan_name: req.body.plan_name.toLowerCase().trim(),
            type: req.body.type,
            country: req.body.country
        });
        if (planCheck != null) {
            return res.send({
                success: false,
                message: messages.PlanExist
            })
        }
        else {
            let pricingData = {
                plan_name: req.body.plan_name.toLowerCase().trim(),
                amount: req.body.amount,
                // minimum: req.body.minimum,
                // maximum: req.body.maximum,
                type: req.body.type,
                country: req.body.country,
                status: req.body.status,
                description: req.body.description,
                paypalID: req.body.paypalID,
                paypalID_free: req.body.paypalID_free
            }
            var setPlanData = await subscription(pricingData).save();
            // console.log(setPlanData)
            if (!setPlanData) {
                return res.send({
                    success: false,
                    message: "Error in save plan"
                });
            }
            return res.send({
                success: true,
                message: "Plan added successfully"
            })
        }

    }
    catch (error) {
        console.log(error)
        return res.send({
            success: false,
            message: messages.ERROR
        });
    }
}

exports.getPlanList = async (req, res) => {
    try {
        // $or: [{
        //     status: "active",
        // }],
        let getData = await subscription.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "subscription_details.subscription_id",
                    as: "count"
                }
            }
        ]).sort({ _id: -1 })
        if (!getData) {
            return res.send({
                success: false,
                message: "Error in getdata of subscription plan"
            })
        }
        let tryLookUp = await subscription.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "subscription_details.subscription_id",
                    as: "count"
                }
            },
            {
                $match: { status: "active" }
            }
        ]).sort({ _id: -1 })
        if (!tryLookUp) {
            return res.send({
                success: false,
                message: "Error in lookup of subscription plan"
            })
        }
        // console.log(tryLookUp, "LookUp")
        // let countList = []
        // let date = new Date();
        // getData.map( async (elem) => {
        //     // console.log(elem)
        //     let data = {
        //         'subscription_details.subscription_id': elem._id,
        //     }
        //     // let count = 0;
        //     let countUsers = await User.find(data)
        //     // countList.push(countUsers.length)
        //     // console.log(countUsers, "Count Users")
        //     // let agg = await User.aggregate([
        //     //     {
        //     //         $match: data
        //     //     },
        //     // ])
        //     // console.log(agg)
        //     // db.users.aggregate([
        //     //     {
        //     //       $lookup: {
        //     //         from: "subscriptions",
        //     //         localField: "_id",
        //     //         foreignField: "subscription_details.subscription_id",
        //     //         as: "counter"
        //     //       }
        //     //     }])
        //     countList.push(countUsers.length)
        // })

        // console.log(countList, "Count List")
        return res.send({
            success: true,
            message: 'Get data of subscription plan',
            getData: tryLookUp,
            getData1: getData
        })
    }
    catch (error) {
        console.log(error)
        return res.send({
            success: false,
            message: messages.ERROR
        })
    }

}
exports.getPlanListForPricing = async (req, res) => {
    try {
        // $or: [{
        //     status: "active",
        // }],
        let getData = await subscription.find({
            $or: [{
                status: "active",
            }],
        }).sort({ _id: -1 })
        if (!getData) {
            return res.send({
                success: false,
                message: "Error in getdata of subscription plan"
            })
        }
        console.log(getData)
        return res.send({
            success: true,
            message: 'Get data of subscription plan',
            getData: getData,
        })
    }
    catch (error) {
        return res.send({
            success: false,
            message: messages.ERROR
        })
    }

}
exports.getPlanById = async (req, res) => {
    try {
        if (!req.query.subscription_id) {
            // console.log("not found id ")
            return res.send({
                success: false,
                message: "Please enter plan Id"
            })
        }
        // console.log(req.query.subscription_id)
        var getData = await subscription.find({
            _id: req.query.subscription_id

        });
        // console.log(getData, "record")
        if (!getData) {
            return res.send({
                success: false,
                message: messages.NORECORD,
            })
        }
        return res.send({
            success: true,
            message: "Plan data by Id",
            getData: getData
        })
    }
    catch (error) {
        console.log(error)
        return res.send({
            success: false,
            message: messages.ERROR
        })
    }
}
exports.updatePlanById = async (req, res) => {
    // console.log(req.query.id)
    if (!req.query.id) {
        return res.send({
            success: false,
            message: "Please select Id"
        })
    }
    if (!req.body.plan_name || req.body.plan_name.trim() == "") {
        return res.send({
            success: false,
            message: "Please enter plan name"
        })
    }
    if (!req.body.amount || req.body.amount == "") {
        return res.send({
            success: false,
            message: "Please enter plan amount"
        })
    }
    // if (!req.body.minimum || req.body.minimum == "") {
    //     return res.send({
    //         success: false,
    //         message: "Please enter minimum value"
    //     })
    // }
    // if (!req.body.maximum || req.body.maximum == "") {
    //     return res.send({
    //         success: false,
    //         message: "Please enter maximum vlaue"
    //     })
    // }
    if (!req.body.type || req.body.type == "") {
        return res.send({
            success: false,
            message: "Please enter plan type"
        })
    }
    if (!req.body.country || req.body.country == "") {
        return res.send({
            success: false,
            message: "Please enter country"
        })
    }
    if (!req.body.description || req.body.description == "") {
        return res.send({
            success: false,
            message: "Please enter country"
        })
    }
    try {
        // let getData = await subscription.find({
        //     plan_name: req.body.plan_name.toLowerCase().trim()
        // })
        // console.log(getData.filter(e => e.plan_name === req.body.plan_name).length);
        // if(getData.filter(e => e.plan_name === req.body.plan_name).length){
        //     return res.send({
        //         success: false,
        //         message: messages.PlanExist
        //     })
        // }
        // console.log(getData, "??????");
        let planData = {
            plan_name: req.body.plan_name.toLowerCase().trim(),
            amount: req.body.amount,
            // minimum: req.body.minimum,
            // maximum: req.body.maximum,
            type: req.body.type,
            country: req.body.country,
            description: req.body.description,
            status: req.body.status

        }
        var updateData = await subscription.findByIdAndUpdate(req.query.id, planData);
        // console.log(req.query.id, "****")
        if (!updateData) {
            return res.send({
                success: false,
                message: messages.ERROR
            })
        }
        return res.send({
            success: true,
            message: "Plan updated successfully"
        })
    }
    catch (error) {
        console.log(error)
        return res.send({
            success: false,
            message: messages.ERROR
        })
    }
}
exports.updateUserById = async (req, res) => {
    if (!req.query.dentist_id) {
        return res.send({
            success: false,
            message: "Please select Id"
        })
    }
    if (!req.body.first_name || req.body.first_name.trim() == "") {
        return res.send({
            success: false,
            message: "Please enter first name"
        })
    }
    if (!req.body.last_name || req.body.last_name.trim() == "") {
        return res.send({
            success: false,
            message: "Please enter last name"
        })
    }
    if (!req.body.contact_number || req.body.contact_number == "") {
        return res.send({
            success: false,
            message: "Please enter contact number"
        })
    }
    /* if (!req.body.email || req.body.email == "") {
         return res.send({
             success: false,
             message: "Please enter Email"
         })
     }
     var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
     if (!regex.test(req.body.email)) {
         return res.send({
             success: false,
             message: "Please enter valid email address."
         });
     }*/
    if (!req.body.address1 || req.body.address1.trim() == "") {
        return res.send({
            success: false,
            message: "Please enter address"
        })
    }
    // if (!req.body.address2 || req.body.address2 == "") {
    //     return res.send({
    //         success: false,
    //         message: "Please enter Address2"
    //     })
    // }
    if (!req.body.city || req.body.city.trim() == "") {
        return res.send({
            success: false,
            message: "Please enter city"
        })
    }
    if (!req.body.state || req.body.state.trim() == "") {
        return res.send({
            success: false,
            message: "Please enter state"
        })
    }
    if (!req.body.country || req.body.country.trim() == "") {
        return res.send({
            success: false,
            message: "Please enter country"
        })
    }
    if (!req.body.pincode || req.body.pincode == "") {
        return res.send({
            success: false,
            message: "Please enter pincode"
        })
    }
    if (!req.body.license_no || req.body.license_no == "") {
        return res.send({
            success: false,
            message: "Please enter license no."
        })
    }
    try {
        let userData = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            contact_number: req.body.contact_number,
            address1: req.body.address1,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,

            pincode: req.body.pincode,

            license_no: req.body.license_no,

        }
        var updateData = await User.findByIdAndUpdate(req.query.dentist_id, userData);
        // console.log(req.query.dentist_id, "****")
        if (!updateData) {
            return res.send({
                success: false,
                message: messages.ERROR
            })
        }
        return res.send({
            success: true,
            message: "User profile updated successfully"
        })
    }
    catch (error) {
        console.log(error)
        return res.send({
            success: false,
            message: messages.ERROR
        })
    }
}

exports.cancelUserSub = async (req, res) => {
    if (!req.query.dentist_id) {
        return res.send({
            success: false,
            message: "Please select Id"
        })
    }
    try {
        var updateData = await User.findOneAndUpdate({
            _id: req.query.dentist_id
        },
            {
                $set: {
                    'subscription_details.status': false,
                }
            });
        // console.log("updatedata", updateData)
        if (!updateData) {
            return res.send({
                success: false,
                message: messages.ERROR
            })
        }
        let transporter = nodemailer.createTransport({
            host: config.SMTP_EMAIL_SERVICE,
            port: 587,
            // secure: true, // upgrade later with STARTTLS
            auth: {
                user: config.SMTP_EMAIL_ID,
                pass: config.SMTP_EMAIL_PWD,
            },
        })

        let date = new Date().toLocaleString();

        const mailOptions = {
            from: `"ARTI" <${config.SMTP_EMAIL_ID}>`,
            to: updateData.email,
            subject: `Dark Mountain - ${date}`,
            attachments: [{
                filename: 'arti-image.png',
                path: __dirname + config.MAIL_LOGO,
                cid: 'logo'
            }],
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
                        <div>
                        <img
                            src="cid:logo"
                            alt=""
                            style="width: 100px"
                        />
                        </div>
                        <br>
                    </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>
                        <b>Hi ${updateData.first_name},</b>
                    </td>
                    </tr>
                    <tr>
                    <td>
                        <p style="text-align: left">
                        You have successfully cancelled your subscription.
                        </p>
                    </td>
                    </tr>
                    <tr>
                    <td>
                        <br />
                        <strong style="color: #0024d9"><u>${updateData.email}</u></strong>
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
                    <table>
                        <tbody>
                        <tr>
                            <td style="text-align: left; padding: 5px">Name:</td>
                            <td style="text-align: left; padding: 5px">
                            ${updateData.subscription_details.name}
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align: left; padding: 5px">Plan Type:</td>
                            <td style="text-align: left; padding: 5px">
                            ${updateData.subscription_details.type}
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align: left; padding: 5px">Price:</td>
                            <td style="text-align: left; padding: 5px">
                            ${updateData.subscription_details.price}
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align: left; padding: 5px">Subscription Start Date:</td>
                            <td style="text-align: left; padding: 5px">
                            ${new Date(updateData.subscription_details.start_date).toLocaleString()}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    </td>
                    </tr>
                    <tr>
                    <td>
                        <br />
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
                res.send({ data: "Email Sent." })
            }
        })

        return res.send({
            success: true,
            message: "Subscription cancelled successfully",
            userData: updateData
        })
    }
    catch (error) {
        console.log(error)
        return res.send({
            success: false,
            message: messages.ERROR
        })
    }
}

exports.getSubscriptionDetail = async (req, res) => {
    try {
        // console.log("----", req.query.id, "------", req.body.sub_id)
        let date1 = new Date();
        var end_date;
        var now = new Date();
        sub_type = req.body.type;
        // console.log(sub_type)
        if (sub_type == "Monthly") {


            end_date = new Date(now.setMonth(now.getMonth() + 1));
            end_date = new Date(now.setMinutes(now.getMinutes()));
            // console.log(end_date, "Date", new Date());

        }
        else if (sub_type === "Yearly") {


            // end_date = new Date(now.setMonth(now.getMonth() + 12));
            end_date = new Date(date1.getTime() + 60 * 60 * 24 * 1000);

            // console.log(end_date, "Date", new Date());

        }


        let addOrder = {
            subscription_id: req.body.sub_id,
            end_date: end_date,
            start_date: Date.now(),
            status: true,
            name: req.body.name,
            price: req.body.price,
            country: req.body.country,
            type: req.body.type,
        }
        // return;
        var planData = await User.findOneAndUpdate({
            _id: req.query.id
        }, {
            $set: {
                'paypal_ID': req.body.paypal_ID,
                'subscription_details.subscription_id': req.body.sub_id,
                'subscription_details.end_date': end_date,
                'subscription_details.start_date': Date.now(),
                'subscription_details.status': true,
                'subscription_details.name': req.body.name,
                'subscription_details.price': req.body.price,
                'subscription_details.country': req.body.country,
                'subscription_details.type': req.body.type,

            },
            $push: {
                all_subscription_details: addOrder
            },
        })
        // let userAdded = await subscription.findByIdAndUpdate(req.body.sub_id, {
        //     $inc: {'userCount': 1}
        // })
        // console.log("plandata", planData.email)
        if (!planData) {
            return res.send({
                success: false,
                message: messages.ERROR
            })
        }
        // console.log(userAdded)
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
            host: config.SMTP_EMAIL_SERVICE,
            port: 587,
            // secure: true, // upgrade later with STARTTLS
            auth: {
                user: config.SMTP_EMAIL_ID,
                pass: config.SMTP_EMAIL_PWD,
            },
        })

        let date = new Date().toLocaleString();
        // console.log(date);

        const mailOptions = {
            from: `"ARTI" <${config.SMTP_EMAIL_ID}>`,
            to: planData.email,
            subject: `Thanks for Subscribing to ARTI.`,
            attachments: [{
                filename: 'arti-image.png',
                path: __dirname + config.MAIL_LOGO,
                cid: 'logo'
            }],
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
                    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                }
                </style>
                <title>ARTI</title>
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
                        <div>
                        <img
                            src="cid:logo"
                            alt=""
                            style="width: 100px"
                        />
                        </div>
                        <br />
                    </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>
                        <b>Welcome ${planData.first_name},</b>
                    </td>
                    </tr>
                    <tr>
                    <td>
                        <p style="text-align: left">
                        Thank You for Subscribing to ARTI.
                        </p>
                        <br />
                    </td>
                    </tr>
                    <tr>
                    <td>
                        <p style="text-align: left">
                        Your Account has been successfully created using the following email - 
                        </p>
                        <br />
                    </td>
                    </tr>
                    <tr>
                    <td>
                        <strong style="color: #0024d9"><u>${planData.email}</u></strong>
                    </td>
                    </tr>
                    <tr>
                    <td>
                        <br />
                        <h4><em>Subscription Details:</em></h4>
                    </td>
                    </tr>
                    <tr>
                    <td>
                        <table>
                        <tbody>
                            <tr>
                            <td style="text-align: left; padding: 5px">Name:</td>
                            <td style="text-align: left; padding: 5px">
                                ${req.body.name}
                            </td>
                            </tr>
                            <tr>
                            <td style="text-align: left; padding: 5px">Plan Type:</td>
                            <td style="text-align: left; padding: 5px">
                                ${req.body.type}
                            </td>
                            </tr>
                            <tr>
                            <td style="text-align: left; padding: 5px">Price:</td>
                            <td style="text-align: left; padding: 5px">
                                ${req.body.price}
                            </td>
                            </tr>
                            <tr>
                            <td style="text-align: left; padding: 5px">
                                Subscription Start Date:
                            </td>
                            <td style="text-align: left; padding: 5px">${new Date(Date.now()).toDateString()}</td>
                            </tr>
                            <tr>
                            <td style="text-align: left; padding: 5px">
                                Next Billing Date:
                            </td>
                            <td style="text-align: left; padding: 5px">${new Date(end_date).toDateString()}</td>
                            </tr>
                        </tbody>
                        </table>
                    </td>
                    </tr>
                    <tr>
                    <td>
                        <br />
                        <p>Thank you</p>
                    </td>
                    </tr>
                    <tr>
                    <td>
                        <b>Team ARTI</b>
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
                res.send({ data: "Email sent." })
            }
        })

        return res.send({
            success: true,
            message: "User profile updated successfully"
        })
    }
    catch (error) {
        console.log(error)
        return res.send({
            success: false,
            message: messages.ERROR
        })
    }
}
var newEnd_date
exports.getSubscriptionRenew = async (req, res) => {
    try {
        console.log("----", req.query.id, "------", req.body, req.body.pre_end_date)
        // return
        const date1 = new Date()
        let end_date;

        let now = new Date(req.body.pre_end_date);
        let new_start = new Date(req.body.pre_end_date);
        console.log(now)
        sub_type = req.body.type;
        // console.log(sub_type)
        if (sub_type == "Monthly") {
            addDays(req.body.pre_end_date, 30)
            var min1 = new Date().getMinutes();
            var h1 = new Date().getHours();
            //    this.newEnd_date = //new Date(newEnd_date.getFullYear(), newEnd_date.getMonth(), newEnd_date.getDate(), h1, min1, 0);
            //     moment(this.newEnd_date).set('hour',h1);
            // this.newEnd_date = newEnd_date.toISOString()


            end_date = new Date(now.setMonth(now.getMonth() + 1));
            end_date = new Date(now.setMinutes(now.getMinutes()));
            //   newEnd_date.setDate(req.body.pre_end_date.getDate() + 30)
            // console.log(this.newEnd_date, end_date, "Date", new Date());

        }
        else if (sub_type === "Yearly") {

            addDays(req.body.pre_end_date, 365)
            var min1 = new Date().getMinutes();
            var h1 = new Date().getHours();
            //     newEnd_date = //new Date(newEnd_date.getFullYear(), newEnd_date.getMonth(), newEnd_date.getDate(), h1, min1, 0);
            //    moment(this.newEnd_date).set('hour',h1);
            // this.newEnd_date = newEnd_date.toISOString()
            // end_date = new Date(now.setMonth(now.getMonth() + 12));
            end_date = new Date(now.getTime() + 60 * 60 * 24 * 1000);
            ;

            // console.log(end_date, "Date", new Date());

        }


        var addOrder = {
            subscription_id: req.body.sub_id,
            end_date: end_date,
            start_date: new Date(req.body.pre_end_date),
            status: true,
            name: req.body.pre_plan_name,
            price: req.body.pre_plan_price,
            country: req.body.pre_plan_country,
            type: req.body.type,
            // paypal_ID: req.body.paypal_ID
        }
        console.log(addOrder, "addOrder")
        // return
        var planData = await User.findOneAndUpdate({
            _id: req.query.id
        }, {
            $set: {
                'paypal_ID': req.body.paypal_ID,
                'subscription_details.status': true,
            },
            $push: {
                all_subscription_details: addOrder
            },
        })
        // console.log("plandata", planData)
        if (!planData) {
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
            host: config.SMTP_EMAIL_SERVICE,
            port: 587,
            // secure: true, // upgrade later with STARTTLS
            auth: {
                user: config.SMTP_EMAIL_ID,
                pass: config.SMTP_EMAIL_PWD,
            },
        })

        let date = new Date().toLocaleString();
        // console.log(date);

        const mailOptions = {
            from: `"ARTI" <${config.SMTP_EMAIL_ID}>`,
            to: planData.email,
            subject: `Your ARTI Account successfully upgraded/downgraded to ${req.body.pre_plan_name}.`,
            attachments: [{
                filename: 'arti-image.png',
                path: __dirname + config.MAIL_LOGO,
                cid: 'logo'
            }],
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
                    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                }
                </style>
                <title>ARTI</title>
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
                        <div>
                        <img src="cid:logo" alt="" style="width: 100px" />
                        </div>
                        <br />
                    </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>
                        <span>Hi ${planData.first_name},</span>
                    </td>
                    </tr>
                    <tr>
                    <td>
                        <br />
                        <p style="text-align: left">
                        Your ARTI Account has been successfully upgraded/downgraded to
                        ${req.body.pre_plan_name}.
                        </p>
                    </td>
                    </tr>
                    <tr>
                    <td>
                        <br />
                        <p style="text-align: left">
                        Please find here the details of your new subscription plan.
                        </p>
                    </td>
                    </tr>
                    <tr>
                    <td>
                        <br />
                        <h4>New Subscription Details:</h4>
                    </td>
                    </tr>
                    <tr>
                    <td>
                        <table>
                        <tbody>
                            <tr>
                            <td style="text-align: left; padding: 5px">Name:</td>
                            <td style="text-align: left; padding: 5px">
                                ${addOrder.name}
                            </td>
                            </tr>
                            <tr>
                            <td style="text-align: left; padding: 5px">Plan Type:</td>
                            <td style="text-align: left; padding: 5px">
                                ${addOrder.type}
                            </td>
                            </tr>
                            <tr>
                            <td style="text-align: left; padding: 5px">Price:</td>
                            <td style="text-align: left; padding: 5px">
                                ${addOrder.price}
                            </td>
                            </tr>
                            <tr>
                            <td style="text-align: left; padding: 5px">
                                Subscription Start Date:
                            </td>
                            <td style="text-align: left; padding: 5px">
                                ${addOrder.start_date}
                            </td>
                            </tr>
                            <tr>
                            <td style="text-align: left; padding: 5px">
                                Next Billing Date:
                            </td>
                            <td style="text-align: left; padding: 5px">
                                ${addOrder.end_date}
                            </td>
                            </tr>
                        </tbody>
                        </table>
                    </td>
                    </tr>
                    <tr>
                    <td>
                        <br />
                        <p>Thank you</p>
                    </td>
                    </tr>
                    <tr>
                    <td>
                        <b>Team ARTI</b>
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
                res.send({ data: token, otp: otp })
            }
        })

        return res.send({
            success: true,
            message: "User profile updated successfully"
        })
    }
    catch (error) {
        console.log(error)
        return res.send({
            success: false,
            message: messages.ERROR
        })
    }
}

addDays = ((date, days) => {
    var result = new Date(date);

    this.newEnd_date = result.setDate(result.getDate() + days);
    //  console.log(this.newEnd_date,"newEndDate")
})
exports.deletePlanById = async (req, res) => {

    // console.log(req.query.id)
    if (!req.query.id) {
        return res.send({
            success: false,
            message: "Please select id"
        })

    }

    try {
        var deletePlanData = await subscription.findOneAndUpdate({
            _id: req.query.id
        }, {
            $set: {
                status: "inactive",
            }
        });
        if (!deletePlanData) {
            return res.send({
                success: false,
                message: messages.NORECORD
            });
        }
        return res.send({
            success: true,
            message: "Plan deleted successfully"
        });

    }
    catch (error) {
        console.log(error)
        return res.send({
            success: false,
            message: messages.ERROR
        })
    }
}
exports.deleteUserById = async (req, res) => {

    // console.log(req.query.id)
    if (!req.query.id) {
        return res.send({
            success: false,
            message: "Please select id"
        })

    }

    try {
        var deletePlanData = await User.findOneAndUpdate({
            _id: req.query.id
        }, {
            $set: {
                isActive: false,
            }
        });
        if (!deletePlanData) {
            return res.send({
                success: false,
                message: messages.NORECORD
            });
        }
        return res.send({
            success: true,
            message: "User deleted successfully"
        });

    }
    catch (error) {
        console.log(error)
        return res.send({
            success: false,
            message: messages.ERROR
        })
    }
}

exports.deleteSubsById = async (req, res) => {
    // console.log(req.body.id)
    if (!req.body.id) {
        return res.send({
            success: false,
            message: "Please select id"
        })
    }
    try {
        // const deletedPlan = await subscription.deleteOne({_id: req.body.id})
        const deletedPlan = await subscription.findByIdAndUpdate(req.body.id, { status: "inactive" })
        console.log(deletedPlan)
        if (!deletedPlan) {
            return res.send({
                success: false,
                message: "Plan not deleted"
            });
        }
        return res.send({
            success: true,
            message: "Plan deleted successfully"
        });
    } catch (e) {
        console.log(e)
    }
}

exports.deletePlanByIDIfErr = async (req, res) => {
    if (!req.body.id) {
        return res.send({
            success: false,
            message: "Please select id"
        })
    }
    try {
        // const deletedPlan = await subscription.deleteOne({_id: req.body.id})
        const deletedPlan = await subscription.deleteOne({ _id: req.body.id })
        console.log(deletedPlan)
        if (!deletedPlan) {
            return res.send({
                success: false,
                message: "Plan not deleted"
            });
        }
        return res.send({
            success: true,
            message: "Plan deleted successfully because of error."
        });
    } catch (e) {
        console.log(e)
    }
}

exports.activeSubsById = async (req, res) => {
    console.log(req.body.id)
    if (!req.body.id) {
        return res.send({
            success: false,
            message: "Please select id"
        })
    }
    try {
        // const deletedPlan = await subscription.deleteOne({_id: req.body.id})
        const activePlan = await subscription.findByIdAndUpdate(req.body.id, { status: "active" })
        console.log(activePlan)
        if (!activePlan) {
            return res.send({
                success: false,
                message: "Plan not deleted"
            });
        }
        return res.send({
            success: true,
            message: "Plan deleted successfully"
        });
    } catch (e) {
        console.log(e)
    }
}

// ! undo this for previous cronjob code
// subscriptionEnd = async (req, res) => {
//     try {


//         d = new Date();
//         let curDate = d.toISOString().split('T')[0];

//         cron.schedule(" * * * * * ", async function () {
//             //console.log("cur-hour",h2,"cur-min",m2)
//             d = new Date();
//             h2 = d.getHours();
//             m2 = d.getMinutes();
//             //console.log("curhour", d.getHours())
//             console.log("cur date", d)



//             let getUserSubscription1 = await User.find({
//                 role: 'dentist',
//                 'subscription_details.status': true,
//                 'subscription_details.end_date': { $lte: d }
//             })
//             // console.log("------", getUserSubscription1, "-------");
//             for (let i = 0; i < getUserSubscription1.length; i++) {
//                 if(getUserSubscription1[i].all_subscription_details[getUserSubscription1[i].all_subscription_details.length - 1].end_date > d){
//                     console.log(getUserSubscription1[i].all_subscription_details[getUserSubscription1[i].all_subscription_details.length - 1]);
//                     let userUpdate = await User.updateMany({
//                         role: 'dentist',
//                         _id: getUserSubscription1[i]._id
//                     }, {
//                         $set: {
//                             'subscription_details.status': true,
//                             'subscription_details.name': getUserSubscription1[i].all_subscription_details[getUserSubscription1[i].all_subscription_details.length - 1].name,
//                             'subscription_details.price': getUserSubscription1[i].all_subscription_details[getUserSubscription1[i].all_subscription_details.length - 1].price,
//                             'subscription_details.country': getUserSubscription1[i].all_subscription_details[getUserSubscription1[i].all_subscription_details.length - 1].country,
//                             'subscription_details.start_date': getUserSubscription1[i].all_subscription_details[getUserSubscription1[i].all_subscription_details.length - 1].start_date,
//                             'subscription_details.end_date': getUserSubscription1[i].all_subscription_details[getUserSubscription1[i].all_subscription_details.length - 1].end_date,
//                         }
//                     })
//                 } else {
//                     let user1 = await User.updateMany({
//                         role: 'dentist',
//                         _id: getUserSubscription1[i]._id
//                     }, {
//                         $set: {
//                             'subscription_details.status': false,
//                         }
//                     });
//                 }
//                 // ! undo this
//                 // let user1 = await User.updateMany({
//                 //     role: 'dentist',
//                 //     _id: getUserSubscription1[i]._id
//                 // }, {
//                 //     $set: {
//                 //         'subscription_details.status': false,
//                 //     }
//                 // });
//                 // console.log(user1)
//             }  //console.log(user1)

//             let renewalSubs = await User.find({
//                 role: 'dentist',
//                 'subscription_details.status': false,
//                 'subscription_details.end_date': { $lte: d },
//                 'renewal_details.status': true,
//                 'renewal_details.start_date': {$lte: d}
//             })

//             // console.log(renewalSubs, "!!!")

//             renewalSubs.forEach((elem) => {
//                 // console.log(elem)
//             })


//         }


//         )
//         ///////code end/////

//     } catch (error) {
//         return res.send({
//             success: false,
//             message: messages.ERROR
//         });
//     }

// };
// subscriptionEnd();


(async function (req, res) {
    try {
        d = new Date();
        let curDate = d.toISOString().split('T')[0];
        cron.schedule(" * * * * * ", async function () {
            d = new Date();
            h2 = d.getHours();
            m2 = d.getMinutes();
            console.log("cur date", d)
            let getUserSubscription1 = await User.find({
                role: 'dentist',
                'subscription_details.status': true,
                'subscription_details.end_date': { $lte: d }
            })
            // console.log("------", getUserSubscription1, "-------");
            for (let i = 0; i < getUserSubscription1.length; i++) {
                if (getUserSubscription1[i].all_subscription_details[getUserSubscription1[i].all_subscription_details.length - 1].end_date > d) {
                    console.log(getUserSubscription1[i].all_subscription_details[getUserSubscription1[i].all_subscription_details.length - 1]);
                    let userUpdate = await User.updateMany({
                        role: 'dentist',
                        _id: getUserSubscription1[i]._id
                    }, {
                        $set: {
                            'subscription_details.status': true,
                            'subscription_details.name': getUserSubscription1[i].all_subscription_details[getUserSubscription1[i].all_subscription_details.length - 1].name,
                            'subscription_details.price': getUserSubscription1[i].all_subscription_details[getUserSubscription1[i].all_subscription_details.length - 1].price,
                            'subscription_details.country': getUserSubscription1[i].all_subscription_details[getUserSubscription1[i].all_subscription_details.length - 1].country,
                            'subscription_details.start_date': getUserSubscription1[i].all_subscription_details[getUserSubscription1[i].all_subscription_details.length - 1].start_date,
                            'subscription_details.end_date': getUserSubscription1[i].all_subscription_details[getUserSubscription1[i].all_subscription_details.length - 1].end_date,
                        }
                    })
                } else {
                    let user1 = await User.updateMany({
                        role: 'dentist',
                        _id: getUserSubscription1[i]._id
                    }, {
                        $set: {
                            'subscription_details.status': false,
                        }
                    });
                }
            }  //console.log(user1)
        })
    } catch (error) {
        return res.send({
            success: false,
            message: messages.ERROR
        });
    }
})()

exports.uploadXray = async (req, res) => {
    // console.log("REQBODY", req.body, "REQBODY")
    try {
        var ImageArr = [];
        // console.log("----", req.files)
        if (req.files != undefined) {
            if (req.files.xray_image != undefined) {
                req.files.xray_image.forEach(element => {
                    ImageArr.push({
                        path: 'uploads/' + element.filename,
                        // path: 'uploads/' + element.originalname,
                        mimetype: element.mimetype,
                    })
                });
                req.body.xray_image = ImageArr;

            }

        }
        // console.log(req.body)
        // return
        var xrayData = {
            "xray_image.path": req.body.xray_image[0]?.path,
            "xray_image.mimetype": req.body.xray_image[0]?.mimetype,
            user_id: req.body.user_id,
            "created_at": Date.now(),
        }
        // console.log(xrayData,);

        // upload(req,res,function(err){
        //     if(err){
        //         return res.status(500).send({error: "Internal server error!"})
        //     }
        //     res.status(200).send({message: "Uploaded successfully!"})
        // })

        var setXrayData = await Xray(xrayData).save();
        // console.log("****", setXrayData, "****")

        var data = await User.findByIdAndUpdate(req.body.user_id, {

            $inc: { 'noOfXrayUploaded': 1 }
        })
        // findByIdAndUpdate(id, { noOfXrayUploaded: { $inc: 1 } })
        // console.log(data, "**---**")
        if (!setXrayData) {
            return res.send({
                success: false,
                message: "Error in X-ray upload"
            });
        }
        return res.send({
            success: true,
            message: "X-ray uploaded successfully",
            getData: setXrayData
        })
    }
    catch (error) {
        return res.send({
            success: false,
            message: messages.ERROR
        });
    }
}
exports.deleteXray = async (req, res) => {
    try {
        // console.log(req.params, req.body)
        if (!req.params.id) {
            return res.send({
                success: false,
                message: "Please enter xray Id"
            })
        }

        const fileName = req.body.name
        const directoryPath = `public / uploads / ${req.body.name} `
        // console.log(directoryPath, fileName)
        fs.unlink(directoryPath, async (err) => {
            if (err) {
                return res.send({
                    success: false,
                    message: err
                })
            }
            const delXray = await Xray.deleteOne({ _id: req.params.id })
            if (!delXray) {
                return res.send({
                    success: false,
                    message: messages.NORECORD
                })
            }
            // console.log(delXray, "DELETED")
            return res.send({
                success: true,
                message: `file deleted: ${delXray.deletedCount} `
            })
        })
        // return        
        // const delXray = await Xray.deleteOne({_id: req.params.id})
        // if(!delXray){
        //     return res.send({
        //         success: false,
        //         message: messages.NORECORD
        //     })
        // }
        // return res.send({
        //     success: true,
        //     message: delXray,
        // })
    } catch (e) {
        console.log(e)
    }
}
exports.getXrayById = async (req, res) => {
    try {
        if (!req.query.xray_id) {
            console.log("not found id ")
            return res.send({
                success: false,
                message: "Please enter xray Id"
            })
        }
        console.log(req.query.xray_id)
        var getData = await Xray.find({
            _id: req.query.xray_id

        });
        //console.log(getData, "record")
        if (!getData) {
            return res.send({
                success: false,
                message: messages.NORECORD,
            })
        }
        return res.send({
            success: true,
            message: "Xray data by Id",
            getData: getData
        })
    }
    catch (error) {
        console.log(error, "++++++")
        return res.send({
            success: false,
            message: messages.ERROR
        })
    }
}
exports.setEvaluatedData = async (req, res) => {

    try {
        console.log(req.body.marker)
        let evaluatedData = {



        }
        let xrayData = {
            updated_at: Date.now(),
            evaluation_status: true,
            totalCavitiesDetectedByUser: req.body.total_cavities

        }
        var setEvalData = await Evaluation.findOneAndUpdate({
            xray_id: req.body.xray_id,
        }, {
            $set: {
                evaluated_by: req.body.user_id,

                dentist_correction: req.body.marker,

                evaluated_on: Date.now(),
                evaluation_status: true
            }
        }
        );
        var updateXrayData = await Xray.findByIdAndUpdate(req.body.xray_id, xrayData)

        var data = await User.findByIdAndUpdate(req.body.user_id, {

            $inc: { 'noOfXrayEvaluated': 1 }
        })
        console.log(setEvalData)
        if (!setEvalData) {
            return res.send({
                success: false,
                message: "Error in save plan"
            });
        }
        return res.send({
            success: true,
            message: "Data added successfully"
        })
    }


    catch (error) {
        console.log(error)
        return res.send({
            success: false,
            message: messages.ERROR
        });
    }
}

// ! AI data is being saved here
exports.setEvaluatedDataFromAdmin = async (req, res, next) => {

    try {
        console.log(req.body, "body")
        // return;
        let getValues = await Evaluation.find({
            xray_id: req.body.xray_id
        })

        let userInfo = await User.find({
            _id: getValues[0].evaluated_by
        })

        let getUserValues = await Evaluation.find({
            evaluated_by: getValues[0].evaluated_by
        })

        let newUserValue = getUserValues.filter((elem) => (elem.final_dentist_count && elem.total_dentist_count) || (elem.final_dentist_count != 0 && elem.total_dentist_count != 0));

        // return;

        let AI_count = getValues[0].ai_identified_cavities.rectangle_coordinates.length

        console.log(AI_count, "All AI Values")

        let dentist_count = getValues[0]?.dentist_correction.filter((elem) => elem.value.rectanglelabels[0] == "Make Corrections")

        let final_AI = req.body.marker.filter((elem) => elem.value.rectanglelabels[0] != "Make Corrections" && elem.value.rectanglelabels[0] != "Admin Correction")

        let final_dentist = req.body.marker.filter((elem) => elem.value.rectanglelabels[0] == "Make Corrections")

        let super_admin = req.body.marker.filter((elem) => elem.value.rectanglelabels[0] == "Admin Correction")

        console.log(getValues[0]?.dentist_correction?.length, dentist_count.length, "All Dentist Values")

        console.log(final_AI.length, "FInal AI")

        console.log(final_dentist.length, "FInal dentist")

        console.log(super_admin.length, "Super Admin")

        let evaluatedData = {
            xray_id: req.body.xray_id,
            evaluated_by: req.body.user_id,
            admin_correction: req.body.marker,
            admin_correction_percentage: req.body.accuracy_per
        }
        console.log(req.body.marker, "Marker")
        // return;
        var setEvalData = await Evaluation.findOneAndUpdate({
            xray_id: req.body.xray_id
        }, {
            $set: {
                "admin_correction": req.body.marker,
                "accurate_val": req.body.accurate_val,
                "total_AI_count": AI_count,
                "final_AI_count": final_AI.length,
                "final_dentist_count": final_dentist.length,
                "total_dentist_count": dentist_count.length,
                "admin_count": super_admin.length
            }
        }
        )
        var setEvalData1 = await Xray.findOneAndUpdate({
            _id: req.body.xray_id
        }, {
            $set: {
                accurateCavitiesPerByUser: req.body.accuracy_per,
                admin_marked_status: true,
            }
        }
        )

        // ! google drive

        const oauth2Client = new google.auth.OAuth2(
            // config.OAUTH_CLIENTID,
            // config.OAUTH_CLIENT_SECRET,
            config.DRIVE_CLIENT_ID,
            config.DRIVE_CLIENT_SECRET,
            config.DRIVE_REDIRECT_URI,
        );

        oauth2Client.setCredentials({ refresh_token: config.DRIVE_REFRESH_TOKEN });
        // oauth2Client.setCredentials({ refresh_token: config.MY_REFRESH_TOKEN });

        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client,
        });
        const file = setEvalData1.xray_image.path.split('/')[1];
        const filePath = `public/${setEvalData1.xray_image.path}`
        const stringifyData = JSON.stringify(setEvalData)
        const filePathJSON = path.join(__dirname, `../public/files/${file.split('.')[0]}.txt`)
        console.log("!!!!!!!!!!", filePath, file, filePathJSON, "!!!!!!!!!!")
        try {
            let d = new Date().toISOString().split('T')[0];
            const writeFile = fs.writeFile(`${filePathJSON}`, stringifyData, 'utf-8', (err) => {
                if (err) {
                    console.log("BIG ERROR!")
                }
                createFolder();
                console.log("DONE BY MISTAKE", d)
            });
            async function createFolder() {
                try {
                    const folderList = await drive.files.list({
                        q: `mimeType='application/vnd.google-apps.folder' and name='${d}'`,
                        fields: 'files(id, name)',
                        // spaces: drive
                    })
                    console.log(folderList, folderList?.data?.files[0]?.id, "ALREADY EXISTS")
                    if (folderList?.data?.files[0]?.id) {
                        const response = await drive.files.create({
                            requestBody: {
                                name: `${file}`,
                                mimeType: 'image/jpg',
                                parents: [folderList?.data?.files[0]?.id]
                            },
                            media: {
                                mimeType: 'image/jpg',
                                body: fs.createReadStream(`${filePath}`),
                            },
                        });
                        const responseJSON = await drive.files.create({
                            requestBody: {
                                name: `${file.split('.')[0]}.txt`,
                                mimeType: 'text/plain',
                                parents: [folderList?.data?.files[0]?.id]
                            },
                            media: {
                                mimeType: 'text/plain',
                                body: fs.createReadStream(`${filePathJSON}`),
                            },
                        });
                        console.log(response.data, responseJSON.data, "INSERTED IN EXISTING FOLDER");
                    } else {
                        const folder = await drive.files.create({
                            resource: {
                                name: `${d}`,
                                mimeType: 'application/vnd.google-apps.folder',
                                parents: ['1neBn9NzTPd8s-LqaF3Yg96NhMZBtnecB'] // 1neBn9NzTPd8s-LqaF3Yg96NhMZBtnecB // 16kT2ydOtThQp7XpcVTrQobvVg12F9aS5
                            },
                            fields: 'id',
                        })
                        console.log(folder.data.id, "THIS IS FOLDER ID")
                        if (folder.data.id) {
                            const response = await drive.files.create({
                                // resource: {
                                //     name : 'content-folder',
                                //     mimeType : 'application/vnd.google-apps.folder',
                                //     parents: ['16kT2ydOtThQp7XpcVTrQobvVg12F9aS5']
                                // },
                                requestBody: {
                                    name: `${file}`, //This can be name of your choice
                                    mimeType: 'image/jpg',
                                    parents: [folder.data.id]
                                },
                                media: {
                                    mimeType: 'image/jpg',
                                    body: fs.createReadStream(`${filePath}`),
                                },
                            });
                            // JSON file save
                            const responseJSON = await drive.files.create({
                                // resource: {
                                //     name : 'content-folder',
                                //     mimeType : 'application/vnd.google-apps.folder',
                                //     parents: ['16kT2ydOtThQp7XpcVTrQobvVg12F9aS5']
                                // },
                                requestBody: {
                                    name: `${file.split('.')[0]}.txt`, //This can be name of your choice
                                    mimeType: 'text/plain',
                                    parents: [folder.data.id]
                                },
                                media: {
                                    mimeType: 'text/plain',
                                    body: fs.createReadStream(`${filePathJSON}`),
                                },
                            });
                            console.log(response.data, responseJSON.data, "INSERTED IN NEW FOLDER");
                        }
                    }
                } catch (e) {
                    console.log(e)
                }
            }
        } catch (error) {
            console.log(error.message);
            return res.send({
                success: false,
                message: messages.ERROR
            });
        }

        // ! google drive

        let n = 0;
        newUserValue.map((res) => {
            console.log(res.final_dentist_count / res.total_dentist_count, res.final_dentist_count, res.total_dentist_count)
            if (res.final_dentist_count && res.total_dentist_count) {
                if (res.admin_count && res.admin_count != 0) {
                    n += (res.final_dentist_count / (res.total_dentist_count + res.admin_count))
                } else {
                    n += (res.final_dentist_count / res.total_dentist_count)
                }
            }
        })

        if (final_dentist.length > 0 && dentist_count.length > 0) {
            if (super_admin.length > 0) {
                n += final_dentist.length / (dentist_count.length + super_admin.length)
            } else {
                n += final_dentist.length / dentist_count.length
            }
        }

        let acc = ((n / (newUserValue.length + 1)) * 100).toFixed(2)

        console.log(setEvalData, setEvalData1, "?????????")
        var data = await User.findByIdAndUpdate(req.body.user_id, {
            $inc: { 'noOfXrayMarkedByAdmin': 1 },
            $set: { 'accuracy': acc }
        })

        console.log(setEvalData, acc, userInfo.accuracy, "ACCURACY")

        if (!setEvalData) {
            return res.send({
                success: false,
                message: "Please wait, this image is not evaluated by the dentist."
            });
        }
        return res.send({
            success: true,
            message: "Data added successfully",
            value: n / newUserValue.length,
            length: newUserValue.length,
            user_acc: userInfo.accuracy,
            data: newUserValue
        })
    }


    catch (error) {
        console.log(error)
        return res.send({
            success: false,
            message: messages.ERROR
        });
    }
}

async function uploadFile(filePath, file) {
    try {
        console.log("Function worked")
        const response = await drive.files.create({
            requestBody: {
                name: file, //This can be name of your choice
                mimeType: 'image/jpg',
            },
            media: {
                mimeType: 'image/jpg',
                body: fs.createReadStream(filePath),
            },
        });
        console.log(response.data);
    } catch (error) {
        console.log(error.message);
    }
}

exports.getEvaluationById = async (req, res) => {
    try {
        if (!req.query.xray_id) {
            console.log("not found id ")
            return res.send({
                success: false,
                message: "Please enter xray Id"
            })
        }
        console.log(req.query.xray_id)
        var getData = await Evaluation.findOne({
            xray_id: req.query.xray_id

        });
        // console.log(getData, "record+++")
        if (!getData) {
            return res.send({
                success: false,
                message: messages.NORECORD,
            })
        }
        return res.send({
            success: true,
            message: "Xray data by Id",
            getData: getData
        })
    }
    catch (error) {
        console.log(error, "++++++")
        return res.send({
            success: false,
            message: messages.ERROR
        })
    }
}

// exports.razorpayOrder = async (req, res) => {
//     //console.log("req body = " + JSON.stringify(req.body))
//     if (!req.body.amount) {
//         return res.send({
//             success: false,
//             message: "Please enter order amount."
//         });
//     }
//     if (!req.body.user_id) {
//         return res.send({
//             success: false,
//             message: "Please enter user id."
//         });
//     }
//     let getUserSubscription = await User.findOne({
//         '_id': req.body.user_id,
//         'subscription_details.status': true,
//     });
//     console.log("*****", getUserSubscription, "-----")
//     if (getUserSubscription != null) {
//         return res.send({
//             success: false,
//             message: "Subscription of this user already available"
//         });
//     }

//     try {
//         var options = {
//             amount: (req.body.amount), //amount recieved should be in paise form which is already done in frontend
//             // amount: (req.body.amount) * 100,
//             currency: "INR",
//             receipt: req.body.receipt
//         }
//         razorpay.orders.create(options, (error, order) => {
//             if (error) {
//                 console.log(error);
//                 return res.send({
//                     success: false,
//                     message: "Order canceled"
//                 });
//             }
//             console.log("Order successful details : " + order);
//             return res.send({
//                 success: true,
//                 message: "order placed",
//                 order: order
//             });
//         })
//     } catch (error) {
//         console.log("Error in order", error);
//         return res.send({
//             success: false,
//             message: messages.ERROR
//         });
//     }
// };

//paypal Code

// exports.paypalOrder = (req, res) => {
//     const create_payment_json = {
//         "intent": "sale",
//         "payer": {
//             "payment_method": "paypal"
//         },
//         "redirect_urls": {
//             "return_url": "http://localhost:3000/success",
//             "cancel_url": "http://localhost:3000/cancel"
//         },
//         "transactions": [{
// "item_list": {
//     "items": [{
//         "name": "Red Sox Hat",
//         "sku": "001",
//         "price": "25.00",
//         "currency": "USD",
//         "quantity": 1
//     }]
// },
//             "amount": {
//                 "currency": "USD",
//                 "total": "25.00"
//             },
//             "description": "Pay for order"
//         }]
//     }
// }

// exports.paypalSuccess = (req, res) => {
//     const payerId = req.query.PayerID;
//     const paymentId = req.query.paymentId;

//     const execute_payment_json = {
//         "payer_id": payerId,
//         "transactions": [{
//             "amount": {
//                 "currency": "USD",
//                 "total": "25.00"
//             }
//         }]
//     };
// }

exports.paypalOrder = async (req, res) => {
    console.log(req.body);
    const create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal",
        },
        redirect_urls: {
            return_url: "http://localhost:4200/dashboard",
            cancel_url: "http://localhost:4200/login",
        },
        transactions: [
            {
                item_list: {
                    items: [
                        {
                            name: "Subs",
                            sku: "001",
                            price: req.body.price,
                            currency: "USD",
                            quantity: 1,
                        },
                    ],
                },
                amount: {
                    currency: "USD",
                    total: req.body.price,
                },
                description: "Pay for order",
            },
        ],
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === "approval_url") {
                    res.send({ link: payment.links[i].href });
                }
            }
        }
    });
};

exports.paypalSuccess = async (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        payer_id: payerId,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: "25.00",
                },
            },
        ],
    };

    paypal.payment.execute(
        paymentId,
        execute_payment_json,
        function (error, payment) {
            if (error) {
                console.log(error.response, "COMING FROM PAYPAL ERROR");
                throw error;
            } else {

                console.log("paypal", JSON.stringify(payment), "paypal");
                res.send("Success");
            }
        }
    );
};

exports.paypalCancel = (req, res) => res.send('Cancelled');



/*exports.razorpayOrder = async (req, res) => {
    //console.log("req body = " + JSON.stringify(req.body))
    if (!req.body.amount) {
        return res.send({
            success: false,
            message: "Please enter order amount."
        });
    }
    if (!req.body.user_id) {
        return res.send({
            success: false,
            message: "Please enter user id."
        });
    }
    let getUserSubscription = await User.findOne({
        '_id': req.body.user_id,
        'subscription_details.status': true,
    });
    console.log("*****", getUserSubscription, "-----")
    if (getUserSubscription != null) {
        return res.send({
            success: false,
            message: "Subscription of this user already available"
        });
    }
    
    //paypal code
    const payment = {
        'intent': 'sale',
        'payer': {
          'payment_method': 'paypal'
        },
        'redirect_urls': {
          'return_url': 'http://localhost:3000/success',
          'cancel_url': 'http://localhost:3000/cancel'
        },
        'transactions': [{
          'amount': {
            'total': req.body.amount,
            'currency': 'INR'
          },
          'description': 'Payment for order'
        }]
      };

//


    try {
        var options = {
            amount: (req.body.amount), //amount recieved should be in paise form which is already done in frontend
            // amount: (req.body.amount) * 100,
            currency: "INR",
            receipt: req.body.receipt
        }
     /*   razorpay.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.send({
                    success: false,
                    message: "Order canceled"
                });
            }
            console.log("Order successful details : " + order);
            return res.send({
                success: true,
                message: "order placed",
                order: order
            });
        })*/


/*  paypal.payment.create(payment, async function (error, payment) {
      if (error) {
        console.error(error);
        return res.sendStatus(500);
      } else {
        // update order with PayPal payment ID
        order.paymentId = payment.id;
        await order.save();
 
        // redirect user to PayPal to complete payment
        const redirectUrl = payment.links.find(link => link.rel === 'approval_url').href;
        res.redirect(redirectUrl);
      }
    });


} catch (error) {
  console.log("Error in order", error);
  return res.send({
      success: false,
      message: messages.ERROR
  });
}
};
*/


exports.loadAIMarking = async (req, res) => {
    if (!req.body.img_path) {
        return res.send({
            success: false,
            message: "Please enter image path."
        });
    }

    if (!req.body.img_type) {
        return res.send({
            success: false,
            message: "Please enter image type."
        });
    }
    try {
        let url = req.body.img_path;
        let type = req.body.img_type;

        var request = require('request');
        var fs = require('fs');
        var options = {
            'method': 'POST',
            'url': config.AI_URL,
            'headers': {

                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': "*",
            },


            formData: {
                'file': {
                    'value': fs.createReadStream('public/' + url),
                    'options': {
                        'filename': url,
                        'contentType': type
                    }
                }
            }
        };
        request(options, async function (error, response) {
            if (error) throw new Error(error);
            else {
                console.log(JSON.parse(response.body));
                // console.log(JSON.parse(response.body));
                apiData = JSON.parse(response.body);
                console.log(apiData, "apiData")

                let data = {
                    xray_id: req.body.xray_id,
                    // "ai_identified_cavities.rectangle_coordinates": apiData.boxes,
                }
                var setEvalData = await Evaluation(data).save();
                console.log(setEvalData, "?????????");
                let boxes = [];
                for (let coords of apiData.boxes) {
                    boxes.push({
                        coordinates: coords
                    })
                }
                var setAI = await Evaluation.findOneAndUpdate({
                    xray_id: req.body.xray_id,
                },
                    {
                        $set: {
                            "ai_identified_cavities.rectangle_coordinates": boxes,
                            "ai_identified_cavities.color_labels": apiData.labels,
                            // "ai_identified_cavities.model_version": apiData.model_version,
                            "ai_identified_cavities.accuracy_score": apiData.scores,
                            "ai_identified_cavities.primary_model_cnt_detections": apiData.primary_model_cnt_detections,
                            "ai_identified_cavities.primary_model_image_path": apiData.primary_model_image_path,
                            "ai_identified_cavities.secondary_model_cnt_detections": apiData.secondary_model_cnt_detections,
                            "ai_identified_cavities.secondary_model_image_path": apiData.secondary_model_image_path,
                            "ai_identified_cavities.tags": apiData.tags,
                            "ai_identified_cavities.image_name": apiData.image_name,
                            "ai_identified_cavities.final_image_path": apiData.final_image_path,
                            "ai_identified_cavities.final_cnt_detections": apiData.final_cnt_detections,
                            "ai_identified_cavities.final_cnt_cavities": apiData.final_cnt_cavities,
                            "ai_identified_cavities.final_cnt_probable_cavities": apiData.final_cnt_probable_cavities,


                        }
                    }
                )
                console.log(setAI, "???")
                if (!setEvalData) {
                    return res.send({
                        success: false,
                        message: "Please wait, this image is not evaluated by the dentist."
                    });
                }
                return res.send({
                    success: true,
                    message: "Data added successfully",
                    getData: setAI,
                    boxes: boxes,
                    apiData: apiData
                })



            }
        });

    }
    catch (error) {
        console.log("Error in Ai marking", error);
        return res.send({
            success: false,
            message: error
        });
    }

}
exports.saveEvaluation = async (req, res) => {
    try {
        let ImageArr = [];
        console.log("----", req.files, "----")
        // let xray_data = JSON.parse(req.body.xray_data)
        console.log(req.body)
        if (req.files != undefined) {
            if (req.files.xray_image != undefined) {
                req.files.xray_image.forEach(element => {
                    ImageArr.push({
                        path: 'uploads/' + element.filename,
                        // path: 'uploads/' + element.originalname,
                        mimetype: element.mimetype,
                    })
                });
                req.body.xray_image = ImageArr;
            }
        }
        let xray_data = JSON.parse(req.body.xray_data)
        let ai_data = JSON.parse(req.body.ai_data)
        // let user_data = JSON.parse(req.body.user_id)
        let xrayData = {
            "xray_image.path": req.body.xray_image[0]?.path,
            "xray_image.mimetype": req.body.xray_image[0]?.mimetype,
            "totalCavitiesDetectedByUser": xray_data.total_cavities,
            user_id: req.body.user_id,
            "created_at": Date.now(),
            evaluation_status: true,
        }
        console.log(xrayData, "DATA");
        let setXrayData = await Xray(xrayData).save();
        console.log(setXrayData, "SETDATA")
        if (!setXrayData) {
            return res.send({
                success: false,
                message: "Error in X-ray upload"
            });
        }
        let eval_data = {
            xray_id: setXrayData._id,
            ai_identified_cavities: ai_data,
            evaluation_status: true,
            evaluated_by: req.body.user_id,
            dentist_correction: xray_data.marker
        }
        let addToEval = await Evaluation(eval_data).save()
        console.log(req.body.user_id, "USER ID")
        var data = await User.findByIdAndUpdate(req.body.user_id, {
            $inc: { 'noOfXrayEvaluated': 1 }
        })
        if (!data) {
            return res.send({
                success: false,
                message: "Error in uploading evaluation result for user."
            });
        }
        if (!addToEval) {
            return res.send({
                success: false,
                message: "Error in uploading evaluation result."
            });
        }
        return res.send({
            success: true,
            message: "X-ray uploaded successfully",
            xrayData: setXrayData,
            evalData: addToEval
        })
    } catch (e) {
        console.log(e)
    }
}
exports.updateAIMarking = async (req, res) => {
    try {
        if (req.body.xray_id == "") {
            return res.send({
                success: false,
                message: "Please enter xray idh."
            });
        }
        var setEvalData = await Evaluation.findOneAndUpdate({
            xray_id: req.body.xray_id,
        }, {
            $set: {
                "ai_identified_cavities.rectangle_coordinates": req.body.ai_cavities,
            }
        }
        );
        console.log(setEvalData, "???----")
        if (!setEvalData) {
            return res.send({
                success: false,
                message: "Please wait, this image is not evaluated by the dentist."
            });
        }
        return res.send({
            success: true,
            message: "Data added successfully",
            getData: setEvalData
        })

    }
    catch (error) {
        console.log("Error in Ai marking", error);
        return res.send({
            success: false,
            message: error
        });
    }
}

exports.setFlag = async (req, res) => {
    try {
        if (req.body.id == "") {

            return res.send({
                success: false,
                message: "Please enter user id."
            });
        }

        var data = await User.findOneAndUpdate({
            _id: req.body.id,
        }, {
            $set: {
                flag: req.body.flag,
            }
        }
        );
        if (!data) {
            return res.send({
                success: false,
                message: "error in set flag"
            });
        }
        else {
            return res.send({
                success: true,
                message: "flag set successfully"
            });
        }
    }
    catch (error) {
        console.log("Error in set flag", error);
        return res.send({
            success: false,
            message: error
        });
    }
}
exports.noOfSubscriber = async (req, res) => {
    try {
        let date = new Date();
        var count = await User.count({
            '$or': [{
                'role': 'dentist',
                'subscription_details.status': false,
                'subscription_details.end_date': { '$gte': new Date(date).getTime() }
            }, {
                'subscription_details.status': true,
                'role': 'dentist',
            }]
        })
        console.log(count, "no. of subscriber")
        if (!count) {
            return res.send({
                success: false,
                message: "error in getting subscriber"
            });
        }
        else {
            return res.send({
                success: true,
                message: "subscriber got successfully",
                getData: count
            });
        }
    }
    catch (error) {
        console.log("Error in set flag", error);
        return res.send({
            success: false,
            message: error
        });
    }
}
exports.noOfUnsubscriber = async (req, res) => {
    try {
        let date = new Date();
        var count = await User.count({
            'subscription_details.status': false,
            'subscription_details.end_date': undefined,
            "role": 'dentist',
        })
        console.log(count, "no. of subscriber")
        if (!count) {
            return res.send({
                success: false,
                message: "error in getting subscriber"
            });
        }
        else {
            return res.send({
                success: true,
                message: "subscriber got successfully",
                getData: count
            });
        }
    }
    catch (error) {
        console.log("Error in set flag", error);
        return res.send({
            success: false,
            message: error
        });
    }
}

exports.noOfXrayEval = async (req, res) => {
    try {
        var count = await Xray.count({
            'evaluation_status': true,
            'admin_marked_status': true
        })
        console.log(count, "no. of xray eval")

        var getData = await Xray.count({
            'evaluation_status': true,
            'admin_marked_status': true
        })
        console.log(count, "no. of xray eval")

        if (!count) {
            return res.send({
                success: false,
                message: "error in getting xray"
            });
        }
        else {
            return res.send({
                success: true,
                message: "xray got successfully",
                getData: getData, count

            });
        }
    }
    catch (error) {
        console.log("Error in xray no.", error);
        return res.send({
            success: false,
            message: error
        });
    }
}
exports.noOfPlans = async (req, res) => {
    try {
        var count = await subscription.count()
        console.log(count, "no. of plans")
        if (!count) {
            return res.send({
                success: false,
                message: "error in getting plans"
            });
        }
        else {
            return res.send({
                success: true,
                message: "plans got successfully",
                getData: count
            });
        }
    }
    catch (error) {
        console.log("Error in plan no.", error);
        return res.send({
            success: false,
            message: error
        });
    }
}
exports.amtEarned = async (req, res) => {
    try {
        let count =
            await User.find({}, { "all_subscription_details.amount": 1 })
                .populate({ path: 'all_subscription_details.subscription_id', select: 'amount' })


        console.log(count, "no. of plans")
        var amt = 0;
        for (let i = 0; i < count.length; i++) {
            for (let j = 0; j < count[i].all_subscription_details.length; j++) {
                console.log(count[i]?.all_subscription_details[j]?.subscription_id?.amount, "amount")
                if (count[i]?.all_subscription_details[j]?.subscription_id?.amount) {
                    amt += count[i].all_subscription_details[j].subscription_id.amount;
                }
                // amt = amt + count[i].all_subscription_details[j].price;
            }
        }
        console.log("total amt", amt)
        if (!count) {
            return res.send({
                success: false,
                message: "error in getting plans amt"
            });
        }
        else {
            return res.send({
                success: true,
                message: "plans amt got successfully",
                getData: amt
            });
        }
    }
    catch (error) {
        console.log("Error in plan no.", error);
        return res.send({
            success: false,
            message: error
        });
    }
}
exports.noOfXrayNotEval = async (req, res) => {
    try {

        var getData = await Xray.count({

            'evaluation_status': true,
            'admin_marked_status': false,
        })
        console.log(getData, "no. of xray not eval")

        if (!getData) {
            return res.send({
                success: false,
                message: "error in getting xray"
            });
        }
        else {
            return res.send({
                success: true,
                message: "xray got successfully",
                getData: getData

            });
        }
    }
    catch (error) {
        console.log("Error in xray no.", error);
        return res.send({
            success: false,
            message: error
        });
    }
}
exports.getNoOfXrayById = async (req, res) => {
    try {
        if (!req.query.dentist_id) {
            return res.send({
                success: false,
                message: "Please enter dentist Id"
            });
        }
        var getData = await Xray.count({
            user_id: req.query.dentist_id,
        });
        console.log(getData, "******")
        if (!getData) {
            return res.send({
                success: false,
                message: messages.NORECORD
            });
        }
        return res.send({
            success: true,
            message: "No. of Xray record by Id",
            getData: getData,

        });
    }
    catch (error) {
        console.log(error, "++++++")
        return res.send({
            success: false,
            message: messages.ERROR
        })
    }
}
exports.getNoOfXrayEvalById = async (req, res) => {
    try {
        if (!req.query.dentist_id) {
            return res.send({
                success: false,
                message: "Please enter dentist Id"
            });
        }
        var getData = await Xray.count({
            user_id: req.query.dentist_id,
            evaluation_status: true
        });

        var getDataDentist = await Xray.aggregate([
            {
                $match: {
                    "user_id": ObjectId(req.query.dentist_id),
                }

            },


            {
                $lookup: {
                    from: 'evaluations',
                    localField: '_id',
                    foreignField: 'xray_id',
                    as: "evaluation",
                },
            },
            {
                $project: {
                    'evaluation.dentist_correction.value.rectanglelabels': 1,
                }
            }

        ])

        console.log(getData, "******")
        if (!getData) {
            return res.send({
                success: false,
                message: messages.NORECORD
            });
        }
        return res.send({
            success: true,
            message: "No. of Xray record by Id",
            getData: getData,
            dentist: getDataDentist
        });
    }
    catch (error) {
        console.log(error, "++++++")
        return res.send({
            success: false,
            message: messages.ERROR
        })
    }
}

exports.getNoOfCavitiesByAIofUser = async (req, res) => {
    try {
        if (!req.query.dentist_id) {
            return res.send({
                success: false,
                message: "Please enter dentist Id"
            });
        }
        console.log(req.query.dentist_id, "DENTIST ID CHECK")
        var getData = await Xray.aggregate([
            {
                $match: {
                    "user_id": ObjectId(req.query.dentist_id),
                }

            },


            {
                $lookup: {
                    from: 'evaluations',
                    localField: '_id',
                    foreignField: 'xray_id',
                    as: "evaluation",
                },
            },
            {
                $project: {
                    'evaluation.ai_identified_cavities.color_labels': 1,
                }
            }

        ])
        count = 0;
        for (let i = 0; i < getData.length; i++) {
            // return(getData[i].evaluation.ai_identified_cavities.color_labels.length?getData[i].evaluation.ai_identified_cavities.color_labels.length+count:count)
            if (getData[i].evaluation.length > 0) {
                console.log("empty")
                // console.log(getData[i].evaluation[0].ai_identified_cavities,"-+-")
            }
            else {
                console.log("not empty")
            }

        }




        // console.log(getData, "******",count)
        if (!getData) {
            return res.send({
                success: false,
                message: messages.NORECORD
            });
        }
        return res.send({
            success: true,
            message: "No. of Xray record by Id",
            getData: getData,

        });
    }
    catch (error) {
        console.log(error, "++++++")
        return res.send({
            success: false,
            message: messages.ERROR
        })
    }
}

exports.cavitiesCountOfAI = async (req, res) => {
    try {
        var getData = await Xray.aggregate([
            {
                $lookup: {
                    from: 'evaluations',
                    localField: '_id',
                    foreignField: 'xray_id',
                    as: "evaluation",
                },
            },
            {
                $project: {
                    'evaluation.admin_count': 1,
                    'evaluation.final_AI_count': 1,
                    'evaluation.final_dentist_count': 1,
                    'evaluation.total_AI_count': 1,
                    'evaluation.total_dentist_count': 1,
                }
            }
        ])
        let getData1 = await Xray.find({})

        let totalAI = 0;
        let finalAI = 0;
        let totalD = 0;
        let finalD = 0;
        getData.map((item) => {
            if (item.evaluation[0].total_AI_count) {
                totalAI += item.evaluation[0].total_AI_count
            }
            if (item.evaluation[0].final_AI_count) {
                finalAI += item.evaluation[0].final_AI_count
            }
            if (item.evaluation[0].final_dentist_count) {
                finalD += item.evaluation[0].final_dentist_count
            }
            if (item.evaluation[0].total_dentist_count) {
                totalD += item.evaluation[0].total_dentist_count
            }
        })
        console.log(totalAI, finalAI, getData1, getData)
        res.send({ success: true, AICountT: totalAI, AICountF: finalAI, finalD: finalD, totalD: totalD, length: getData.length, data1: getData1, data: getData })
    } catch (e) {
        console.log("err =>", e)
        res.send({ success: false, message: messages.ERROR })
    }
}

exports.accuracyPerSys = async (req, res) => {
    try {
        var getData = await Xray.aggregate([
            {
                $match: {
                    "admin_marked_status": true,
                }

            },


            {
                $lookup: {
                    from: 'evaluations',
                    localField: '_id',
                    foreignField: 'xray_id',
                    as: "evaluation",
                },
            },
            {
                $project: {
                    'evaluation.admin_count': 1,
                    'evaluation.final_AI_count': 1,
                    'evaluation.final_dentist_count': 1,
                    'evaluation.total_AI_count': 1,
                    'evaluation.total_dentist_count': 1,
                }
            }

        ])

        if (getData.length == 0) {
            res.send({ success: false, message: messages.ERROR })
        }

        console.log(getData, "FOR ACCURACY")

        let newData = getData.filter((elem) => elem.evaluation[0].total_AI_count != undefined || elem.evaluation[0].total_AI_count != null)
        let newData1 = getData.filter((elem) => elem.evaluation[0].total_dentist_count != undefined && elem.evaluation[0].total_dentist_count != null && elem.evaluation[0].total_dentist_count != 0)
        console.log(newData, newData1, "FOR ACCURACY")
        let sumOfAI = 0;
        // let sumOfD = 0;
        newData.map((item) => {
            sumOfAI += (item.evaluation[0].final_AI_count / item.evaluation[0].total_AI_count)
        })
        // newData1.map((item) => {
        //     console.log(item.evaluation[0].final_dentist_count, item.evaluation[0].total_dentist_count, "DENT COUNT")
        //     if (item.evaluation[0].final_dentist_count > 0 && item.evaluation[0].total_dentist_count > 0) {
        //         sumOfD += (item.evaluation[0].final_dentist_count / item.evaluation[0].total_dentist_count)
        //     }
        // })

        let accuracyPer = (sumOfAI * 100) / newData.length
        // let accuracyD = (sumOfD * 100) / newData1.length
        console.log(newData1.length, "SUM OF DENT")
        return res.send({ success: true, accuracy: accuracyPer.toFixed(2), message: `The accuracy of system is - ${accuracyPer.toFixed(2)}`, revisedData: newData })
    } catch (e) {
        console.log("err", e)
        // return res.send({success: false, message: e})
    }
}

exports.transactionFailed = async (req, res) => {
    try {
        console.log(req.body)
        var getData = await User.find({
            _id: req.body.id,
        });
        if (getData.length == 0) {
            res.send({ success: false, message: messages.USER_ID })
        }
        res.send({ success: true, message: "Dentist details by Id", data: getData })
    } catch (e) {
        console.log("err", e)
        res.send({ success: false, message: messages.ERROR })
    }
}

exports.getUserPlanById = async (req, res) => {
    try {
        if (!req.query.dentist_id) {
            return res.send({
                success: false,
                message: "Please enter dentist Id"
            });
        }
        const getData = await User.findById(req.query.dentist_id)
            .populate({ path: 'subscription_details.subscription_id', select: ["plan_name", 'amount', "type"] });
        console.log(getData, "******")
        if (!getData) {
            return res.send({
                success: false,
                message: messages.NORECORD
            });
        }
        return res.send({
            success: true,
            message: "Plan record by Id",
            getData: getData,

        });
    }
    catch (error) {
        console.log(error)
        return res.send({
            success: false,
            message: messages.ERROR
        })
    }
}

exports.resetPassword = async (req, res) => {


    if (!req.body.password || req.body.password.trim() == "") {
        return res.send({
            success: false,
            message: messages.PASSWORD
        });
    }
    if (!req.body.newPassword || req.body.newPassword.trim() == "") {
        return res.send({
            success: false,
            message: messages.PASSWORD
        });
    }
    if (!req.body.cnfPassword || req.body.cnfPassword.trim() == "") {
        return res.send({
            success: false,
            message: messages.PASSWORD
        });
    }

    if (req.body.newPassword.length < 6 || req.body.cnfPassword.length < 6) {
        return res.send({
            success: false,
            message: messages.INVALID_PASSWORD
        });
    }
    if (req.body.newPassword !== req.body.cnfPassword) {
        return res.send({
            success: false,
            message: "Confirm password does not match with new password"
        });
    }
    try {
        let user = await User.findOne({
            _id: req.body.id
        });

        if (!user) {
            return res.send({
                success: false,
                message: messages.NOT_REGISTERED
            });
        }
        if (user.status == false) {
            return res.send({
                success: false,
                message: "User inactive kindly contact your super admin."
            })
        }
        //console.log("user information : ", user);
        console.log("user status : ", req.body.password, user.password);
        var userInfo = {};
        let result = bcrypt.compareSync(req.body.password, user.password);
        console.log(result, "result")
        if (!result) {
            console.log("false res")
            return res.send({
                success: false,
                message: messages.INVALID_PASSWORD_CURRENT
            });
        }
        if (result) {
            console.log("true resulttt")
            req.body.newPassword = bcrypt.hashSync(req.body.newPassword, 10);
            data = {
                password: req.body.newPassword
            }
            console.log("bcrypt")
            User.findByIdAndUpdate(req.body.id, data).exec((err, data) => {
                if (err) { console.log(err) }
                else {
                    return res.send({
                        success: true,
                        message: "Password reset",
                        getData: data,

                    });
                }
                console.log(data, "!!!!!!WORK!!!!!")
            })
            //console.log(getData)
            //console.log(getData, "******")

        }

    }


    catch (error) {
        console.log(error)
        return res.send({
            success: false,
            message: messages.ERROR
        })
    }
}
exports.subscriptionReminder = async (req, res) => {
    try {
        if (!req.query.dentist_id) {
            return res.send({
                success: false,
                message: "Please enter dentist Id"
            });
        }
        const getData = await User.findById(req.query.dentist_id)
        const date = new Date();

        console.log(getData, "******")
        if (!getData) {
            return res.send({
                success: false,
                message: messages.NORECORD
            });
        }
        return res.send({
            success: true,
            message: "Plan record by Id",
            getData: getData,

        });
    }
    catch (error) {
        console.log(error)
        return res.send({
            success: false,
            message: messages.ERROR
        })
    }
}
diff = async (req, res) => {
    const date1 = new Date('7/13/2010');
    const date2 = new Date('7/15/2010');
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    console.log(diffTime + " milliseconds");
    console.log(diffDays + " days");
}
diff();

exports.getCountries = async (req, res) => {
    try {
        const getCountriesList = await Countries.find({})
        // console.log(getCountriesList)
        return res.send({
            success: true,
            message: "Country list",
            getData: getCountriesList,

        });
    } catch (e) {
        console.log(e)
    }
}

exports.getStateByCountries = async (req, res) => {
    try {
        // console.log(req.body.name)
        const getStateByCountry = await Countries.find({ countryName: req.body.name })
        return res.send({
            success: true,
            message: "Country list",
            getData: getStateByCountry,

        });
    } catch (e) {
        console.log(e)
    }
}