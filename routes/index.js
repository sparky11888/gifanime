var express = require('express');
var router = express.Router();
var mongoose=require('mongoose');
var db=require('./../db');
var path = require('path');
var publicPath = path.resolve(__dirname,"public");
var fs = require('fs');
var uuid = require('node-uuid');
var sentiment = require('sentiment');
var userprofiles=mongoose.model('user');
var gif = mongoose.model('gif');
var validurl = require('valid-url');

function rankpost (gif,rank){
	this.gif=gif,
	this.rank=rank
}
var currentuser;
// var posts = mongoose.model('posts');
var publicposts = [];
var populated = false;
/* GET home page. */
router.get('/', function(req, res, next) {
	if (!populated){
		gif.find(function(err, gifs,count){
			publicposts = gifs;
		//	console.log(gifs)
			home();
		});
		populated=true;
	}
	else{
		home();
	}
	
	function home () {
		if (req.session.user!=""&&req.session.user!=undefined){
			console.log("User: "+req.session.user);
			res.render('index', {title: 'gifAnime',message:req.session.loginmess,loginstatus:'Logout',loginlink:'/logout', user:req.session.user, error:req.session.error, posts:publicposts});
			req.session.loginmess ="";
			req.session.error="";
		}
		else{
			res.render('index', {title: 'gifAnime',loginstatus:'Login',loginlink:'/login',loginmess:req.session.loginmess,error:req.session.error,posts:publicposts});
			req.session.error="";
			req.session.loginmess="";
		}
	}
})

router.get('/searchresults', function(req,res,next){
	var searchquery = req.query.search;
	var resultsposts = [];
	for (var i = 0 ; i < publicposts.length;i++){
		//console.log("Public Post: ", publicposts[i]);
		var rank = calculaterank (publicposts[i],searchquery);
		//console.log("Rank: "+rank);
		var newrankpost = new rankpost (publicposts[i],rank);
		var position = insertlocation(newrankpost.rank,0,resultsposts.length,resultsposts);
		//console.log("Position: "+ position);
		resultsposts.splice(position,0,newrankpost);
		//console.log("Added into Resultsposts...", resultsposts);
	};
		
	if (req.session.user!=""&&req.session.user!=undefined){
		res.render('search',{title: 'gifAnime',loginstatus:'Logout',loginlink:'/logout',loginmess:req.session.loginmess,error:req.session.error,search:searchquery,posts:resultsposts,user:req.session.user});
	}
	else{
		res.render('search',{title: 'gifAnime',loginstatus:'Login',loginlink:'/login',loginmess:req.session.loginmess,error:req.session.error,search:searchquery,posts:resultsposts});
	}
	
	
	function insertlocation (elementrank,start, end, resultposts){
		//console.log("Numbers: ",elementrank,start,end)
		var mid = Math.floor((start + end)/2);
		//console.log("Middle: ",mid);
		if (resultsposts.length==0){
			return 0;
		}
		else if (end-start<=1||resultposts[mid].rank==elementrank){
			return mid;
		}
		else {
			if (elementrank > resultposts[mid].rank)
				return insertlocation(elementrank,start, mid,resultposts);
			else{
				return insertlocation(elementrank, mid, end,resultposts);
			}
		}
	}
	function calculaterank (post,search){
		var tags = post.tags;
		var title = post.title;
		var searchwords = search.split(" ");
		var points = 10;
		var rank = 0;
		for (var i = 0 ; i < searchwords.length;i ++ ){
			for (var j = 0; j<tags.length;j++){
				var tagwords = tags[j].split(" ");
				//console.log("comparing: "+tags[j]+" "+searchwords[i]);
				if (tags[j]==searchwords[i])
					 rank+=points;
				for(var k = 0; k < tagwords.length;k++){
					if (tagwords[k]==searchwords[i])
					 rank+=(points/2);
					if (tagwords[k].toLowerCase()==searchwords[i])
						rank+=(points/3);
				}
				 
			}
			var titlearray = title.split(" ");
			for (var j = 0; j<titlearray.length;j++){
				//console.log("comparing: "+titlearray[j]+" "+searchwords[i]);
				if(titlearray[j]==searchwords[i])
					rank+=points;
			}
			points/=2;
			//for (var )
			//cycle through the tags and title word by word and see which has the most matches. Then, less points the further the word is down the search query...
		}
		return rank;
	}
})

