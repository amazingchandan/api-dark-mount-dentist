const mongoose = require("mongoose");
const User = require('../models/user');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/dark_mountain_dentist', {}).then(() => { 
    console.log('MONGO CONNECTION OPEN!!!');
}).catch((err) => { 
    console.log(err);
});


const createSuperadminSeed = async () => {
    let d1 = new Date('2023/04/30')
    let d2 = new Date('2023/05/30')
    try {
    //   const dataBody = {
    //     first_name: 'ken',
    //     last_name: 'kaneki',
    //     email: 'ken@yopmail.com',
    //     password: 'Aa@12345',
    //     age: 34,
    //     city: "Indore",
    //     role: "admin",
    //   }
      const dataBody = {
        "first_name":"ken",
        "last_name":"kaneki",
        "email":"kk@yopmail.com",
        "password":"Aa@12345",
        "role":"dentist",
        "subscription_details.status":true,
        "subscription_details.country":"India",
        "subscription_details.plan_name":"gold",
        "subscription_details.amount":30,
        "subscription_details.type":"Monthly",
        "subscription_details.start_date":d1,
        "subscription_details.end_date":d2,
        "subscription_details.subscription_id":"646f0c2da173661368f52e2f",
        "flag":0,
        "noOfXrayUploaded":0,
        "noOfXrayEvaluated":0,
        "noOfXrayMarkedByAdmin":0,
        "all_subscription_details[0].status":true,
        "all_subscription_details[0].country":"India",
        "all_subscription_details[0].plan_name":"gold",
        "all_subscription_details[0].amount":30,
        "all_subscription_details[0].type":"Monthly",
        "all_subscription_details[0].start_date":d1,
        "all_subscription_details[0].end_date":d2,
        "all_subscription_details[0].subscription_id":"646f0c2da173661368f52e2f",
        "city":"Tokyo",
        "contact_number":1237894650,
        "country":"Japan",
        "license_no":"rln2135468",
        "pincode":546879,
        "state":"Tokyo"
      }

      const hashedPassword = await bcrypt.hash('Aa@12345', 12);
      dataBody.password = hashedPassword;
      const isAlreadyExist = await User.findOne({email: dataBody.email});
     
      if (!isAlreadyExist) {
        const addSuperadmin = await new User(dataBody).save();
        if (!addSuperadmin) {
          throw new Error("Not able to add user");
        } else {
          console.log("User created successfully");
        }
      } else {
        throw new Error("User email already exists");
      }
    } catch (err) {
      console.error(err);
    }
  }

  createSuperadminSeed().then(() => {
  
  })