const dotenv = require('dotenv')
dotenv.config();

module.exports = {
   admin_jwt_secret: "THISISSECRETJWTTOKEN#98546465",
   user_jwt_secret: "THISISSECRETJWTTOKEN#87546489",
   razorpay_key_id: "rzp_test_llXrMfq95r3LMF",
   razorpay_key_secret: "So3lXaXwyab44P96oRrUEdoO",
   OAUTH_REFRESH_TOKEN: process.env.OAUTH_REFRESH_TOKEN,
   OAUTH_CLIENTID: process.env.OAUTH_CLIENTID,
   OAUTH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET,
   MY_REFRESH_TOKEN: process.env.MY_REFRESH_TOKEN,
   DRIVE_CLIENT_ID: process.env.DRIVE_CLIENT_ID,
   DRIVE_CLIENT_SECRET: process.env.DRIVE_CLIENT_SECRET,
   DRIVE_REDIRECT_URI: process.env.DRIVE_REDIRECT_URI,
   //! needs to update every 7 day
   DRIVE_REFRESH_TOKEN: '1//042Wt-UGQJDMGCgYIARAAGAQSNwF-L9Ir0Q_Dkh8N5AFlJaue3BmsRxc95nhcS20D-02NloEHwYHhUQ_yUsp4TAXQxrTELPyCh2E',
   EMAIL_SERVICE: process.env.EMAIL_SERVICE,
   EMAIL_ID: process.env.EMAIL_ID,
   EMAIL_PWD: process.env.EMAIL_PWD,
   PAY_CLIENT_ID: process.env.PAY_CLIENT_ID,
   PAY_CLIENT_SECRET_KEY: process.env.PAY_CLIENT_SECRET_KEY,
   PAY_PROD_ID: process.env.PAY_PROD_ID,
   MAIL_LOGO: '/../public/logo/arti-image.png'
}