router.get('/login',function(req,res,next){
	res.render('login',{title:'Login',error:req.session.error});
	req.session.error="";
})
router.post('/login',function(req,res,next){
	if (req.body.username==""||req.body.password==""){
		res.render('login',{title:'Login',error:"You didn't enter a username or password"});
	}
	else{
		userprofiles.findOne({user:req.body.username}, function (err,u,count){
			if (u==null)
				res.render('login',{title:'Login',error:"That username does not exist"});
			else{
				if (u.pass!=req.body.password){
					res.render('login',{title:'Login',error:"You did not enter a matching username and password"});
				}
				else{
					req.session.user=req.body.username;
					req.session.loginmess = "Successfully Logged In!";
					res.redirect('/');
				}
			}
		})
	}
});
router.get('/createlogin',function(req,res,next){
	res.render('createprofile',{title:'Create User Profile'});
});
router.post('/createlogin',function(req,res,next){
	if (req.body.firstname=="" || req.body.lastname=="" || req.body.email=="" || req.body.password=="" || req.body.username==""){
		res.render('createprofile',{title:'Create User Profile', error:"You didn't fill in all the fields"});
	}
	else{
		var newprofile = new userprofiles ({
			user: req.body.username,
			pass: req.body.password,
			email: req.email,
			firstname: req.firstname,
			lastname: res.lastname,
			joindate: Date.now(),
			sentimentavg: 0
		})
		userprofiles.findOne({user:newprofile.user},function(err, u, count){
			if (u==null){
				newprofile.save (function(err,gif,count){
					console.log("Profile Created and Saved");
					res.redirect('/');
				})
			}
			else{
				res.render('createprofile',{title:'Create User Profile', error:"That username already exists. :/"});
			}
				
		})
		
	}
});
router.get('/logout',function(req,res,next){
	if (req.session.user ==""||req.session.user==undefined){
		req.session.error="You need to login";
		res.redirect("/login");
	}
	req.session.user="";
	req.session.error="Logged Out";
	res.redirect('/');
});

router.get('/uploadgifs', function(req,res,next){
	if (req.session.user ==""||req.session.user==undefined){
		req.session.error="You need to login";
		res.redirect("/login");
	};
	console.log(req.session.user);
	res.render('upload',{title:'gifAnime',head:'Upload Gifs',user:req.session.user,loginlink:'/logout',loginstatus:'Logout'});
})

router.post('/uploadgifs', function (req,res,next){
	console.log("Post: "+req.session.user);
	if (req.session.user ==""||req.session.user==undefined){
		req.session.error="You need to login";
		res.redirect("/login");
	}
	else if (req.body.title=="" || req.body.url==""){
		var post=[];
		res.render('upload',{title: 'gifAnime',head:'Upload Gifs',upload:post,error:"You didn't completely fill in the form to upload the image",user:req.session.user,loginlink:'/logout',loginstatus:'Logout'})
	}
	else if (!validurl.isWebUri(req.body.url)){
		var post=[];
		res.render('upload',{title: 'gifAnime',head:'Upload Gifs',upload:post,error:"The url you used is not valid!! >:(",user:req.session.user,loginlink:'/logout',loginstatus:'Logout'})
	}
	else {
		
		userprofiles.findOne({user:req.session.user},function(err,u,count){
			console.log("User: "+u);
			var date = new Date();
			var datestring = (date.getMonth()+1) +"/"+date.getDate()+"/"+date.getFullYear();
			//console.log("PRIVACY: "+ req.body.private);
			var privacy;
			if(req.body.private==undefined)
				privacy=false;
			else
				privacy=true;
			var gifpost = new gif ({
				title: req.body.title,
				url: req.body.url,
				date: datestring,
				id: uuid.v1(),
				privacy: privacy
			});
			var tagswords = req.body.tags.split(",");
			var fintagswords = [];
			//console.log(tagswords);
			for (var i = 0 ; i < tagswords.length;i++){
				if (fintagswords.indexOf(tagswords[i])==-1)
					fintagswords.push(tagswords[i]);
			}
			gifpost.tags=fintagswords;
			gifpost.sentiment=calculatesentiment(gifpost.tags,gifpost.title);
			console.log("Post Sentiment: "+gifpost.sentiment);
			if (!gifpost.privacy){
				console.log("Added to Public Posts");
				publicposts.unshift(gifpost);
				gifpost.save(function(err,newgif,count){
					console.log("Saved new Post into Gif database");
					console.log("Error: "+err);
					console.log("Count: "+count)
				});
			}
			u.posts.unshift(gifpost);
			u.markModified('posts');
			console.log("CurrentSentiment: "+u.sentimentavg);
			u.sentiment=updatesentiment(gifpost.sentiment, u.posts.length, u.sentimentavg);
			u.save(function(err,newuser, count){
				console.log("Saved Post into user profile")
			
				res.redirect('/userdetails/'+req.session.user);
			//	console.log("POOP 4")
			});	
		}); 
		/* userprofiles.find(function(err,u,count){
			console.log(u);
		}) */
	}

	function updatesentiment (newsentiment, num, currsentiment){
		return (currsentiment+newsentiment)/num;
	};
})

