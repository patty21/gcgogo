GCVote  = function() {
}

GCVote.prototype.getSingleVote = function(guid,success) {
	Mojo.Log.info('GCvote-Start:'+guid);
	var url = "http://gcvote.de/GCVote/getVotes.php?cacheIds="+guid;
	var checkAjax = new Ajax.Request(url, {
		'method': 'get',
		'onSuccess': function(r){
			var reply = r.responseText;
			var avg=reply.match(/voteAvg='([\d\.]+)'/)[1];
			var cnt=reply.match(/voteCnt='([\d\.]+)'/)[1];
			var user=reply.match(/voteUser='([\d\.]+)'/)[1];
						
			var vote = {
				'avg':avg,
				'cnt':cnt,
				'user':user
			}
			Mojo.Log.info('GCvote:'+guid+':'+Object.toJSON(vote));
			success(vote);
		}.bind(this),
		'onFailure': function(r){
			Mojo.Log.error('Error GCVote');
		}
	});
}
