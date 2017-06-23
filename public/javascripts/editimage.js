document.addEventListener('DOMContentLoaded',main);

function main (){
	var edit = document.getElementById('editbtn');
	editbtn.addEventListener('click',function(event){
		event.preventDefault();
		var req = new XMLHttpRequest();
		
		var user = document.getElementById('user').value;
		var gifslug = document.getElementById('slug').value;
		var url="/editimage?slug="+gifslug;
	/* 	if (process.env.NODE_ENV == 'PRODUCTION')
			url="http://i6.cims.nyu.edu:16391/userdetails/"+user+"/"+gifslug;
		else
			url="http://localhost:3000/userdetails/"+user+"/"+gifslug; */
		req.open("GET",url,true);
		req.addEventListener('load',function(){
			if (req.status >=200 && req.status < 400){
				//Creating AJAX interaction for making edits.
				var jsoninfo = JSON.parse(req.responseText);
				console.log(jsoninfo);
				console.log("Title: "+jsoninfo.title)
				var formadd = document.createElement('form');
				formadd.setAttribute('method','POST');
				formadd.setAttribute('action','/editimage');
				formadd.setAttribute('id','addedform');
				var submitbtn = document.createElement('input');
				submitbtn.setAttribute('type','submit');
				submitbtn.setAttribute('value','Submit Edits');
				submitbtn.setAttribute('name','action');
				submitbtn.setAttribute('id','submit');
				var cancelbtn = document.createElement('input');
				cancelbtn.setAttribute('type','submit');
				cancelbtn.setAttribute('value','Cancel Edits');
				cancelbtn.setAttribute('name','action')
				cancelbtn.setAttribute('id','cancel');
				var titletext = document.createElement('input');
				titletext.setAttribute('type','text');
				titletext.setAttribute('value',jsoninfo[0].title);
				titletext.setAttribute('name','title');
				var titlenode=document.createElement('div').appendChild(document.createTextNode('Title '));
				var urltext = document.createElement('input');
				urltext.setAttribute('type','text');
				urltext.setAttribute('value',jsoninfo[0].url);
				urltext.setAttribute('name','url');
				var urlnode=document.createElement('div').appendChild(document.createTextNode('URL '));
				var tagtext = document.createElement('input');
				tagtext.setAttribute('type','text');
				tagtext.setAttribute('value',jsoninfo[0].tags);
				tagtext.setAttribute('name','tags')
				var tagsnode=document.createElement('div').appendChild(document.createTextNode('Tags '));
				var privatebox = document.createElement('input');
				privatebox.setAttribute('type','checkbox');
				privatebox.setAttribute('value','true');
				var privacynode=document.createElement('div').appendChild(document.createTextNode('Private? '));
				if(jsoninfo[0].privacy)
					privatebox.setAttribute('checked',"");
				privatebox.setAttribute('name','privacy');
				var hiddenslug = document.createElement('input');
				hiddenslug.setAttribute('type','hidden');
				hiddenslug.setAttribute('name','slug');
				hiddenslug.setAttribute('value',gifslug);
				var titlelabel = document.createElement('div');
				titlelabel.setAttribute('class','formlabel');
				titlelabel.appendChild(titlenode);
				formadd.appendChild(titlelabel);
				
				var titletextbox = document.createElement('div');
				titletext.setAttribute('class','textbox');
				titletextbox.appendChild(titletext);
				formadd.appendChild(titletextbox);
				
				var urllabel = document.createElement('div');
				urllabel.setAttribute('class','formlabel');
				urllabel.appendChild(urlnode);
				formadd.appendChild(urllabel);
				
				var urltextbox = document.createElement('div');
				urltext.setAttribute('class','textbox');
				urltextbox.appendChild(urltext);
				formadd.appendChild(urltextbox);
				
				var tagslabel = document.createElement('div');
				tagslabel.setAttribute('class','formlabel');
				tagslabel.appendChild(tagsnode);
				formadd.appendChild(tagslabel);
				
				var tagstextbox= document.createElement('div');
				tagtext.setAttribute('class','textbox');
				tagstextbox.appendChild(tagtext);
				formadd.appendChild(tagstextbox);
				
				var privatepart = document.createElement('div');
				privatepart.setAttribute('class','formlabel');
				privatepart.appendChild(privacynode);
				privatepart.appendChild(privatebox);
				formadd.appendChild(privatepart);

				formadd.appendChild(hiddenslug);
				submitbtn.setAttribute('class','button');
				formadd.appendChild(submitbtn);
				cancelbtn.setAttribute('class','button');
				formadd.appendChild(cancelbtn);
				formadd.setAttribute('style','text-align:center;margin-bottom:7px');
				var editform = document.getElementById('editdelete');
				document.body.insertBefore(formadd,editform);
				
				var edit=document.getElementById('edit');
				edit.setAttribute('style','display:none;');
				
				
				//Adding event listener to the Cancel Edits Button
				var cancel= document.getElementById('cancel');
				cancel.addEventListener('click',function(event){
					event.preventDefault();
					var editform = document.getElementById('edit');
					editform.removeAttribute('style');
					var addedform=document.getElementById('addedform');
					addedform.parentNode.removeChild(addedform);
				});
			}
		});
		
		req.addEventListener('error',function(e){
			document.body.appendChild(document.createTextNode('uh-oh, something went wrong '+e));
		});
		req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		req.send();

	
	});
	
};