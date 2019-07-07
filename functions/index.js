'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();


// const senderEmail = functions.config().gmail.login;
// const senderPass = functions.config().gmail.pass;

exports.sendEmail = functions.https.onCall((data,context) => {
	var message= data.text;
	var sendTo = data.sendTo;
	var email = data.sendFrom;
	var password = data.password;
	
// const uid = context.auth.uid;
// const name = context.auth.token.name || null;
// const picture = context.auth.token.picture || null;
// const email = context.auth.token.email || null;
	
	    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        	 user: email,
	         pass: password
        	 }
    });
	    
    const mailOptions = {
        from: email,
        to: sendTo,
        subject: 'Bussiness travel response', 
        text: message, 
        html: message 
    };
    
    const getDeliveryStatus = function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    };

    transporter.sendMail(mailOptions, getDeliveryStatus);
	});