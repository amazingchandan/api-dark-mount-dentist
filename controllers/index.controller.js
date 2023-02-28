var http = require("http");
//var pdf = require('html-pdf');
const path = require("path");
const fs = require("fs");
var messages = require("../config/messages");
const crypto = require("crypto");
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var bcrypt = require('bcryptjs');


const { NORECORD } = require("../config/messages");
var User = require("../models/user");
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
       
        if (result == true) {
            userInfo = {
                id: user._id,
                email: user.email,
<<<<<<< HEAD
                firstname: user.first_name,
                lastname: user.last_name,

=======
                first_name: user.first_name,
                last_name: user.last_name,
                
>>>>>>> 35b65c980f9c05d935a701571b31fb9b2a2f9fbd
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
            address1: req.body.address1,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            pincode: req.body.pincode,
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
<<<<<<< HEAD

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
=======
 exports.getUserRecordList= async(req,res)=>{
   try{
    let getData = await User.find({
        $or:[{
            role:"dentist",
            isActive:"true"
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
 exports.getUserRecordByID=async(req,res)=>{
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
   if(!req.body.plan_name ||req.body.plan_name=="" ){
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
            'plan_name':req.body.plan_name,
        });
        if(planCheck != null){
            return res.send({
                success:false,
                message:messages.AlreadyExist
            })
        }
        else{
            let pricingData={
                plan_name:req.body.plan_name,
                amount:req.body.amount,
                minimum:req.body.minimum,
                maximum:req.body.maximum,
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

 exports.getPlanList=async(req,res)=>{
   try{
       let getData=await subscription.find({
        $or: [{
            status: "active",
        }],
       }).sort({_id:-1})
       if(!getData)
       {
        res.send({
            success:false,
            message:"error in getdata of subscription plan"
        })
       }
       res.send({
        success:true,
        message:'get data of subscription plan',
        getData:getData,
       })
   }
   catch(error){
    res.send({
        success:false,
        message:messages.ERROR
    })
   }

 }
 exports.getPlanById=async(req,res)=>{
    try{
         if(!req.query.subscription_id){
            console.log("not found id ")
            res.send({
                success:false,
                message:"Please enter plan Id"
            })
         }
         console.log(req.query.subscription_id)
         var getData=await subscription.find({
             _id: req.query.subscription_id

         });
         console.log(getData,"record")
         if(!getData)
         {
            res.send({
                success:false,
                message:messages.NORECORD,
            })
         }
         res.send({
            success:true,
            message:"Plan data by Id",
            getData:getData
         })
    }
    catch(error){
        console.log(error)
        res.send({
            success:false,
            message:messages.ERROR
        })
    }
 }
 exports.updatePlanById=async (req,res)=>{
    console.log(req.query.id)
    if(!req.query.id){
    res.send({
        success:false,
        message:"Please Select Id"
    })
   }
   if(!req.body.plan_name||req.body.plan_name==""){
    res.send({
        success:false,
        message:"Please enter Plan name"
    })
   }
   if(!req.body.amount||req.body.amount==""){
    res.send({
        success:false,
        message:"Please enter Plan amount"
    })
   }
   if(!req.body.minimum||req.body.minimum==""){
    res.send({
        success:false,
        message:"Please enter Minimum value"
    })
   }
   if(!req.body.maximum||req.body.maximum==""){
    res.send({
        success:false,
        message:"Please enter Maximum vlaue"
    })
   }
   if(!req.body.type||req.body.type==""){
    res.send({
        success:false,
        message:"Please enter Plan Type"
    })
   }
   if(!req.body.country||req.body.country==""){
    res.send({
        success:false,
        message:"Please enter Country"
    })
   }
 try{
  let planData={
    plan_name:req.body.plan_name,
    amount:req.body.amount,
    minimum:req.body.minimum,
    maximum:req.body.maximum,
    type:req.body.type,
    country:req.body.country,
    status:req.body.status

  }
  var updateData=await subscription.findByIdAndUpdate(req.query.id ,planData);
  console.log(req.query.id,"****")
  if(!updateData){
    res.send({
        success:false,
        message:messages.ERROR
    })
  }
  res.send({
    success:true,
    message:"plan updated successfully"
  })
}
  catch(error){
    console.log(error)
    res.send({
        success:false,
        message:messages.ERROR
    })
  }
 }
 exports.updateUserById=async(req,res)=>{
    if(!req.query.dentist_id){
        res.send({
            success:false,
            message:"Please Select Id"
        })
       }
       if(!req.body.first_name||req.body.first_name==""){
        res.send({
            success:false,
            message:"Please enter first name"
        })
       }
       if(!req.body.last_name||req.body.last_name==""){
        res.send({
            success:false,
            message:"Please enter last name"
        })
       }
       if(!req.body.contact_number||req.body.contact_number==""){
        res.send({
            success:false,
            message:"Please enter Minimum value"
        })
       }
       if(!req.body.email||req.body.email==""){
        res.send({
            success:false,
            message:"Please enter Maximum vlaue"
        })
       }
       var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (!regex.test(req.body.email)) {
        return res.send({
            success: false,
            message: "Please enter valid email address."
        });
    }
       if(!req.body.address1||req.body.address1==""){
        res.send({
            success:false,
            message:"Please enter Address1"
        })
       }
       if(!req.body.address2||req.body.address2==""){
        res.send({
            success:false,
            message:"Please enter Address2"
        })
       }
       if(!req.body.city||req.body.city==""){
        res.send({
            success:false,
            message:"Please enter city"
        })
       }
       if(!req.body.state||req.body.state==""){
        res.send({
            success:false,
            message:"Please enter state"
        })
       }
       if(!req.body.country||req.body.country==""){
        res.send({
            success:false,
            message:"Please enter country"
        })
       }
       if(!req.body.pincode||req.body.pincode==""){
        res.send({
            success:false,
            message:"Please enter pincode"
        })
       }
     try{
      let userData={
        first_name:req.body.first_name,
        last_name:req.body.last_name,
                email:req.body.email,
                contact_number:req.body.contact_number,
                address1:req.body.address1,
                 address2:req.body.address2,
                city:req.body.city,
                state:req.body.state,
                country:req.body.country,
                
        pincode:req.body.pincode,
       
    
      }
      var updateData=await User.findByIdAndUpdate(req.query.dentist_id ,userData);
      console.log(req.query.dentist_id,"****")
      if(!updateData){
        res.send({
            success:false,
            message:messages.ERROR
        })
      }
      res.send({
        success:true,
        message:"user updated successfully"
      })
    }
      catch(error){
        console.log(error)
        res.send({
            success:false,
            message:messages.ERROR
        })
      }
 }
 exports.deletePlanById=async(req,res)=>{
   
    console.log(req.query.id)
     if(!req.query.id){
        res.send({
            success:false,
            message:"Please select id"
        })

    }
   
  try{
   var deletePlanData=await subscription.findOneAndUpdate({
        _id: req.query.id
    }, {
        $set: {
            status:"inactive",
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
        message: "Plan Deleted successfully."
    });
   
  }
  catch(error){
    console.log(error)
    res.send({
        success:false,
        message:messages.ERROR
    })
  }
}
exports.deleteUserById=async(req,res)=>{
   
    console.log(req.query.id)
     if(!req.query.id){
        res.send({
            success:false,
            message:"Please select id"
        })

    }
   
  try{
   var deletePlanData=await User.findOneAndUpdate({
        _id: req.query.id
    }, {
        $set: {
            isActive:false,
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
        message: "User Deleted successfully."
    });
   
  }
  catch(error){
    console.log(error)
    res.send({
        success:false,
        message:messages.ERROR
    })
  }
>>>>>>> 35b65c980f9c05d935a701571b31fb9b2a2f9fbd
}