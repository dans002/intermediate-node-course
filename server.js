const express= require('express');
const mongoose= require('mongoose');
const bodyParser= require('body-parser');
const models = require('./models/User');
const User = models.User;
const Address = models.Address;
mongoose.connect('mongodb://localhost/userData');

const port=8000;
const app= express();

const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(bodyParser.json());

app.listen(port, ()=>{
	console.log(`server is listening on port:${port}`)
})

// CREATE
app.post('/users',(req,res)=>{
//    console.log(req.body.newData);
    password = req.body.newData.password;
  setCrypt(req);
  
    Address.create(
        {...req.body.newData.addressStr},
        (err,adata)=>{
            if(err){
                res.json({success:false,message:err});
            } else if(!adata) {
                res.json({success:false,message:"Not Found"});
            } else {
                req.body.newData.address=adata._id;
                User.create(
                    {...req.body.newData},
                            (err,data)=>{sendResponse(res,err,data,password,()=>{res.json({success:true,data:data})})}
                )
            }
        }
    )
})

app.route('/users/:id/:password')
// READ
.get((req,res)=>{
  User.findById(req.params.id).populate('address').exec(
    (err,data)=>{sendResponse(res,err,data,req.params.password,()=>{res.json({success:true, data:data});}
      )}
    )
})
// UPDATE
.put((req,res)=>{
    setCrypt(req);
  User.findByIdAndUpdate(
	req.params.id,
  	{...req.body.newData},
	{new:true},
	(err,data)=>{
        sendResponse(res,err,data,req.params.password,()=>{
            Address.findByIdAndUpdate(
              data.address,
              {...req.body.newData.addressStr},
              {new:true},
              (aerr,adata)=>{sendResponse(res,aerr,adata,req.params.password,()=>{
                  res.json({success:true, data:data});
              })}
              )
        });
    }
  )
})
// DELETE
.delete((req,res)=>{
  User.findByIdAndDelete(
	req.params.id,
	(err,data)=>{
        sendResponse(res,err,data,req.params.password
         ,()=>{Address.findByIdAndDelete(
             data.address,
             (err,data)=>res.json({success:true,data:data}))})
     }
  )
})

function sendResponse(res,err,data,password,func) {
//    console.log(`data:${data}`);
    if(err){
        res.json({success:false,message:err});
    } else if(!data) {
        res.json({success:false,message:"Not Found"});
    } else {
//        console.log(data.password);
        if(!data.password || bcrypt.compareSync(password, data.password)) {
            func();
        } else {
            res.json({success:false,message:"password is wrong"});
        }
    }
}

function setCrypt(req){
    req.body.newData.password = bcrypt.hashSync(req.body.newData.password, saltRounds);
}
