var main	= new Main();
/**
 * 3 steps...
 * 1. setup options
 * 2. build bundle
 * 3. download bundle
*/

var templateProcess	= function(template, data){
	data		= data	|| {};
	var lines	= template.split(/\n/);
	var jscode	= "";
	lines.forEach(function(line){
		var matches	= line.match(/^[ \t]*\/\/\?[ \t](.*)/);
		if( matches ){
			jscode	+= matches[1] + "\n";
		}else{
			line	= line.replace(/"/g, "\\\"");
			jscode	+= "_buffer += \""+line+"\\n\"\n";
		}	
	})
	return eval("(function(){\n var data = "+JSON.stringify(data)+";\n var _buffer = '';\n"+jscode+"\nreturn _buffer;\n})()");
}

//jQuery("#boilerplateOptions input").change(function(){
//	jQuery('#downloadButton').attr('disabled', 'disabled');
//});
//
//jQuery("#boilerplateOptions").submit(function(){
//	var form	= jQuery("#boilerplateOptions");
//	var data	= {
//		requireWebGL	: jQuery("[name='requireWebGL']", form).is(':checked')
//	};
//	console.log("data", JSON.stringify(data));
//	
//	jQuery('#downloadButton').attr('disabled', null);
//	return false;
//})

jQuery(function(){
	return;
	jQuery.ajax({
		url	: "template/prout.html",
		dataType: "text"
	}).success(function(template){
		var data	= {
			requireWebGL	: true
		};
		var output	= templateProcess(template, data);
		console.log("output", output)
	});
});

jQuery(function(){
	return;
	var flow	= Flow();
	var zip		= new JSZip();
	var dstDirname	= "boilerplate/"

	templateFilelist.forEach(function(fileName){
		flow.seq(function(next, err, result){
			var baseUrl	= "template/threejsboilerplate/";
			var fileUrl	= baseUrl+fileName;
			// console.log("start loading", fileUrl);
			jQuery.ajax({
				url	: fileUrl,
				dataType: "text"
			}).error(function(jqXHR, status){
				console.assert(false, "ERROR loading " + fileName)
			}).success(function(content){
				// console.log("file", fileName, "loaded... adding content to zip")
				var dstName	= dstDirname + fileName;
				var folderName	= dstName.substr(0, dstName.lastIndexOf('/'));
				zip.folder(folderName);
				zip.add(dstName, content);
				next();
			});
		});
	});
	
	flow.seq(function(next, err, result){
		// console.log("all files loaded... generating zip")
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
		transparentf	: false,
		swf		: 'vendor/downloadify/media/downloadify.swf',
		downloadImage	: 'vendor/downloadify/images/download.png',
		width		: 100,
		height		: 30,
		transparent	: true,
		append		: false,
		dataType	: 'base64'
	});
})