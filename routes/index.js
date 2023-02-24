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
router.post('/admin-user', index.setAdminUser);
router.get("/getUserRecordList",index.getUserRecordList);
router.get("/getDentistRecordById",index.getDentistRecordByID);
router.post("/setPricingPlan",index.setPricingPlan)
router.use('/user',user);
module.exports = router;

