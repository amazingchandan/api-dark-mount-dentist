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
router.post("/updatePlanById", index.updatePlanById);
router.post("/updateUserById", index.updateUserById);
router.post("/cancelUserSub", index.cancelUserSub);
router.post("/deletePlanById", index.deletePlanById);
router.post("/deleteUserById", index.deleteUserById);
router.post("/getSubscriptionDetail", index.getSubscriptionDetail)

router.post('/upload-xray', upload.fields([{
    name: 'xray_image',
    maxCount: 1
}]), index.uploadXray);
router.use('/user', user);
module.exports = router;
