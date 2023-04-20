var http = require("http");
//var pdf = require('html-pdf');
const path = require("path");
const fs = require("fs");
var messages = require("../config/messages");
const crypto = require("crypto");
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var bcrypt = require('bcryptjs');
var config = require('../config/config');
var cron = require("node-cron");
const { NORECORD } = require("../config/messages");
var User = require("../models/user");
var subscription = require("../models/subscription");
var Xray = require("../models/xray")
var Evaluation = require('../models/evaluation')
var jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
var moment = require('moment');
var moments = require('moment-timezone');
var pdfContent = require('../middleware/pdf-invoice.js');
var pdf = require('html-pdf');
const fetch = require("node-fetch");
const axios = require("axios");
//localstorage for token
const LocalStorage = require('node-localstorage').LocalStorage;
const paypal = require('paypal-rest-sdk');
const evaluation = require("../models/evaluation");
// ! working paypal keys here
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AeKffQqEC4lR2FtZBUdTIlOz6vMXajfBakTU2IIqdmA18KxLwV7FHpfMagXrAqf0RAwc7evqE3_HcvKr',
    'client_secret': 'EPNEGNEQmmqoQ3-Re3U7gyVkH3jIPS1h8Ai_mti1fBdMwkpIu2GeQxqFxg3Oy4JetoMQM-PLMK4yjBLU'
});

// ! test keys here
// paypal.configure({
//     'mode': 'sandbox', //sandbox or live
//     'client_id': 'Abah--H0KR5c54b_YianWFSKudOeRtX_a-xgswRJGHXIARFe4ZEQqA6mznnzL4Qn4V2BYUC9YK1bMH4M',
//     'client_secret': 'EOA60axbaIg1NeZLv-AzREUTM792foYSBAf5-gNsrxPUByyqmG9vhtcfqtA5X85n54O8WK6i6kB2_nBM'
// });


