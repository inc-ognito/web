var mongoose = require("mongoose");
var CommentSchema = new mongoose.Schema({
	_creator : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	commentdata:{type:String,default:null},
	commentdate:{type:Date,default:Date.now}
});
module.exports = mongoose.model("Comment", CommentSchema);
