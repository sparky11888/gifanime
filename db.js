var mongoose = require ('mongoose');
var URLSlugs = require('mongoose-url-slugs');
var slug = require('mongoose-slug-generator');
// is the environment variable, NODE_ENV, set to PRODUCTION? 
if (process.env.NODE_ENV == 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 var fs = require('fs');
 var path = require('path');
 var fn = path.join(__dirname, 'config.json');
 var data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 var conf = JSON.parse(data);
 var dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
// dbconf = 'mongodb://localhost/gifanime';
	dbconf = process.env.MONGOLAB_URI;
}
mongoose.plugin(slug);
mongoose.connect(dbconf);

var Schema = mongoose.Schema;

var gif = new Schema({
	title: String,
	tags: [String],
	url: String,
	date: String,
	privacy: Boolean,
	sentiment: Number,
	id: String,
	gifslug: {type: String, slug:"id"}
})
//gif.plugin(URLSlugs('title url'));

 var user = new Schema ({
	posts: [gif],
	user: String,
	pass: String,
	email: String,
	firstname: String,
	lastname: String,
	search: [String],
	joindate: String,
	sentimentavg: Number,
	userslug: {type: String, slug:"user"}
}) 

mongoose.model('gif', gif);
mongoose.model('user',user);
