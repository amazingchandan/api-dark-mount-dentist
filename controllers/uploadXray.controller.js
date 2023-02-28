const xray = require('../models/xray');
const multer = require('multer');
const filestorage = multer.diskStorage({
    destination: (res, req, cb) => {
        cb(null, "./public");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '--' + file.originalname)
    }
})

let upload = multer({
    storage: filestorage
})

const getXray = (req, res) => {
    xray.find({}).exec((err, data) => {
        if (err) {
            return res.status(500).send({ error: "Internal server error!" })
        }
        res.status(200).send({ data: data })
    })
}

const uploadXray = (req, res) => {
    const xRay = new xray(req.body);
    req.filename = req.body.xray_image.path;
    console.log(req.filename);

    // upload(req,res,function(err){
    //     if(err){
    //         return res.status(500).send({error: "Internal server error!"})
    //     }
    //     res.status(200).send({message: "Uploaded successfully!"})
    // })

    xRay.save((err, xrayUploaded) => {
        if (err) {
            // console.log(err);
            return res.status(500).send({ error: "Internal server error!" })
        }
        // console.log(xrayUploaded);
        res.status(200).send({ data: "Xray is uploaded!" })
    })
}

module.exports = {
    getXray,
    uploadXray,
}