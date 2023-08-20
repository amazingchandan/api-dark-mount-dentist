const index = require('../controllers/index.controller');
const express = require('express');
const router = express.Router();
const user = require('./user.js');
const upload = require('../middleware/multer');
const { auth } = require('../middleware/auth.middleware')
const path = require('path');


router.post('/login', index.loginUser);
//router.get('/admin/logout', index.getLogout);
router.post('/adminRegistration',  index.setAdminUser);
router.get("/getUserRecordList", auth, index.getUserRecordList);
router.get("/getUserRecordById", auth, index.getUserRecordByID);
router.post("/setPricingPlan", auth, index.setPricingPlan);
router.get("/getPlanList", auth, index.getPlanList);
router.get("/getPlanListForPricing", auth, index.getPlanListForPricing);
router.get("/getPlanById", auth, index.getPlanById);
router.get("/getUserXrayById", auth, index.getUserXrayById);
router.get("/getXrayList", auth, index.getXrayList);
router.post("/updatePlanById", auth, index.updatePlanById);
router.post("/updateUserById", auth, index.updateUserById);
router.post("/cancelUserSub", auth, index.cancelUserSub);
router.post("/deletePlanById", auth, index.deletePlanById);
router.post("/deleteUserById", auth, index.deleteUserById);
router.post("/deleteSubsById", auth, index.deleteSubsById);
router.post("/deletePlanIfErrByID", auth, index.deletePlanByIDIfErr)
router.post("/activateSubsById", auth, index.activeSubsById);
router.post("/getSubscriptionDetail", auth, index.getSubscriptionDetail);
router.post("/getSubscriptionRenew", auth, index.getSubscriptionRenew)
router.get("/getXrayById", auth, index.getXrayById);
router.post("/setEvaluatedData", auth, index.setEvaluatedData)
router.post("/setEvaluatedDataFromAdmin", auth, index.setEvaluatedDataFromAdmin)
router.get("/getEvaluationById", auth, index.getEvaluationById);
router.post("/saveEvaluation", auth, upload.fields([{
    name: 'xray_image',
    maxCount: 1
}]), index.saveEvaluation);
router.get("/getUserAllSubListById", auth, index.getUserAllSubListByID);
router.post('/upload-xray', auth, upload.fields([{
    name: 'xray_image',
    maxCount: 1
}]), index.uploadXray);
router.post("/delete-xray/:id", auth, index.deleteXray)
router.use('/user', auth, user);
router.post('/failureTrans', auth, index.transactionFailed)

// Paypal 
// router.post('/create-payment', auth, index.paypalOrder);
// router.get('/success-payment', auth, index.paypalSuccess);
// router.get('/cancel-payment', auth, index.paypalCancel);
// router.get('/paypal-token', auth, index.paypalToken);

// AI Marking APi
router.post('/loadAIMarking', auth, index.loadAIMarking);
router.post('/updateAIMarking', auth, index.updateAIMarking);
//flag
router.post('/setFlag', auth, index.setFlag)
router.get('/noOfSubscriber', auth, index.noOfSubscriber);
router.get('/noOfUnsubscriber', auth, index.noOfUnsubscriber);
router.get('/noOfXrayEval', auth, index.noOfXrayEval);
router.get('/noOfXrayNotEval', auth, index.noOfXrayNotEval);
router.get('/noOfPlans', auth, index.noOfPlans);
router.get('/amtEarned', auth, index.amtEarned);

//user-dashboard
router.get('/noOfXrayById', auth, index.getNoOfXrayById);
router.get('/noOfXrayEvalById', auth, index.getNoOfXrayEvalById);
router.get('/noOfCavitiesByAIofUser', auth, index.getNoOfCavitiesByAIofUser);
router.get('/userPlanById', auth, index.getUserPlanById);
router.post('/resetPassword', auth, index.resetPassword);
router.get('/cavitiesCountOfAI', auth, index.cavitiesCountOfAI);

// countries
router.get('/countries', auth, index.getCountries)
router.post('/countries-states', auth, index.getStateByCountries)

// accuracy percentage
router.get('/accuracyPercentageSystem', auth, index.accuracyPerSys);

module.exports = router;
