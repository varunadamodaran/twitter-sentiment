'use strict'; //treat silly mistakes as run-time errors
'use strict'; //treat silly mistakes as run-time errors
console.log("Hello")
function parseTweets(_DOG_TWEETS){
    var tweets = [];
    var hashtag= [];
    var len = _DOG_TWEETS.statuses.length;
    for (var i=0;i<len;i++){
        var numtags = _DOG_TWEETS.statuses[i].entities.hashtags.length
        for(var j=0;j<numtags;j++){
            hashtag.push(_DOG_TWEETS.statuses[i].entities.hashtags[j].text)
        } 
        var tweet = {
            created_at:_DOG_TWEETS.statuses[i].created_at,
            text:_DOG_TWEETS.statuses[i].text,
            retweet_count: _DOG_TWEETS.statuses[i].retweet_count,
            user:_DOG_TWEETS.statuses[i].user.screen_name,
            hashtags:hashtag
        };
        hashtag = [];
        tweets.push(tweet);
    }
      return tweets;
}

function loadTweets(Filename){
   var p = $.getJSON(Filename).then(function(data) {
   return parseTweets(data)
   });
   return p;
}
loadTweets('data/dog.json').then(function(data) {
   console.log(data);
});
/* YOUR CODE GOES HERE! */
