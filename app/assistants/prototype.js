/**
 * Ajax.Request.abort
 * extend the prototype.js Ajax.Request object so that it supports an abort method
 */
Ajax.Request.prototype.abort = function() {
    // prevent and state change callbacks from being issued
    this.transport.onreadystatechange = Prototype.emptyFunction;
    // abort the XHR
    this.transport.abort();
    // update the request counter
    Ajax.activeRequestCount--;
};

Ajax.formatMultipart = function(parameters, boundary) {
	var data = "--"+boundary;
	for(var i in parameters) {
		if( typeof parameters[i] == "object" ){
			data += "\r\nContent-Disposition: form-data; name=\""+i+"\"; filename=\""+parameters[i]['name']
				+"\"\r\nContent-Type: "+parameters[i]['content-type']+"\r\n\r\n"+parameters[i]['content']+"\r\n--"+boundary;
		} else {
			data += "\r\nContent-Disposition: form-data; name=\""+i+"\"\r\n\r\n"+parameters[i]+"\r\n--"+boundary;
		}
	}
	data += "--\r\n";
	return "Content-Type: multipart/form-data; boundary="+boundary+"\r\nContent-Length: "+data.length+"\r\n\r\n"+data;
};
