/** @namespace */
var Main	= function()
{
	this._jszip		= new JSZip();
	this._filesContent	= {};
	this._buildOnPreloaded	= false;

	this._preloaded		= false;
	jQuery('#preloadStatus .section').hide().filter('.progress').show();

	this._preloadStart();

	this._buildEnable();
	this._downloadDisable();
	
	jQuery("#boilerplateOptions").submit(function(){
		if( this._preloaded ){
		     	this._buildZip();			
		}else{
			this._buildOnPreloaded	= true;
			jQuery('#boilerplateOptions .section').hide();
			jQuery('#boilerplateOptions .section.pending').show();
		}
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

Main.prototype._preloadStart	= function()
{
	var flow	= Flow();
	var dstDirname	= "boilerplate/"

	templateFilelist.forEach(function(fileName){

// TODO this seems to be a github workaround.. not sure at all
// retest
if( fileName.match(/.*.gitignore/) )	return;

		flow.seq(function(next, err, result){
			var baseUrl	= "template/threejsboilerplate/";
			var fileUrl	= baseUrl+fileName;
			//console.log("start loading", fileUrl);
			jQuery.ajax({
				url	: fileUrl,
				dataType: "text" 
			}).error(function(jqXHR, status){
				console.assert(false, "ERROR loading " + fileName)
			}.bind(this)).success(function(content){
				//console.log("file", fileName, "preloaded...")
				this._filesContent[fileName]	= content;
				// to download slower
				// setTimeout(function(){ next() }, 30)
				next();
			}.bind(this));
		}.bind(this));
	}.bind(this));
	
	flow.seq(function(next, err, result){
		this._onPreloaded();
	}.bind(this));
}

Main.prototype._onPreloaded	= function()
{
	this._preloaded	= true;
	jQuery('#preloadStatus .section').hide();
	jQuery('#preloadStatus .section.done').show();

	if( this._buildOnPreloaded ){
		this._buildOnPreloaded	= false;
		this._buildZip();
	}
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

		flow.par(function(next, err, result){
			var content	= this._filesContent[fileName];
			//console.log("processing", fileName)
			
			// TODO should not be hardcoded
			if( fileName === "./index.html" ){
				var tmplOptions	= this._collectOptions();
				content		= this._templateProcess(content, tmplOptions);
				//console.log("content", fileName, content)
			}
			
			var dstName	= dstDirname + fileName;
			var dirName	= dstName.substr(0, dstName.lastIndexOf('/'));
			this._jszip.folder(dirName);
			this._jszip.add(dstName, content);
			next();
		}.bind(this));
	}.bind(this));
	
	flow.seq(function(next, err, result){
		// console.log("all files loaded... generating zip")
		//var content	= this._jszip.generate();
		//location.href	="data:application/zip;base64,"+content;
		this._downloadEnable();

		jQuery('#boilerplateOptions .section').hide();
		jQuery('#boilerplateOptions .section.idle').show();
	}.bind(this));
}

Main.prototype._buildEnable	= function()
{
	jQuery('#boilerplateOptions input[type="submit"]').attr('disabled', null);

	jQuery('#boilerplateOptions .section').hide();
	jQuery('#boilerplateOptions .section.idle').show();
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
	//console.log("jscode", jscode);
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
	// show section
	jQuery('#downloadStatus .section').hide().filter('.enable').show();
	// enable downloadify
	Downloadify.create('downloadify',{
		filename: function(){
			return "threejsboilerplate.zip";
		},
		data: function(){
			return this._jszip.generate();
		}.bind(this),
		onComplete: function(){ 
			console.log('Your File Has Been Saved!'); 
		},
		onCancel: function(){ 
			console.log('You have cancelled the saving of this file.');
		},
		onError: function(){ 
			console.log('You must put something in the File Contents or there will be nothing to save!'); 
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
	// show section
	jQuery('#downloadStatus .section').hide().filter('.disable').show();
	// remove downloadify if needed
	jQuery('#downloadify').empty();
}

