/** @namespace */
var Main	= function()
{
	this._jszip		= new JSZip();
	this._filesContent	= {};
	this._buildOnPreloaded	= true;	// false;

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
	jQuery("#boilerplateOptions input").add("#boilerplateOptions select").change(function(){
		// disable the download as it is now invalid
		this._downloadDisable();
		// rebuild for live update
		if( this._preloaded )	this._buildZip();			
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

	origFileList.forEach(function(fileName){

// FIXME this seems to be a github workaround.. not sure at all - to retest
if( fileName.match(/.*.gitignore/) )	return;

		flow.seq(function(next, err, result){
			var hasTmpl	= tmplFileList.indexOf(fileName) !== -1 ? true : false;
			var baseUrl	= "data/boilerplate."+ (hasTmpl ? "tmpl/" : "orig/");
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
				//setTimeout(function(){ next() }, 60)
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
	
	origFileList.forEach(function(fileName){

// FIXME this seems to be a github workaround.. not sure at all - to retest
if( fileName.match(/.*.gitignore/) )	return;

		flow.par(function(next, err, result){
			var content	= this._filesContent[fileName];
			//console.log("processing", fileName)
			
			var hasTmpl	= tmplFileList.indexOf(fileName) !== -1 ? true : false;
			if( hasTmpl ){
				var tmplOptions	= this._collectOptions();
				content		= this._templateProcess(content, tmplOptions);
				console.log("content", fileName, content);

// FIXME write the preview cleanly
// handle preview  
(function(content){
	var baseUrl	= window.location.href;
	// remove hash part if any
	baseUrl		= baseUrl.replace(window.location.hash, '');
	content	= content.replace(/src="/g	, "src=\""	+baseUrl + "./data/boilerplate.orig/")
	content	= content.replace(/href="/g	, "href=\""	+baseUrl + "./data/boilerplate.orig/")
	//console.log("content", content);
	// build the data url itself
	var url = "data:text/html;base64,"+window.btoa(content);
	// create the iframe for the preview
	jQuery('#buildPreview').empty();
	jQuery("<iframe>").attr({
		allowfullscreen	: true,
		webkitallowfullscreen	: true,
		mozallowfullscreen	: true,
		src	: url,
		width	: "100%",
		height	: "320px"
	}).appendTo('#buildPreview');	
}(content));
			}
			
			var dstName	= dstDirname + fileName;
			var dirName	= dstName.substr(0, dstName.lastIndexOf('/'));
			this._jszip.folder(dirName);
			this._jszip.add(dstName, content);
			next();
		}.bind(this));
	}.bind(this));
	
	flow.seq(function(next, err, result){
		//console.log("all files loaded... generating zip")
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
	var value	= function(name){ return jQuery("[name='"+name+"']", form).val();		};
	var checkbox	= function(name){ return jQuery("[name='"+name+"']", form).is(':checked');	};
	var radio	= function(name){ return jQuery("[name='"+name+"']:checked", form).val();	};
	var options	= {
		requireWebGL		: checkbox('requireWebGL'),
		includeStatsjs		: checkbox('includeStatsjs'),

		cameraType		: radio('cameraType'),
		cameraControl		: radio('cameraControl'),

		objectMaterial		: radio('objectMaterial'),
		objectGeometry		: radio('objectGeometry'),

		nDirectionalLights	: parseInt(value("nDirectionalLights")),
		nPointLights		: parseInt(value("nPointLights")),
		ambientLight		: checkbox('ambientLight'),
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

