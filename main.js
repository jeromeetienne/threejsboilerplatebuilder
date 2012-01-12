/** @namespace */
var Main	= function()
{
	this._jszip	= new JSZip();

	jQuery("#boilerplateOptions").submit(function(){
	     	this._buildZip();
		return false;
	}.bind(this));
	jQuery("#boilerplateOptions input").change(function(){
		this._downloadDisable();
	}.bind(this));
}

Main.prototype.destroy	= function()
{	
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

Main.prototype._buildZip	= function()
{
	var flow	= Flow();
	var dstDirname	= "boilerplate/"
	
	templateFilelist.forEach(function(fileName){

if( fileName.match(/.*.gitignore/) )	return;

		flow.seq(function(next, err, result){
			var baseUrl	= "template/threejsboilerplate/";
			var fileUrl	= baseUrl+fileName;
			console.log("start loading", fileUrl);
			jQuery.ajax({
				url	: fileUrl,
				dataType: "text",
				cache	: false, 
			}).error(function(jqXHR, status){
				console.assert(false, "ERROR loading " + fileName)
			}.bind(this)).success(function(content){
				console.log("file", fileName, "loaded... adding content to zip")
				
				if( fileName === "./index.html" ){
					var tmplOptions	= this._collectOptions();
					content		= this._templateProcess(content, tmplOptions);
					console.log("content", fileName, content)
				}
				
				var dstName	= dstDirname + fileName;
				var dirName	= dstName.substr(0, dstName.lastIndexOf('/'));
				this._jszip.folder(dirName);
				this._jszip.add(dstName, content);
				next();
			}.bind(this));
		}.bind(this));
	}.bind(this));
	
	flow.seq(function(next, err, result){
		// console.log("all files loaded... generating zip")
		//var content	= this._jszip.generate();
		//location.href	="data:application/zip;base64,"+content;
		this._downloadEnable();
	}.bind(this));
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

Main.prototype._templateProcess	= function(template, data){
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
	jscode	= "(function(){\n var data = "+JSON.stringify(data)+";\n var _buffer = '';\n"
			+ jscode
			+ "\nreturn _buffer;\n})()";
	console.log("jscode", jscode);
	return eval(jscode);
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

Main.prototype._collectOptions	= function()
{
	var form	= jQuery("#boilerplateOptions");
	var radio	= function(name){
		return jQuery("[name='"+name+"']", form).is(':checked')
	};
	var options	= {
		requireWebGL	: radio('requireWebGL'),
		includeStatsjs	: radio('includeStatsjs')
	};
	console.log("data", JSON.stringify(options));
	return options;
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

Main.prototype._downloadEnable	= function()
{
	//jQuery('#downloadButton').attr('disabled', null);
	Downloadify.create('downloadify',{
		filename: function(){
			return "threejsboilerplate.zip";
		},
		data: function(){ 
			return this._jszip.generate();
		}.bind(this),
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
}

Main.prototype._downloadDisable	= function()
{
	//jQuery('#downloadButton').attr('disabled', 'disabled');	
	jQuery('#downloadify').empty().text("no download");	
}