function calculatesentiment (tags,title){
	var sum = 0;
	var num = 0;
	sum+=sentiment(title).comparative;
	num++;
	for(var i = 0; i < tags;i ++){
		sum += sentiment (tags[i]).comparative;
		num++;
	}
	return sum/num;
}
router.get('/userdetails/:user', function(req,res,next){
	userprofiles.findOne({user:req.params.user},function(err,u,count){
		console.log("Session User: "+req.session.user,req.params.user)
		console.log("Found: "+u);
		if (u != null&&req.session.user==u.user){
			res.render('userprofile',{title:'User Profile',user:u,loginlink:'/logout',loginstatus:'Logout'});
		}
		else if (req.session.user!= u.user){
			console.log("You are not logged in");
			req.session.error = "You are not Logged in!";
			res.redirect('/404');
		}
		else{
			res.redirect('/404');
		}
	});

});

router.get('/404', function(req,res,next){
	/* res.render ('404',{title:"This page doesn't exist or can't be accessed  :'(. Redirecting to Homepage...", error: req.session.error});
	//setTimeout(function(){}, 3000);
	req.session.error=""; */
	res.redirect('/');
})
 
router.get ('/userdetails/:user/:gifslug',function(req,res,next){
	if (req.session.user ==""||req.session.user==undefined){
		req.session.error="You need to login";
		res.redirect("/login");
	}
	userprofiles.findOne({user:req.params.user},function(error, u, count){
		console.log("Session User: "+req.session.user)
		if (u!=null&&req.session.user==u.user){
			var rendered = false;
			var gifpostarray = u.posts.filter(function (ele){
				return ele.gifslug==req.params.gifslug;
			})
			var gifpost=gifpostarray[0];
			console.log("GifPOST: "+gifpost);
			if (gifpost==undefined){
				res.redirect('/404');
			}
			else{
				res.render('imagedetails',{title:'gifAnime',head:'GIF Details', upload:gifpost, user:req.session.user,loginlink:"/logout",loginstatus:'Logout',error:req.session.error});
				rendered= true;
				req.session.error="";
			}
			if (!rendered){
				res.redirect('/404');
			} 
			
		}
		else{
			req.session.error="You are not Logged in!";
			res.redirect('/404');
		}
	});
})

