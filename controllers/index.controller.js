var http = require("http");
//var pdf = require('html-pdf');
const path = require("path");
const fs = require("fs");
var messages = require("../config/messages");
const crypto = require("crypto");
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var bcrypt = require('bcryptjs');

var User = require("../models/user");
const { NORECORD } = require("../config/messages");
const subscription = require("../models/subscription");

//localstorage for token
const LocalStorage = require('node-localstorage').LocalStorage;

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
    if (!req.body.password || req.body.password.trim() == "") {
        return res.send({
            success: false,
            message: messages.PASSWORD
        });
    }
    if (req.body.password.length < 6) {
        return res.send({
            success: false,
            message: messages.PASSWORD_6DIGIT
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
       /* if (result == true) {
            var token = jwt.sign({
                email: req.body.email
            }, config.jwt_secret);
            localStorage.setItem('myToken', token);
            userInfo = {
                id: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                
                role: user.role,
                
            }
            localStorage.setItem('userInfomation', JSON.stringify(userInfo));
        }*/
        //console.log("token : ", token)
        if (result == true) {
            userInfo = {
                id: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                
                role: user.role,
                
            }
            localStorage.setItem('userInfomation', JSON.stringify(userInfo));
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
    //console.log("user bodyyyyyyyyyyyy : ", req.body)
    if (!req.body.first_name || req.body.first_name == "") {
        return res.send({
            success: false,
            message: messages.FIRST_NAME
        });
    }
    if (!req.body.last_name || req.body.last_name == "") {
        return res.send({
            success: false,
            message: messages.LAST_NAME
        });
    }
    if (!req.body.contact_number || req.body.contact_number == "") {
        return res.send({
            success: false,
            message: messages.MOBILE
        });
    }
    if (req.body.contact_number.length != 10) {
        return res.send({
            success: false,
            message: "Mobile number should be of 10 digit."
        });
    }
    if (!req.body.email || req.body.email == "") {
        return res.send({
            success: false,
            message: messages.EMAIL
        });
    }
    var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    if (!regex.test(req.body.email)) {
        return res.send({
            success: false,
            message: messages.INVALID_EMAIL
        });
    }
   /* let emailCheck = await User.findOne({
        'email': req.body.email
    });
    let mobileCheck = await User.findOne({
        'mobile': req.body.mobile
    });
    if (emailCheck != null) {
        if (emailCheck.email === req.body.email) {
            return res.send({
                success: false,
                message: messages.ALREADY_EMAIL_EXIST
            });
        }
    }
    if (mobileCheck != null) {
        if (mobileCheck.contact_number === req.body.contact_number) {
            return res.send({
                success: false,
                message: messages.ALREADY_MOBILE_EXIST
            });
        }
    }*/
    if (!req.body.password || req.body.password == "") {
        return res.send({
            success: false,
            message: messages.PASSWORD
        });
    }
    if (req.body.password.length < 6) {
        return res.send({
            success: false,
            message: messages.PASSWORD_6DIGIT
        });
    }
    // if (!req.body.confirm_password || req.body.confirm_password == "") {
    //     return res.send({
    //         success: false,
    //         message: messages.CONFIRM_PASSWORD
    //     });
    // }
    // if (req.body.password != req.body.confirm_password) {
    //     return res.send({
    //         success: false,
    //         message: messages.MISS_MATCH_PASSWORD
    //     });
    // }
    if (!req.body.role || req.body.role == "") {
        return res.send({
            success: false,
            message: messages.ROLE
        });
    }
    try {
        req.body.password = bcrypt.hashSync(req.body.password, 10);
        userDataSave = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            contact_number: req.body.contact_number,
            email: req.body.email,
            role: req.body.role,
            password: req.body.password,
            user_role: req.body.user_role,
            status: req.body.status,
            address1:req.body.address1,
            address2:req.body.address2,
            city:req.body.city,
            state:req.body.state,
            country:req.body.country,
            pincode:req.body.pincode,
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
    } catch (error) {
        console.log("Error in state", error);
        return res.send({
            success: true,
            message: messages.ERROR
        });
    }
};
 exports.getUserRecordList= async(req,res)=>{
   try{
    let getData = await User.find({
        $or:[{
            role:"dentist",
        }],
    }).sort({_id:-1});
    console.log("getData:",getData)
    if(!getData){
        return res.send({
            success:false,
            message: NORECORD
        });
    }
    return res.send({
        success:true,
        message:"User records for Admin",
        getData: getData
    });
   } catch(error){
    return res.send({
        success:false,
        message:messages.ERROR
    });
   }

 }
 exports.getDentistRecordByID=async(req,res)=>{
    try{
        if(!req.query.dentist_id){
            return res.send({
                success:false,
                message:"please enter Dentist Id"
            });
        }
        var getData =await User.find({
            _id: req.query.dentist_id,
        });
        console.log(getData,"******")
        if(!getData){
            return res.send({
                success:false,
                message: messages.NORECORD
            });
        }
        return res.send({
            success:true,
            message:"Dentist List by Id",
            getData:getData,

        });
    }
    catch(error){
        return res.send({
            success:false,
            message:messages.ERROR
        });
    }
 }
 exports.setPricingPlan=async(req,res)=>{
   if(!req.body.planName ||req.body.planName=="" ){
    return res.send({
        success:false,
        message:"Please enter Plan name"
    });
   }
   if(!req.body.amount ||req.body.amount=="" ){
    return res.send({
        success:false,
        message:"Please enter Pricing Amount"
    });
   }
    try{
        let planCheck =await subscription.findOne({
            'plan_name':req.body.planName,
        });
        if(planCheck != null){
            return res.send({
                success:false,
                message:messages.AlreadyExist
            })
        }
        else{
            let pricingData={
                plan_name:req.body.planName,
                amount:req.body.amount,
                minimum:req.body.min,
                maximum:req.body.max,
                type:req.body.type,
                country:req.body.country,
            }
            var setPlanData= await subscription(pricingData).save();
            console.log(setPlanData)
            if(!setPlanData){
                return res.send({
                    success:false,
                    message:"Error in save plan"
                });
            }
            return res.send({
                success:true,
                message:"Plan added successfully"
            })
        }
        
    }
    catch (error){
        console.log(error)
        res.send({
            success:false,
            message:messages.ERROR
        });
    }
 }