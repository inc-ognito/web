var mongoose = require("mongoose");
var RatingSchema = new mongoose.Schema({
		_creator : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		rating:{type:Number,default:0,min:0,max:5},
		ratingdate:{type:Date,default:Date.now}
	});
module.exports = mongoose.model("Rating", RatingSchema);
