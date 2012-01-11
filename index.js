/**
 * 3 steps...
 * 1. setup options
 * 2. build bundle
 * 3. download bundle
*/
jQuery(function(){
	var flow	= Flow();
	var zip		= new JSZip();

	templateFilelist.forEach(function(fileName){
		flow.seq(function(next, err, result){
			var baseUrl	= "template/threejsboilerplate/";
			var fileUrl	= baseUrl+fileName;
			console.log("start loading", fileUrl);

			//jQuery.get(fileUrl, "text")
			jQuery.ajax({
				url	: fileUrl,
				dataType: "text"
			}).error(function(jqXHR, status){
				console.log("ERROR loading", fileName, "argument", arguments);
			}).complete(function(jqXHR, status){
				console.assert(status === "success" )
				var content	= jqXHR.responseText;
				var folderName	= fileName.substr(0, fileName.lastIndexOf('/'));
				//console.log("loaded file", fileName, content);

				zip.folder(folderName);
				zip.add(fileName, content);

				next();
			});
		});
	});
	
	flow.seq(function(next, err, result){
		var content	= zip.generate();
		location.href	="data:application/zip;base64,"+content;
	});
});


jQuery(function(){
	return;
	var zip		= new JSZip();
	zip.add("Hello.txt", "Hello World\n");
	zip.folder("css");
	zip.add("css/main.css", "body {}\n");

	//var content	= zip.generate();
	//location.href	="data:application/zip;base64,"+content;
	//return;

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