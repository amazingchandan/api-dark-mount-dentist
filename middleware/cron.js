const cron = require('node-cron');
const cronHelper = require('../middleware/cron-helper');
const moment = require('moment');
const moments = require('moment-timezone');

exports.cronJob = () => {
    let _cronStartTime = moments(Date.now()).tz("Asia/Kolkata").format("DD/MM/YYYY h:mm:ss A")

    console.log('cronjob start at ...' + _cronStartTime);
    
    // every 2min
    // cron.schedule('*/1 * * * *', cronHelper.sendRenewalEmail);
    // Everyday 11AM 

    // daily activity email
    cron.schedule('0 22 * * * 0', cronHelper.sendDailyReminder);
    // cron.schedule('*/2 * * * * ', cronHelper.sendDailyReminder);

    // reminder for pending subscription
    cron.schedule('0 22 * * * 0', cronHelper.sendReminderForPendingSubs);
    // cron.schedule('*/2 * * * * ', cronHelper.sendReminderForPendingSubs);

    // renewal email
    cron.schedule('0 22 * * * 0', cronHelper.sendRenewalEmail);
    // cron.schedule('*/2 * * * * ', cronHelper.sendRenewalEmail);

    // cron.schedule('0 22 * * * 0', cronHelper.paypalTransaction);
    cron.schedule('*/15 * * * * ', cronHelper.paypalTransaction);

}