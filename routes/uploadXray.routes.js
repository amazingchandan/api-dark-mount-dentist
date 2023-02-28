const express = require('express');
const router = express.Router();
const { uploadXray, getXray } = require('../controllers/uploadXray.controller')
const { validateUploadXray } = require('../validators/uploadXray.validator')

// router.get('/', () => {
//     console.log('Upload X-ray!');
// });

router.get('/get-xray', getXray);
router.post('/upload-xray', validateUploadXray, uploadXray);

module.exports = router;