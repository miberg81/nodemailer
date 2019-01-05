//import express framework
const express = require("express");

//import express templating engine to use in node app
const exphbs = require("express-handlebars");

//import body-parser to parse POST stream into req.body object we can access
const bodyParser = require("body-parser");

//import the emailing service for node js
const nodemailer = require("nodemailer");

//import a helper to deal with paths
const path = require("path");

//initialize the app to become an instance of express server framework
const app = express();

//point to the templating engine library
app.engine("handlebars", exphbs());
//choose handlebars as the preferred template engine to use
app.set("view engine", "handlebars");

//setup body-parser middleware
// parse POST/GET request body of type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse POST/GET request body of type:application/json
app.use(bodyParser.json());

//setup a folder for static files likes css,client side js etc
app.use("/public", express.static(path.join(__dirname, "public")));

/*create a route for the GET request to the root folder on the server
The request object holds the GET/POST request from the client
The response object holds the response to client*/
app.get("/", (req, res) => {
  res.render("contact"); //respond to request with rendering contact form on the client
});

//create POST route for the submission of the form
app.post("/send", (req, res) => {
  console.log(req.body); //body-parser has passed the post stream to req.body object

  /*create output string using es6 back-tick (` `) syntax.
    This is the format that the recipient with see in his inbox*/
  const output = `
        <p>You have a new contact request</p>
        <h1>Contact details</h1>
        <ul>
            <li>First Name: ${req.body.firstName}</li>
            <li>Last Name: ${req.body.familyName}</li>
            <li>Phone number: ${req.body.phone}</li>
            <li>Email: ${req.body.email}</li>
        </ul> 
        <h3> Message:</h3>
        <p>${req.body.message}</p>
    `;

  //create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    //service: "Gmail",
    host: "smtp.gmail.com", //Connect to smtp.gmail.com on port 465, if you're using SSL
    port: 587, // Connect on port 587 if you're using TLS.
    secure: false, // true for 465, false for other ports
    auth: {
      //email server credentials
      user: "mibergdev@gmail.com",
      pass: "*********"
    },
    //prevent rejection in case the email is not sent directly from SMTP account (if we send from localhost).
    tls: {
      rejectUnauthorized: false
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"NodeMailer" <miberdev.gmail.com>', // sender address
    to: "mibergdev@gmail.com", // list of receivers
    subject: "Contact request", // Subject line
    // text: 'Hello world?', // plain text body
    html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.render("contact", {
        msg: "There was an error sending the email. Please try again later"
      });
      return;
    }

    console.log("Message sent: %s", info.messageId);
    //in case of success render the contact form with the success message in it
    res.render("contact", { msg: "Email has been sent successfully" });

  });
});

//the port the app will listen to requests
const port = 3000;

//The app starts a server and listens on the defined port for connections
app.listen(port, () => console.log("server started..."));