const razorpay = new Razorpay({
    key_id: config.razorpay_key_id,
    key_secret: config.razorpay_key_secret
})



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
            userInfo = {
                id: user._id,
                // email: user.email,
                //first_name: user.first_name,
                //last_name: user.last_name,
                token: token,
                //role: user.role,
                //subscribed: user.subscription_details.status,

            }
            console.log(user.subscription_details.status)
            console.log(userInfo)
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
    console.log("user bodyyyyyyyyyyyy : ", req.body)
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
                first_name: req.body.first_name.trim().toLowerCase(),
                last_name: req.body.last_name.trim().toLowerCase(),

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
        console.log("---", xrayCount, "--")


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
        console.log(getData, "******")
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
            await Xray.find({})
                .populate({ path: 'user_id', select: ["first_name", 'last_name', 'flag','subscription_details'] });
        /* let count1 = await Xray.countDocuments({user_id:"user_id"})
       console.log("++++",count1, "++++")*/
       /* count1 = await Xray.aggregate([
            { $sortByCount: '$user_id' }
        ])*/
        console.log("++++ ++++", getData,"++//");
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
                .populate({ path: 'all_subscription_details.subscription_id', select: ["plan_name", 'amount'] });

        console.log("++", getData, "++")
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
                minimum: req.body.minimum,
                maximum: req.body.maximum,
                type: req.body.type,
                country: req.body.country,
            }
            var setPlanData = await subscription(pricingData).save();
            console.log(setPlanData)
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
            console.log("not found id ")
            return res.send({
                success: false,
                message: "Please enter plan Id"
            })
        }
        console.log(req.query.subscription_id)
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
    console.log(req.query.id)
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
    if (!req.body.minimum || req.body.minimum == "") {
        return res.send({
            success: false,
            message: "Please enter minimum value"
        })
    }
    if (!req.body.maximum || req.body.maximum == "") {
        return res.send({
            success: false,
            message: "Please enter maximum vlaue"
        })
    }
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
            minimum: req.body.minimum,
            maximum: req.body.maximum,
            type: req.body.type,
            country: req.body.country,
            status: req.body.status

        }
        var updateData = await subscription.findByIdAndUpdate(req.query.id, planData);
        console.log(req.query.id, "****")
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
     if (!req.body.email || req.body.email == "") {
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
     }
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
           
            license_no:req.body.license_no,

        }
        var updateData = await User.findByIdAndUpdate(req.query.dentist_id, userData);
        console.log(req.query.dentist_id, "****")
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
        console.log("updatedata", updateData)
        if (!updateData) {
            return res.send({
                success: false,
                message: messages.ERROR
            })
        }

        return res.send({
            success: true,
            message: "Subscription cancelled successfully"
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
        console.log("----", req.query.id, "------", req.body.sub_id)
        var addOrder = {
            subscription_id: req.body.sub_id,
            end_date: req.body.end_date,
            start_date: req.body.start_date,
            status: true,
        }

        var planData = await User.findOneAndUpdate({
            _id: req.query.id
        }, {
            $set: {
                'subscription_details.subscription_id': req.body.sub_id,
                'subscription_details.end_date': req.body.end_date,
                'subscription_details.start_date': req.body.start_date,
                'subscription_details.status': true,


            },
            $push: {
                all_subscription_details: addOrder
            },
        }
        )
        console.log("plandata", planData)
        if (!planData) {
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
exports.deletePlanById = async (req, res) => {

    console.log(req.query.id)
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

    console.log(req.query.id)
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

subscriptionEnd = async (req, res) => {
    try {


        d = new Date();
        let curDate = d.toISOString().split('T')[0];

        cron.schedule(" * * * * * ", async function () {
            //console.log("cur-hour",h2,"cur-min",m2)
            d = new Date();
            h2 = d.getHours();
            m2 = d.getMinutes();
            //console.log("curhour", d.getHours())
            console.log("cur date", d)



            let getUserSubscription1 = await User.find({
                role: 'dentist',
                'subscription_details.status': true,
                'subscription_details.end_date': { $lte: d }
            })
            console.log("------", getUserSubscription1, "-------");
            for (let i = 0; i < getUserSubscription1.length; i++) {
                // console.log(getUserSubscription1[i].created_by)
                let user1 = await User.updateMany({
                    role: 'dentist',
                    _id: getUserSubscription1[i]._id
                }, {
                    $set: {
                        'subscription_details.status': false,
                    }
                });
                // console.log(user1)
            }  //console.log(user1)

            console.log(user1)


        }


        )
        ///////code end/////

    } catch (error) {
        return res.send({
            success: false,
            message: messages.ERROR
        });
    }

};
subscriptionEnd();

exports.uploadXray = async (req, res) => {
    try {
        var ImageArr = [];
        console.log("----", req.files)
        if (req.files != undefined) {
            if (req.files.xray_image != undefined) {
                req.files.xray_image.forEach(element => {
                    ImageArr.push({
                        path: 'uploads/' + element.filename,
                        mimetype: element.mimetype,
                    })
                });
                req.body.xray_image = ImageArr;

            }

        }
        console.log(req.body)
        var xrayData = {
            "xray_image.path": req.body.xray_image[0]?.path,
            "xray_image.mimetype": req.body.xray_image[0]?.mimetype,
            user_id: req.body.user_id,
            "created_at": Date.now(),
        }
        console.log(xrayData,);

        // upload(req,res,function(err){
        //     if(err){
        //         return res.status(500).send({error: "Internal server error!"})
        //     }
        //     res.status(200).send({message: "Uploaded successfully!"})
        // })

        var setXrayData = await Xray(xrayData).save();
        console.log("****", setXrayData, "****")
        
        var data = await User.findByIdAndUpdate(req.body.user_id,{
           
            $inc: { 'noOfXrayUploaded': 1 } })
       // findByIdAndUpdate(id, { noOfXrayUploaded: { $inc: 1 } })
        console.log(data,"**---**")
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
            totalCavitiesDetectedByUser:req.body.total_cavities

        }
        var setEvalData = await Evaluation.findOneAndUpdate({
            xray_id: req.body.xray_id,
        },{$set:{
            evaluated_by: req.body.user_id,

            dentist_correction: req.body.marker,
           
            evaluated_on: Date.now(),
            evaluation_status: true
        }}
        );
        var updateXrayData = await Xray.findByIdAndUpdate(req.body.xray_id, xrayData)

        var data = await User.findByIdAndUpdate(req.body.user_id,{
           
            $inc: { 'noOfXrayEvaluated': 1 } })
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
exports.setEvaluatedDataFromAdmin = async (req, res) => {

    try {
        console.log(req.body.accuracy_per)
        let evaluatedData = {
            xray_id: req.body.xray_id,
            evaluated_by: req.body.user_id,

            admin_correction: req.body.marker,
            admin_correction_percentage: req.body.accuracy_per



        }
        var setEvalData = await Evaluation.findOneAndUpdate({
            xray_id: req.body.xray_id
        }, {
            $set: {
                "admin_correction": req.body.marker,
                "accurate_val": req.body.accurate_val
            }
        }
        )
        var setEvalData1 = await Xray.findOneAndUpdate({
            _id: req.body.xray_id
        }, {
            $set: {
                accurateCavitiesPerByUser:req.body.accuracy_per,
                admin_marked_status:true,
            }
        }
        )
        console.log(setEvalData, setEvalData1,"?????????")
        var data = await User.findByIdAndUpdate(req.body.user_id,{
           
            $inc: { 'noOfXrayMarkedByAdmin': 1 } })
        console.log(setEvalData)
        
        if (!setEvalData) {
            return res.send({
                success: false,
                message: "Please wait, this image is not evaluated by the dentist."
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
        console.log(getData, "record+++")
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

exports.razorpayOrder = async (req, res) => {
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

    try {
        var options = {
            amount: (req.body.amount), //amount recieved should be in paise form which is already done in frontend
            // amount: (req.body.amount) * 100,
            currency: "INR",
            receipt: req.body.receipt
        }
        razorpay.orders.create(options, (error, order) => {
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
        })
    } catch (error) {
        console.log("Error in order", error);
        return res.send({
            success: false,
            message: messages.ERROR
        });
    }
};

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
                console.log(error.response);
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

exports.razorpayOrderComplete = async (req, res) => {

    if (!req.body.razorpay_payment_id) {
        return res.send({
            success: false,
            message: "Please enter payment id."
        });
    }
    if (!req.body.razorpay_signature) {
        return res.send({
            success: false,
            message: "Please enter payment signature."
        });
    }
    if (!req.body.user_id || req.body.user_id == "") {
        return res.send({
            success: false,
            message: "Please enter user id."
        });
    }

    if (!req.body.pricing_plan_id || req.body.pricing_plan_id == "") {
        return res.send({
            success: false,
            message: "Please enter pricing plan id."
        });
    }
    try {
        let paymentDocument = null;

        let getPricingPlan = await subscription.findOne({
            '_id': req.body.pricing_plan_id,
        });
        //console.log(getPricingPlan.pricing_amount,"getPricingPlan");
        let pricingPrice = getPricingPlan.amount;
        let subscriptionDays = getPricingPlan.type;
        let subscriptionName = getPricingPlan.plan_name;
        if (!pricingPrice || pricingPrice == "") {
            return res.send({
                success: false,
                message: "Please enter pricing price."
            });
        }
        if (!subscriptionDays || subscriptionDays == "") {
            return res.send({
                success: false,
                message: "Please enter subscription days."
            });
        }
        if (subscriptionDays == "monthly") {
            subscriptionDays = 30
        }
        if (subscriptionDays == 'yearly') {
            subscriptionDays = 365
        }
        // let getUserSubscription = await User_subscription.findOne({
        //     'user_id': req.body.user_id,
        //     'status': 'active',
        // });
        // if (getUserSubscription != null) {
        //     return res.send({
        //         success: false,
        //         message: "Subscription of this user already available"
        //     });
        // }
        try {
            paymentDocument = await new Promise((resolve, reject) => {
                razorpay.payments.fetch(req.body.razorpay_payment_id).then((paymentDocument) => {
                    resolve(paymentDocument);
                }).catch(err => {
                    reject(err);
                })
            });
        } catch (error) {
            console.log(error)
        }
        if (paymentDocument != null) {
            //console.log("paymentDocument " + JSON.stringify(paymentDocument),req);
            const hmac = crypto.createHmac('sha256', config.razorpay_key_secret);
            hmac.update(paymentDocument.order_id + "|" + paymentDocument.id);
            let generatedSignature = hmac.digest('hex');

            Date.prototype.addDays = function (d) {
                this.setHours(this.getHours() + d * 24);
                return this;
            };
            let startDate = new Date();
            let endDate = new Date().addDays(subscriptionDays);

            if (generatedSignature == req.body.razorpay_signature) {
                let addOrder = {

                    subscription_id: req.body.sub_id,
                    end_date: req.body.end_date,
                    start_date: req.body.start_date,
                    status: true,
                    payment_status: req.body.payment_status,
                    transction_id: paymentDocument.id,
                    order_id: paymentDocument.order_id,
                    razorpay_signature: req.body.razorpay_signature,
                    payment_timeEpoc: paymentDocument.created_at,
                };
                /*addOrder = {
                      user_id: req.body.user_id,
                      //total_amount: req.body.total_amount, 
                      payment_status: req.body.payment_status,
                      transction_id: paymentDocument.id,
                      order_id: paymentDocument.order_id,
                      razorpay_signature: req.body.razorpay_signature,
                      payment_timeEpoc: paymentDocument.created_at,
  
                      pricing_plan_id: req.body.pricing_plan_id,
                      pricing_price: pricingPrice,
                      subscription_days: subscriptionDays,
                      subscription_name: subscriptionName,
                      subscription_status: req.body.subscription_status,
                      start_date: startDate,
                      end_date: endDate,
                      status: req.body.status,
                created_by: req.body.user_id,}*/

                let userData = await User.find({
                    _id: req.body.user_id
                });
                var updateUserSubs = await User.findOneAndUpdate({
                    _id: req.body.user_id,
                    role: 'dentist'
                }, {
                    $set: {

                        'subscription_details.subscription_id': req.body.sub_id,
                        'subscription_details.end_date': req.body.end_date,
                        'subscription_details.start_date': req.body.start_date,
                        'subscription_details.status': true,
                        'subscription_details.payment_status': req.body.payment_status,
                        'subscription_details.transction_id': paymentDocument.id,
                        'subscription_details.order_id': paymentDocument.order_id,
                        'subscription_details.razorpay_signature': req.body.razorpay_signature,
                        'subscription_details.payment_timeEpoc': paymentDocument.created_at,

                    },
                    $push: {
                        all_subscription_details: addOrder
                    },


                });
                console.log(updateUserSubs)
                var pay_time = moments((paymentDocument.created_at) * 1000).tz("Asia/Kolkata").format("DD/MM/YYYY h:mm:ss A")
                let subject = `Payment Successfull`
                let message = `Your  payment is successful.<br>
                Transction id : ${paymentDocument.id}<br>
                Order id : ${paymentDocument.order_id}<br>
                Subscription Price : ${pricingPrice}<br>
                Payment time : ${pay_time}<br>`

                let pdfData = {
                    "paymentDocument": paymentDocument,
                    "getPricingPlan": getPricingPlan,
                    "updateRespo": updateUserSubs,
                    "trans": req.body,
                    "pay_time": pay_time,
                    "user": userData[0]
                };
                if (userData[0].email !== undefined) {
                    var html = pdfContent.pdf_invoice(pdfData);
                    var options = { format: 'A4' };
                    var filename = `${paymentDocument.order_id}_invoice.pdf`;
                    var invoicePath = path.join(__dirname, `../${filename}`);
                    pdf.create(html, options).toFile(`${invoicePath}`, function (err, res) {
                        if (err) {
                            return console.log(err);
                        }
                        else {
                            //  mailer.sendEMailAttachemt(userData[0].email, subject, mailContent.user_subscription_mail(req.body.username, message, 'Digital Pehchan Subscription!'), filename, filename);
                        }
                    });
                }


                return res.send({
                    success: true,
                    message: "Payment successfull."
                });
            }
            return res.send({
                success: false,
                message: "Payment cancelled."
            });
        }
    } catch (error) {
        console.log("Error in order payment", error);
        return res.send({
            success: false,
            message: messages.ERROR
        });
    }
};

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
                'url': 'https://admin-scm.blahworks.tech/predict',
                'headers': {
                    
                'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Headers': "*",
                },
              
            
                formData: {
                    'file':  {
                    'value': fs.createReadStream('public/'+url),
                    'options': {
                      'filename': url,
                      'contentType': type
                    }
                  }
                }
              };
              request(options,async function (error, response) {
                if (error) throw new Error(error);
                else{
                    console.log(JSON.parse(response.body));
               // console.log(JSON.parse(response.body));
                apiData = JSON.parse(response.body);
                console.log(apiData.boxes, "apiData")
              
                let data={
                    xray_id: req.body.xray_id,
                 // "ai_identified_cavities.rectangle_coordinates": apiData.boxes,
                }
                var setEvalData = await Evaluation(data).save();
                console.log(setEvalData, "?????????");
                let boxes = [];
                for(let coords of apiData.boxes){
                     boxes.push({
                        coordinates: coords
                    })
                }
                var setAI = await Evaluation.findOneAndUpdate({
                    xray_id: req.body.xray_id,
                },
                {
                    $set:{
                        "ai_identified_cavities.rectangle_coordinates": boxes,
                        "ai_identified_cavities.color_labels": apiData.labels,
                        "ai_identified_cavities.model_version": apiData.model_version,
                        "ai_identified_cavities.accuracy_score": apiData.scores

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
                    getData:setAI
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
exports.updateAIMarking = async(req,res) =>{
    try{
        if(req.body.xray_id==""){
            return res.send({
                success: false,
                message: "Please enter xray idh."
            });
        }
        var setEvalData = await Evaluation.findOneAndUpdate({
            xray_id: req.body.xray_id,
        },{
            $set:{
            "ai_identified_cavities.rectangle_coordinates" : req.body.ai_cavities,
        }}
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
            getData:setEvalData
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

exports.setFlag = async (req,res) =>{
    try{
         if(req.body.id==""){

          return res.send({
                success: false,
                message: "Please enter user id."
            });
        }

        var data= await User.findOneAndUpdate({
            _id: req.body.id,
        },{
            $set:{
            flag : req.body.flag,
        }}
        );
        if(!data)
        {
            return res.send({
                success: false,
                message: "error in set flag"
            }); 
        }
        else{
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