router.post ('/deleteimage',function(req,res,next){
	if (req.session.user ==""||req.session.user==undefined){
		req.session.error="You need to login";
		res.redirect("/login");
	}
	userprofiles.findOne({user:req.session.user}, function(error, u, count){
		var gifs = u.posts;
		//console.log("User: "+ u);
		//console.log("Slug "+ req.body.slug);
		var postarray = gifs.filter(function(g){
			return g.gifslug==req.body.slug;
		});
		var post =postarray[0];
		//console.log("POSTS: "+post);
		var i = gifs.indexOf(post);
		//console.log("Index: "+ i);
		gifs.splice(i,1);
		u.markModified('posts');
		var sentiment= u.sentiment*(u.posts.length+1);
		sentiment = (sentiment - post.sentiment)/u.posts;
		u.sentiment=sentiment;
		u.markModified('sentiment');
		 var publicpostsdeletearr = publicposts.filter(function(ele){
			return ele.gifslug == req.body.slug;
		});
		var publicpostsdelete=publicpostsdeletearr[0]
		i = publicposts.indexOf(publicpostsdelete);
		publicposts.splice(i,1); 
		/* gif.findOne({gifslug:req.body.slug},function(error, g, count){
			g.remove();
			g.save(function(error, u, count){});
		}) */
		
		gif.remove({gifslug:req.body.slug},function(error,g,count){
			console.log("Removed: "+g);
		});
		u.save(function(error, u, count){
			res.redirect('/userdetails/'+req.session.user);
		});
	});
	
	
})
router.get ('/editimage',function(req,res,next){
	if (req.session.user ==""||req.session.user==undefined){
		req.session.error="You need to login";
		res.redirect("/login");
	}
	userprofiles.findOne({user:req.session.user}, function(error, u, count){
		var gifs = u.posts;
		console.log(u);
		console.log("Slug: "+req.query.slug);
		var editpostarray = gifs.filter(function(ele){
			return ele.gifslug == req.query.slug;
		});
		var editpost = editpostarray[0];
		console.log(editpost);
		res.json([{
			"title": editpost.title,
			"url":editpost.url,
			"tags":editpost.tags.toString(),
			"privacy":editpost.privacy
		}]);
	});
});
router.post('/editimage',function(req,res,next){
	if (req.session.user==""||req.session.user==undefined){
		req.session.error="You need to login";
		res.redirect('/login');
	}
	var title = req.body.title;
	var url = req.body.url;
	var tags = req.body.tags;
	var privacy;
	//console.log("PRIVAATTE: "+req.body.privacy);
	console.log("Edit Form Edits: "+title,url,tags,privacy);
	if (req.body.title==undefined||req.body.title==""||req.body.url==undefined||req.body.url==""){
		req.session.error = "You didn't completely fill out the edit form!";
		res.redirect('/userdetails/'+req.session.user+"/"+req.body.slug);
	}
	else if (!validurl.isWebUri(req.body.url)){
		req.session.error = "You entered a faulty url!! >:(";
		res.redirect('/userdetails/'+req.session.user+"/"+req.body.slug);
	}
	else{
		if (req.body.privacy==undefined)
			privacy=false;
		else
			privacy=true;
	//	console.log("RESULTS: "+privacy);
	//	console.log("HERE1");
		//console.log(title, url,tags, privacy);
	//	console.log("HEREe2:");
		//console.log("Current User: "+req.session.user)
		userprofiles.findOne({user:req.session.user},function(error,u,count){
			var gifslug = req.body.slug;
			//console.log(gifslug);
			var gifposts = u.posts;
			var postarray = gifposts.filter(function(ele){
				return ele.gifslug==gifslug
			});
			var post = postarray[0];
			if (post.title!=title||post.tags!=tags.split(",")){
				var sentiment=calculatesentiment(tags.split(","),title);
				if (sentiment != post.sentiment){
					var sum = u.sentiment*u.posts.length;
					sum = sum - post.sentiment + sentiment;
					u.sentiment = sum / u.posts.length;
				}
			}
			post.url=url;
			post.tags = tags.split(",");
			post.title = title;
			var date = new Date ();
			var datestring = (date.getMonth()+1) +"/"+date.getDate()+"/"+date.getFullYear();
			post.date = datestring;
			if (post.privacy!=privacy){
				if (privacy){
					 var publicpostsdeletearray = publicposts.filter(function(ele){
						return ele.gifslug == req.body.slug;
					});
					var publicpostsdelete=publicpostsdeletearray[0]
					i = publicposts.indexOf(publicpostsdelete);
					publicposts.splice(i,1); 
					/* gif.findOne({gifslug:req.body.slug},function(error, g, count){
						g.remove();
						g.save(function(error, u, count){});
					}) */
					gif.remove({gifslug:req.body.slug},function(error,g,count){
						console.log("Deleted: "+ g);
					});
				}
				else{
					var addgif = new gif ({
						title:post.title,
						url:post.url,
						date: post.date,
						tags: post.tags,
						privacy: privacy,
						gifslug: req.body.slug,
						id: req.body.slug, 
						sentiment: post.sentiment
					});
					addgif.save(function(error, newgif,count){});
					var newpublicpostsarray = publicposts.filter(function(ele){
						return ele.gifslug == addgif.gifslug;
					})
					var newpublicposts=newpublicpostsarray[0];
					if (newpublicposts==undefined)
						publicposts.unshift(addgif);
				}
			}
			else{
				if (!privacy){
					var publicpostedit = publicposts.filter (function(ele){
						return ele.gifslug==gifslug;
					});
					var publicpost= publicpostedit[0];
					var publicindex= publicposts.indexOf(publicpost);
					publicposts[publicindex].url=url;
					publicposts[publicindex].tags =tags.split(",");
					publicposts[publicindex].title=title;
					gif.findOne({gifslug:req.body.slug},function(err,g,count){
						g.url=url;
						g.tags=tags.split(",");
						g.title=title;
						g.markModified('url');
						g.markModified('title');
						g.markModified('tags');
						g.save(function(error,g,count){
							console.log("Updated publicpost gif base");
						});
					});
				}
				
			}
			post.privacy = privacy;
			u.markModified('posts');
			u.markModified('sentiment');
			u.save(function(err,newpost,count){
				res.redirect('/userdetails/'+req.session.user);
			});
		});
	}
});
module.exports = router;
