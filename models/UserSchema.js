var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username:{type:Number,required:true,min:1000000,max:9999999,index:{unique:true}},
	roll:String,
    firstname:{type:String,required:true},
    secondname:{type:String,required:true},
    password: String,
    verifycode:{code:{type:Number}},
    isVerified:{type:Boolean,default:false},
    img:{type:String,default:"profile.png"},
    comments:[{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    ratings:[{type: mongoose.Schema.Types.ObjectId, ref: 'Rating'}]
});
UserSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model("User", UserSchema);