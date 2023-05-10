var index = require('../controllers/index.controller');
var express = require('express');
var router = express.Router();
const user = require('./user.js');
var upload = require('../middleware/multer');

//admin
router.get('/', function (req, res) {
    console.log("test");
})
router.post('/login', index.loginUser);
//router.get('/admin/logout', index.getLogout);
router.post('/adminRegistration', index.setAdminUser);
router.get("/getUserRecordList", index.getUserRecordList);
router.get("/getUserRecordById", index.getUserRecordByID);
router.post("/setPricingPlan", index.setPricingPlan);
router.get("/getPlanList", index.getPlanList);
router.get("/getPlanById", index.getPlanById);
router.get("/getUserXrayById", index.getUserXrayById);
router.get("/getXrayList",index.getXrayList);
router.post("/updatePlanById", index.updatePlanById);
router.post("/updateUserById", index.updateUserById);
router.post("/cancelUserSub", index.cancelUserSub);
router.post("/deletePlanById", index.deletePlanById);
router.post("/deleteUserById", index.deleteUserById);
router.post("/getSubscriptionDetail", index.getSubscriptionDetail);
router.post("/getSubscriptionRenew", index.getSubscriptionRenew)
router.get("/getXrayById",index.getXrayById);
router.post("/setEvaluatedData",index.setEvaluatedData)
router.post("/setEvaluatedDataFromAdmin",index.setEvaluatedDataFromAdmin)
router.get("/getEvaluationById", index.getEvaluationById);
router.get("/getUserAllSubListById", index.getUserAllSubListByID);
router.post('/upload-xray', upload.fields([{
    name: 'xray_image',
    maxCount: 1
}]), index.uploadXray);
router.use('/user', user);
module.exports = router;

//Razorpay payment
router.post('/order', index.razorpayOrder);
router.post('/subscriptionOrder', index.razorpayOrderComplete);

// Paypal 
router.post('/create_payment', index.paypalOrder);
router.get('/success_payment', index.paypalSuccess);
router.get('/cancel_payment', index.paypalCancel);

// AI Marking APi
router.post('/loadAIMarking',index.loadAIMarking);
router.post('/updateAIMarking',index.updateAIMarking);
//flag
router.post('/setFlag',index.setFlag)
router.get('/noOfSubscriber',index.noOfSubscriber);
router.get('/noOfUnsubscriber',index.noOfUnsubscriber);
router.get('/noOfXrayEval',index.noOfXrayEval);
router.get('/noOfXrayNotEval',index.noOfXrayNotEval);
router.get('/noOfPlans',index.noOfPlans);
router.get('/amtEarned',index.amtEarned);
//user-dashboard
router.get('/noOfXrayById',index.getNoOfXrayById);
router.get('/noOfXrayEvalById',index.getNoOfXrayEvalById);
router.get('/noOfCavitiesByAIofUser',index.getNoOfCavitiesByAIofUser);
router.get('/userPlanById',index.getUserPlanById);
router.post('/resetPassword',index.resetPassword)

// countries
router.get('/countries', index.getCountries)
router.post('/countries-states', index.getStateByCountries)