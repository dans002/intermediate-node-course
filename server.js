const express= require('express');
const mongoose= require('mongoose');
const bodyParser= require('body-parser');
const models = require('./models/User');
const User = models.User;
const Address = models.Address;
const AddressSchema = models.AddressSchema;
mongoose.connect('mongodb://localhost/userData');

const port=8000;
const app= express();

const bcrypt = require('bcrypt');
const saltRounds = 10;

const jwt = require('jsonwebtoken');
const secret = "jsonwebtoken";

app.use(bodyParser.json());
//app.use((req,res,next)=>{console.log('Time:', Date.now());next()})


app.listen(port, ()=>{
	console.log(`server is listening on port:${port}`)
})

app.route('/login/:email/:password')
// login
.put((req,res)=>{
    console.log("1");
    User.find({email:req.params.email},
              (err,data)=>{sendResponse(res,err,data[0],req.params.password,()=>{res.json({success:true, data:jwt.sign({email:req.params.email}, secret)});})}
              );
})

// authentication
.get((req,res)=>{
    console.log("2");
//    console.log(req.query.token);
//    jwt.verify(req.query.token, secret, (err, data)=>{sendResponse(res,err,data,"",()=>{res.json({success:true, data:'Welcome back ' + data.email})})});
    email = authenticate(req,res,req.query.token);
    res.json({success:true, data:'Welcome back ' + email});
})

// authentication
function authenticate(req,res,token) {
    console.log(token);
    var email;
    jwt.verify(req.query.token, secret, (err, data)=>{sendResponse(res,err,data,"",()=>{email = data.email})});
    return email;
}

// use express middleware to authenticate
//app.use('/users', (req,res,next)=>{
//    console.log('Time:', Date.now());
//    var email = authenticate(req,res,req.query.token);
//    console.log('email:', email);
//    if(email) {
//        next();
//    }
//})

//AddressSchema.pre('save', function(next) {
//  // do stuff
//  next();
//});

// CREATE
app.post('/users',(req,res)=>{
//    console.log("AddressSchema", AddressSchema);
    // use mongoose model middleware to authecticate
    
//    const AddressSchema2 = new mongoose.Schema({
//        postcd: {type: Number},
//        room: {type: String}
//    });
    
    AddressSchema.post('save', function(address){
        console.log('Time:', Date.now());
        
        var email = authenticate(req,res,req.query.token);
        console.log('email:', email);
        if(email) {
            return new Promise((resolve, reject) => {
              reject(new Error('something went wrong'));
            });
        }
    });
    
//    const Address2 = mongoose.model('Address2', AddressSchema2);
    
    Address.create({...req.body.newData.addressStr}).then(address=>Address.findById(address)).then(address=>res.json({success:true, data:address}));
    
    
//    console.log(req.body.newData);
//    password = req.body.newData.password;
//  setCrypt(req);
//  
//    Address.create(
//        {...req.body.newData.addressStr},
//        (err,adata)=>{
//            if(err){
//                res.json({success:false,message:err});
//            } else if(!adata) {
//                res.json({success:false,message:"Not Found"});
//            } else {
//                req.body.newData.address=adata._id;
//                User.create(
//                    {...req.body.newData},
//                            (err,data)=>{sendResponse(res,err,data,password,()=>{res.json({success:true,data:data})})}
//                )
//            }
//        }
//    )
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
    console.log(`data:${data}`);
    if(err){
        res.json({success:false,message:err});
    } else if(!data) {
        res.json({success:false,message:"Not Found"});
    } else {
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


app.post('/test',(req,res)=>{
    const schema = new mongoose.Schema({ title: String, loadedAt: Date });

    schema.pre('init', pojo => {
//      assert.equal(pojo.constructor.name, 'Object'); // Plain object before init
        console.log("pojo:", pojo);
    });

    const now = new Date();
    schema.post('save', doc => {
//      assert.ok(doc instanceof mongoose.Document); // Mongoose doc after init
        console.log("doc:", doc)
      doc.loadedAt = now;
    });

    const Test = mongoose.model('Test', schema);

    return Test.create({ title: 'Casino Royale' }).
      then(doc => Test.findById(doc)).
      then(doc => res.json({success:true, data:doc}));
})
