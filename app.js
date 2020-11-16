const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const AWS = require("aws-sdk");
const fs = require("fs");
const fileUpload = require("express-fileupload")

const app = express();

app.use(fileUpload());

let awsConfig = {
    "region": "ap-south-1",
    "endpoint": "https://dynamodb.ap-south-1.amazonaws.com",
    "accessKeyId": 
};

s3 = new AWS.S3({accessKeyId:"AKIAWYHVLUHLSKX5BV4K", secretAccessKey : "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"});

//AWS.config.update(awsConfig);

let docClient = new AWS.DynamoDB.DocumentClient(awsConfig);

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');

app.post("/register",function(req,res){
	let save = function () {

    var params = {
        TableName: "users",
        Item:  {
        	"email" : req.body.email,
        	"firstname" : req.body.fname,
        	"lastname" : req.body.lname,
        	"password" : req.body.password
        }
    };
    docClient.put(params, function (err, data) {

        if (err) {
            console.log("users::save::error - " + JSON.stringify(err, null, 2));                      
        } else {
            console.log("users::save::success" );                      
        }
    });
}

save();
res.redirect("/");
        
})

app.post("/signin",function(req,res){
	var email = req.body.email;
	var pass = req.body.password;
    var params = {
        TableName: "users",
        Key:{
            "email" : email
        }
    };
    docClient.get(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {

        if(pass===data.Item.password){
        	res.redirect("/upload")
        }
    }
    })
        
})

app.post("/upload",function(req,res){
    console.log(req.files)
    if(!req.files || Object.keys(req.files).length==0){
        return res.status(400).send("No file was uploaded!");
    }

    let sampleFile = req.files.sampleFile
    let name = sampleFile.name
    sampleFile.mv("uploads/"+name,(err)=>{
        if(err){
            return res.status(500).send(err)
        }
        const fileContent = fs.readFileSync("uploads/"+name)
        const s3Parameters = {
            Bucket : "mydrivebucket",
            Key : name,
            Body : fileContent
        };
        s3.upload(s3Parameters,function(err,data){
            if(err){
                console.log(err)
                res.send("error")
            }
            else{
                console.log(data)
                fs.unlinkSync("uploads/"+name)
                res.redirect("/upload?uploaded=1")
            }
        })
    })
})

app.get("/",function(req,res){
	res.render("home",{});
})

app.get("/register",function(req,res){
	res.render("register",{})
})

app.get("/signin",function(req,res){
	res.render("signin",{})
})

app.get("/upload",function(req,res){
    console.log()
	res.render("upload",{query:req._parsedOriginalUrl.query})
})

app.listen("3000",function(req,res){
	console.log("Server running on port 3000!");
})