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
router.post("/getSubscriptionDetail", index.getSubscriptionDetail)
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