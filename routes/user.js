var express = require('express');
var user = require('../controllers/user.controller');
var router = express.Router();
var index = require('../controllers/index.controller');
const verifyToken = require('../middleware/auth.middleware');

// detecting existing user
router.head("/create", user.detectingUser);

/*GET users listing. */
router.get('/login/:id', verifyToken, index.getLogin);
router.get('/get', user.getUser);

/**
 * Create User
 * Created At: 
 * 
 */
<<<<<<< HEAD
router.post('/create', user.setUser);

// forget password 
router.put('/reset', user.resetPwd);

module.exports = router;
=======
//router.post('/', user.setUser);

module.exports = router;
>>>>>>> 35b65c980f9c05d935a701571b31fb9b2a2f9fbd
