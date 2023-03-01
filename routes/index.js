var index = require('../controllers/index.controller');
var express = require('express');
var router = express.Router();
const user = require('./user.js');
//admin
router.get('/',function(req,res){
    console.log("test");
})
router.post('/login', index.loginUser);
//router.get('/admin/logout', index.getLogout);
router.post('/adminRegistration', index.setAdminUser);
router.get("/getUserRecordList",index.getUserRecordList);
router.get("/getUserRecordById",index.getUserRecordByID);
router.post("/setPricingPlan",index.setPricingPlan);
router.get("/getPlanList",index.getPlanList);
router.get("/getPlanById",index.getPlanById);
router.post("/updatePlanById",index.updatePlanById)
router.post("/updateUserById",index.updateUserById);
router.post("/deletePlanById",index.deletePlanById)
router.post("/deleteUserById",index.deleteUserById)
router.post("/getSubscriptionDetail",index.getSubscriptionDetail)
router.use('/user',user);
module.exports = router;
