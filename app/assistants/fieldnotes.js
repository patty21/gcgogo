var FieldNotes = {}

FieldNotes.addNote = function(geocode, type, text)
{
	var entry = {
		'geocode': geocode,
		'ts': Math.round(new Date().getTime() / 1000),
		'type': type,
		'text': text
	}
	Geocaching.settings['notes'].push(entry);
	Geocaching.saveSettings();
	Mojo.Log.info("Field notes: "+Object.toJSON(this.getNotes()));
}
FieldNotes.removeNote = function(index)
{
	Geocaching.settings['notes'].splice(index, 1);
	Geocaching.saveSettings();
}

FieldNotes.getNotes = function()
{
	return Geocaching.settings['notes'];
}

FieldNotes.toString = function()
{
	var output = "";
	var ts = new Date();
	for(var i = 0; i < Geocaching.settings['notes'].length; i++){
		var n = Geocaching.settings['notes'][i];
		ts.setTime(n['ts'] *1000);
		output += n['geocode']+","+ts.toISOString()+","+n['type']+',"'+n['text'].replace('"', '\"')+"\"\r\n";
	}
	Mojo.Log.error(output);
	return output;
}
FieldNotes.clearAll = function()
{
	Geocaching.settings['notes'] = [];
	Geocaching.saveSettings();
}
