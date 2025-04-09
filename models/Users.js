const mongoose=require('mongoose')

const UserSchema = mongoose.Schema({
    firstName: {type:String,required:true},
    lastName: {type:String,required:true},
    email:{type:String,required:true},
    phoneNumber: {type:Number,required:true},
    password:{type:String,required:true},
    confirmPassword:{type:String,require:true},
})

module.exports=mongoose.model('User',UserSchema)