const express=require('express')
const mongoose=require('mongoose')

const app=express()

mongoose.connect('mongodb://localhost:27017/cred')

const userSchema=mongoose.Schema({
  name:String,
  username: String,
  pw: String
})

const userModel = mongoose.model("users", userSchema)

app.get("/getUsers",(req,res)=>{
  res.json(userModel.find({}).then(function(users){
    res.json(users)
  })).catch(function(err){
    console.log(err)
  })
})
app.listen(8080, ()=> { 
  console.log("Server is running on port 8080");
})