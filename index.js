jQuery(function(){
	var flow	= Flow();
	flow.seq(function(next, err, result){
		console.log("all loaded")
	});
	
	var url		= "template/index.html";
	jQuery.get(url, function(data) {
		console.log("url", url, data)
		var options	= {
			requireWebGL	: true
		};
		var prefix	= "<? var options = "+JSON.stringify(options)+"; ?>\n";
		var result	= ShortTagjs.process(prefix + data);
		console.log("result", result)
	});
});

jQuery(function(){
	return;
	var zip		= new JSZip();
	zip.add("Hello.txt", "Hello World\n");

	//var content	= zip.generate();
	//location.href	="data:application/zip;base64,"+content;

	Downloadify.create('downloadify',{
		filename: function(){
			return "threejsboilerplate.zip";
		},
		data: function(){ 
			return zip.generate();
		},
		onComplete: function(){ 
			alert('Your File Has Been Saved!'); 
		},
		onCancel: function(){ 
			alert('You have cancelled the saving of this file.');
		},
		onError: function(){ 
			alert('You must put something in the File Contents or there will be nothing to save!'); 
		},
		transparent: false,
		swf		: 'vendor/downloadify/media/downloadify.swf',
		downloadImage	: 'vendor/downloadify/images/download.png',
		width		: 100,
		height		: 30,
		transparent	: true,
		append		: false,
		dataType	: 'base64'
	});
})