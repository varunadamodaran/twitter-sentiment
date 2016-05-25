'use strict'; //treat silly mistakes as run-time errors
/*
parseTweets function takes as input a JavaScript object containing Tweet information 
This function returns a new array of JavaScript objects
*/
function parseTweets(_DOG_TWEETS){
    var tweets = [];
    var hashtag= [];
    var len = _DOG_TWEETS.statuses.length;
    for (var i=0;i<len;i++){
        var numtags = _DOG_TWEETS.statuses[i].entities.hashtags.length
        for(var j=0;j<numtags;j++){ // Looping through the Hashtags to create an array of hashtags
            hashtag.push(" "+_DOG_TWEETS.statuses[i].entities.hashtags[j].text)
        } 
        var d = Date(_DOG_TWEETS.statuses[i].created_at)
        var tweet = {
            created_at: d,
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

/*
loadTweets function retrieves JSON data from the given file
*/
function loadTweets(Filename){
   var p = $.getJSON(Filename).then(function(data) {
   return parseTweets(data)
   });
   return p;// Returns a promise
}
/*
showTweets function receives a list of Tweet objects and display them on the web browser
*/
function showTweets(Tweets){
    var len = Tweets.length;
    var display = $('#tweetTable')
    display.empty();
    for(var i=0;i<len;i++){
      var user =  $("<tr><td>"+Tweets[i].user+"</td><td>"+Tweets[i].created_at+"</td><td>"+Tweets[i].text+"</td><td>"
      +Tweets[i].hashtags+"</td><td>"+Tweets[i].retweet_count+"</td><td>"+Tweets[i].sentiment+"</td></tr>")
      display.append(user);
    }   
}

/*
loadSentiments function receives a sentiment file and returns an object with sentiment key and respective score
*/
function loadSentiments(SentimentFile){
    var p = $.get(SentimentFile).then(function(data){
    var sentiment = data.split("\r\n") // Splits the data with newline character as separator
    var len = sentiment.length;
    var sentimentobject = {}
    for(var i=0;i<len;i++){
        var text = sentiment[i].split(",") 
        var sent_score = parseFloat(text[1]) // Converts score string to number value
        sentimentobject[text[0]] = sent_score;
    }
    return sentimentobject 
    });
    return p;
}

/*
textSentiments function receives a text string and sentiment score object.
Returns the sentiment score of the text.
*/
function textSentiment(text,sentimentobject){
    var sentiment_score = 0
    var words = text.split(/[^\w\']/).filter(function(el) {return el.length != 0}); // Splits the text in to words.Filters empty strings.
    var wordlen = words.length
    for(var i=0;i<wordlen;i++){
        if(words[i] in sentimentobject){
            sentiment_score = sentiment_score + sentimentobject[words[i]]
        }
    }
    return sentiment_score 
}

/*
tweetSentiments function receives file containing tweets and sentiment data.
Displays the tweet informatio with respective sentiment scores of the text.
*/
function tweetSentiments(TweetFile,SentimentFile){
    var p_tweet = loadTweets(TweetFile)
    var p_senti = loadSentiments(SentimentFile)
    $.when(p_tweet,p_senti).then(function(p_tweet,p_senti){
        var tweet_len = p_tweet.length
        for(var i=0;i<tweet_len;i++){
            var sentiment_score = textSentiment(p_tweet[i].text.toLowerCase(),p_senti) // Converts text in to lowercase and calculates score.
            p_tweet[i].sentiment = sentiment_score
        }
       showTweets(p_tweet)
    });
}

/*
The below lines are for defining what will happen when a user clicks on "Search" button.
In the click event, the search text is retrieved and provided to the URL.
This URL is sent as an input to tweetSentiments  function
*/

var button = $('#searchButton')
button.click(function(){
    var text = $('#searchBox').val();
    if(text != ""){
    tweetSentiments('http://faculty.washington.edu/joelross/search-tweets-proxy/?q='+text+'&count=100', 'data/AFINN-111.csv');
    }
    else{
    tweetSentiments('http://faculty.washington.edu/joelross/search-tweets-proxy/?q=your-search-term&count=100', 'data/AFINN-111.csv');
    }
})

/* Calling functions for testing purposes
*/

// loadTweets('data/dog.json').then(function(data) {
//   showTweets(data)
// });
// var sentimentobject = ""
// loadSentiments('data/AFINN-111.csv').then(function(data) {
//    //console.log(data)
//    sentimentobject = data
//    var sentiment_score=textSentiment("I prefer the rain to sunshine",sentimentobject)
//    console.log(sentiment_score)
//tweetSentiments('data/dog.json', 'data/AFINN-111.csv');
// });






