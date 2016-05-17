# Twitter's Sentiment - JavaScript Edition
In a previous assignment you wrote a program that analyzed the sentiment of real-world Twitter data. This program ran on the command-line; while that allowed you to quickly adjust the dataset you analyzed and possibly redirect the output elsewhere, the text-based output wasn't the most friendly to read or interact with (which is important if you want to share your data and analysis with others).

So for this assignment, you will implement a version of your Twitter Sentiment program that runs in a **web browser**, enabling people to search for tweets and view their sentiments without needing to use the command-line. And as browser-based programs are written in JavaScript, you will need to "port" (rewrite) your sentiment code into that language.

Note that this assignment will involve re-implementing many of your sentiment functions in a different language. While the syntax will be a little different, the logic will be pretty much  identical--thus you can do almost a line-by-line translation. The intention is that the functions should be easier to write, because you just need to think about the syntax, and not about the structure as much (because you solved that problem already!)

- There are still a lot of steps though--try to do one or two a day and you'll be fine! I have tried to include more details to help you out.

Again, this assignment involves working with **real, unfiltered, unsanitized data** taken directly from Twitter. _Tweets may include offensive, inappropriate, or triggering language or content._ If you are concerned about this data or assignment in any way, please let us know.
    

### Objectives
By completing this challenge you will practice and master the following skills:

* Porting code from one language to another
* Working with JavaScript data structures: arrays and objects
* Using JavaScript loops and conditionals
* Implementing and calling JavaScript functions
* Using callback functions and Promises for _asynchronous programming_
* Programmatically interacting with the browser's DOM


## Setup: Fork and Clone
As with all assignments in this course, you should start by forking and cloning this repository to your local machine. Repositories will contain starter code (if any), as well as the `SUBMISSION.md` file you will need to complete.

For this assignment, the repo includes a basic web page that loads the `twitter-sentiment.js` script, which you will need to implement. There is no command-line interface provided--you will need to implement functions and then call them in order to test that your program works (see details below). The repo also contains a number of data files in the `data/` folder that you've used previously, including the sentiment files and a new set of dog tweets in the `dog.json` file. 

Finally, the repo contains a Python script `download_twitter_data.py` (previously `twitter_stream.py`)that you can use to download your own testing data if you wish.

### Running a Web Server
In order to have your web page access remote data (like from Twitter), it needs to be running from a local _web server_ (this is a [security measure](https://en.wikipedia.org/wiki/Same-origin_policy)). You can easily create a web server using Python. On the command-line, while  **inside the repo folder**, run:

```
python3 -m http.server
```

(The [`-m`](https://docs.python.org/3.1/using/cmdline.html#cmdoption-trace-m) lets you run a module as script, instead of just importing it). You can then access your web page through your browser at: **[http://localhost:8000/](http://localhost:8000/)**.

- I highly recommend you develop and test your program using Chrome. Remember to open the JavaScript console by going to `View > Developer > JavaScript Console`. 

- Try using `console.log()` to log out `"hello world"` from the `twitter_sentiment.js` script and **reload** the page. If you can see your message, then you're ready to go!


## Step 1. Parsing Tweets
For this assignment you'll be re-implementing some (but not all!) of your Python functions in JavaScript... but in a different order that makes more sense for developing and testing this web script.

* As with the previous assignment, there are lots of functions to implement for this assignment. I recommend you `add` and `commit` your code to git after you complete each one!

The tweet data for this program will be implemented _slightly_ differently (in part because we're using Twitter's [search API](https://dev.twitter.com/rest/public/search) and not the [streaming API](https://dev.twitter.com/streaming/overview) this time).

Rather than a file that contains a unique JSON string on each _line_, the entire file will be one giant JSON with the following format:

```js
{
  "statuses": [
    {..., "text": "a tweet", ...},
    {..., "text": "another tweet", ...},
    {..., "text": "a third tweet", ...},
    ...
  ],
  ...
}
```

That is, the JSON object contains a key `"statuses"` that refers to an **array** (list) of **objects** (dicts), where each object represents a tweet using _the exact same structure_ as the previous assignment. You can view the raw data by opening the `data/dog.json` file.

- So rather than iterating through lines in a file, you'll load the file and then iterate through entries in the `"statuses" array.

Your first task is to implement a function **`parseTweets()`** that takes as a parameter a **JavaScript object** of this format (_not_ the name of a file!). This function should _return_ a new **array** (list) of JavaScript objects, with each object representing a tweet but only containing the fields that we're interested in:

- **`created_at`**: when the tweet was posted
- **`user.screen_name`** (the `screen_name` value inside the `user` object): who authored the tweet (attribution is important!) 
- **`text`** the content of the tweet; the part we most care about
- **`entities.hashtags[i].text`** (the `text` field from _each_ item in the `entries.hashtags` array). These are the [hashtags](https://en.wikipedia.org/wiki/Hashtag) that Twitter has extracted from the tweets (so you don't have to!)
- **`retweet_count`** how many times the tweet has been retweeted

(If it wasn't obvious, this is basically the same functionality as your previous `load_tweets()` function, except it doesn't handle opening the file).

The provided web page code includes a provided global variable **`_DOG_TWEETS`** (note the leading underscore) that refers to a sample JavaScript object of this format. Thus you can test your program by passing that variable to your function:

```javascript
var tweets = parseTweets(_DOG_TWEETS)
console.log(tweets);
```

You should see an array of 100 items, each of which you can inspect to see an different tweet. 


## Step 2. Loading a Tweet File
The next step is to be able to load an arbitrary file containing tweet data. This is difficult because it is conceptually complicated (but in the end is only one or two lines of code--the function is not complex, just uses complex concepts)!

Implement another function called **`loadTweets()`** that takes as a parameter the _name_ of a (json) file containing tweet data. This method should open that file and then parse the data (by calling your `parseTweets()` function).

In order to open an external file in browser-based JavaScript (and this includes "files" on other web servers, such as offered through a RESTful API), we use an [AJAX](https://en.wikipedia.org/wiki/Ajax_(programming)) request--effectively, we have our code send an HTTP request instead of the user typing a URL into a browser.

The easiest way to send this request is to use the [`.get()`](https://api.jquery.com/jquery.get/) function provided by the [jQuery](http://jquery.com/) library (which has been loaded into your page as part of the starter code):

```javascript
//fetches and loads the data from the given file
$.get('path/to/file.json') //note the . after the $
```

Here's the first tricky part: this function doesn't return the contents of the file! If the data file is large (or on a different computer), it could take a very long time to download. Unlike Python, JavaScript doesn't "wait" for that data to load... it will instead just proceed to the next line of code while the data is downloaded **asynchronously** (in the background).

What the method _does_ return instead is a [Promise](https://davidwalsh.name/write-javascript-promises), which is an object that represents data _that will be loaded in the future_. We can specify what to do with the returned data by calling the `.then()` method on the returned Promise, and passing that method a **callback function object** that we want to be executed when the data is returned. For example, you can pass in the `parseTweets` function you defined in the last step!

- Remember, we're passing the `.then()` method the _variable representing the function_---not the result of the function! `.then()` will call the function we tell it to, giving the callback function the loaded data as a parameter (which is what the `parseTweets()` method expects)

- Using callback functions is the most confusing part of JavaScript; please check in if this doesn't make sense!

Now the second tricky part: we want to be able to have the `loadTweets()` function load and parse some data, but then we want to do something with that data _after it has been **parsed**_. But since the parsing only happens after the data is loaded, and the data is loaded asynchronously, we need to be able to do something with the parsed data _asynchronously_.

Actually doing this is actually pretty easy. If you have your `loadTweets()` function return a _Promise_ object, we can take that returned promise and call `.then()` on it to specify what function gets called when that data is loaded... and if we return the same Promise that was returned by the `$.get()` function, then the data that was loaded (and eventually parsed) by _that_ method will be passed into the the callback that occurs after the `loadTweets()` function is finished loading and parsing.

- The "ticket" represented by the Promise is associated with whatever data was most recently returned by a callback executed when that promised was finished.

Thus you should be able to test your loading and parsing code with something like:

```javascript
loadTweets('data/dog.json').then(function(data) {
   console.log(data);
});
```
(In this case, the function that we're running after the data loads is an **anonymous function** that simply prints the data it is given--and that data will be whatever was returned by functions associated with the Promise. We could have given this function a name, but its easier/more "idiomatic" to just make it anonymous).

This test should again log out the 100 tweet items exactly as before... they are just now loaded from an external file! You could use the `download_twitter_data.py` script to grab a different data set and display that instead.


## Step 3. Displaying Tweets
Now that you've loaded and parsed the tweet data, let's get something showing up on the webpage in your browser (so it's not just the `console` showing stuff).

Implement a function called **`showTweets()`** that takes as a parameter an **array** (list) of objects representing tweets (e.g., the format returned by the `parseTweets()` function). This function should display those tweets in the _table_ provided in the starter `index.html` file--one tweet per row. Each row should be represented by a `<tr>` (table row) element, which has inside it a bunch of `<td>` (table data, or table cell) elements:

```html
<tr>
  <td>username</td>
  <td>May 13, 2016 13:52:19 GMT</td> <!-- posting date; formatted -->
  <td>This is a tweet! #example #hashtags #programmingrocks</td> <!-- tweet text -->
  <td>example, tags, programmingrocks</td> <!-- comma-separate list of hashtags -->
  <td>10</td> <!-- retweet count -->
  <td>2</td> <!-- sentiment score; will add in later -->
</tr>
```

Luckily, the pre-loaded [jQuery](https://jquery.com/) library makes adding a row to a table pretty simple. There are two steps:

1. First, you need to get a reference (a variable) to the body of the table (a `<tbody>` element with an id of `#tweetTable`). You can do this by using the _jQuery selector_ function `$('elementId')`.

2. You can then call the [`.append()`](http://api.jquery.com/append/) method on this variable to to "insert" a String of HTML into the web page. If you've crafted a String that looks like the above HTML, you can just append that to the table body and it will get added to the end!

    - You will of course want to append a row _for each_ tweet.

You should use the [`.empty()`](https://api.jquery.com/empty/) method to remove any previous contents that might be there (like the sample tweet).

A few notes about formatting this output:

- JavaScript has a built-in `Date` class with [many methods](http://www.w3schools.com/jsref/jsref_obj_date.asp) for working with dates (this is similar to the `datetime` module in Python). Look for a method that will let you convert a Date to _GMT_, or use a combination of methods to format the date in an appealing way.

- Make sure that there are spaces between each of the comma-separated hashtags so that the list wraps to the next line. There are existing [Array](http://www.w3schools.com/jsref/jsref_join.asp) and/or [String](http://www.w3schools.com/jsref/jsref_obj_string.asp) methods that can help with this.

- You can just put a "0" in the sentiment cell for now; we'll fill that in shortly.

You can test that this works by calling your `showTweets()` method _when the asynchronous `loadTweets()` is completed_ (instead of just printing the data). And you should see the list of dog tweets show up on the page!


## Step 4. Load Sentiments
With the tweets loaded and displayed, it's time to start filling in that sentiment value. The first thing you'll need to do is _load and parse_ a sentiment `.csv` file.

Implement a function **`loadSentiments()`** that takes as a parameter the _name_ of a (csv) file containing sentiment scores for words. This function should **asynchronously** load and parse the file, and return a _Promise_ containing an **Object** (dictionary) whose _keys_ are the words and whose _values_ are the sentiments of those words. This method is similar in function (and parsing logic) to what you did with the `load_sentiments()` function in your Python Script.

- Asynchronously loading and parsing the file will use the same structure as you used for loading and parsing the tweets earlier. You are welcome to create a helper `parseSentiments()` function, or you can simply use an _anonymous function_ to parse the loaded sentiment data into an Object (dictionary) to return.

- I recommend you `split()` the loaded data into an array of lines, and then iterate through those as you did in the Python version.

- You may also want to convert sentiment values into numbers (so a sentiment is `2`, not `'2'`).

Again, you should be able to test this function by calling it and then **asynchronously** printing out the returned data, similar to how you tested the `loadTweets()` function.


## Step 5. Calculate Text Sentiment
Implement a function **`textSentiment()`** (singular) that takes in two parameters: the text (a string) to analyze, and an Object containing word sentiment values. The function should _return_ the sentiment of the text, defined as: _the sum of the sentiments of the words in the string_. This is the same functionality as the `textSentiment()` function you wrote in your Python script.

- You are welcome to create a helper `extract_words()` function if you wish, but you can also just include that code directly.

- JavaScript does support [regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions), which the [`split()`](http://www.w3schools.com/jsref/jsref_split.asp) method can use as a delimiter. Regular expressions are written like Strings, but surrounded by `/ /` **instead of** `" "`.

You can test this function by calling it on a random string (`"There're six words in this string."` is a good test case for splitting words, and you know that `"I prefer the rain to sunshine"` should have a sentiment score of `2`). You should call this function _when the asynchronous `loadSentiments()` is completed_ (instead of just printing the data). Remember to print out the resulting sentiment!


## Step 6. Tweet Sentiments
Finally, we can calculate the sentiments of the tweets! Implement a function **`tweetSentiments()`** that takes in two parameters: the _location (name) of a file_ containing tweet data, and the _location (name) of a file_ containing sentiment data. This method should load the tweets and sentiments, assign a sentiment to each tweet (based on its text), and then show the tweets with their sentiment scores on the web page.

You'll need to load both the tweets _and_ the sentiments... and since both of these methods are **asynchronous**, you'll need to wait for _both_ of them to be done before you can actually assign sentiments to tweets! This is easy with Promises and jQuery using the [`$.when()`](https://api.jquery.com/jquery.when/) function:

```javascript
var fooPromise = asynchronousFoo(); //result is not anonymous
var barPromise = asynchronousBar();

$.when(fooPromise, barPromise).then(function(fooData, barData) {
    //do something with fooData and barData    
});
```
    
The `$.when()` function takes one or more promises (or calls to methods that return Promises) and then returns a _new_ Promise that will be fulfilled when all the component functions are finished. That Promise's `.then()` callback will be passed _multiple parameters_, one for the data of each component Promise. 

Thus you can wait for both the tweet data and the sentiment data to be loaded before you try and use them. You should assign a `sentiment` key to _each_ "tweet' Object whose value is the sentiment of that tweet. Your `showTweets()` function (which you should call from here) can then use that value in its display (you may need to modify that function to show an actual value for the sentiment).

- Don't forget to show the sentiments in your `showTweets()` function!

You can test this function by calling it and passing it the names of the tweet and sentiment files:

```javascript
tweetSentiments('data/dog.json', 'data/AFINN-111.csv');
```
which should now have the webpage show you all the tweets with sentiment scores!


## Step 7. Searching
One last step: since the sentiments are now shown on the webpage, it would be nice to be able to let the _user_ specify what kinds of tweets they want to show the sentiments of. Add functionality to your script so that when the user clicks the "Search" button (the little magnifying glass), your script shows the `tweetSentiments()` for the tweets that match whatever is typed into the search box.

There are a couple of steps to this:

1. Get a reference to the button using the _jQuery selector_ function (like you did for adding rows to the table). The button's id is `'#searchButton'`. You can do this at the "global" level (e.g., where you were testing your program); it doesn't need to be in a specific function.

2. You'll need to _specify a callback function_ that will get executed when someone **clicks** on that element. You do this by calling the [`.click()`](https://api.jquery.com/click/) method on it; this method takes as a parameter a _callback function_. This callback function can either be a named function or an anonymous function (anonymous functions are more idiomatic).

3. When the button is clicked, you'll need to get the text that the user has typed into the search box. You can access the search box by using the _jQuery selector_ (it has an id of `'#searchBox'`. You can access text (the "value") by using the [`.val()`](http://api.jquery.com/val/) method.

4. Now that you have the search term, you can use it to construct the URL you want to request tweet data from!

    With most web APIs you'd send a request directly to that web site (e.g., to `https://api.twitter.com/1.1/search/tweets`). However, Twitter has a number of access controls that make this infeasible from a browser-based system---basically you can't specify those 4 API keys & secrets using client-side JavaScript and also keep them secret! The keys need to be specified in a web server, which is complicated.

    To fix this, I've set up a [proxy](https://en.wikipedia.org/wiki/Proxy) that has all the keys specified that you can use to search twitter. This proxy is available at **[http://faculty.washington.edu/joelross/search-tweets-proxy/](http://faculty.washington.edu/joelross/search-tweets-proxy/)**. Basically you can access _that_ website instead of `https://api.twiter.com/1.1/search/tweets` and it will redirect your request with the proper keys to Twitter, and then give you back whatever JSON Twitter's API responds with.

    In short, you can fetch arbitrary data from twitter by loading data from:
    
    `http://faculty.washington.edu/joelross/search-tweets-proxy/?q=your-search-term&count=100`
    
    (replacing `your-search-term` with the actual search term). Try visiting this URL in your browser and seeing what you get!
    
    - The above set of URL parameters will get the maximum 100 Tweets per search; you can also include addition parameters as defined [here](https://dev.twitter.com/rest/reference/get/search/tweets) if you wish.
    

5. Once you have a URL to fetch the data from, you can simply pass that value in to your `tweetSentiments()` method; the `$.get()` method treats URL paths and file paths as the same, so it will load data from the web exactly as if you were loading from your `data/` folder.

And that's it! You should now be able to search for Tweets and see your search results along with sentiment values.

## Extensions
As an extra credit extension, sort the list of displayed tweets by either their sentiment scores (descending order) _or_ their retweet count (descending order).

Or for a more complex challenge, allow the _user_ to sort by clicking on the appropriate "header" table cell. You'll need to add a `.click()` callback to those cells (check the HTML for their `id` attributes), and then use that event to determine what "mode" you should sort in when you _show_ the tweets. You can either re-issue the search, but being able to "save" the previously searched data may produce a better interaction (be careful with global variables though!)

### For Fun
It's not worth extra credit, but you can also easily use [Github Pages](https://help.github.com/articles/creating-project-pages-manually/) to make your website available to on the Internet (without you needing to run a server). Simply create a new branch called `gh-pages` from your working code, and then push that branch to the Github `origin` repo. You should then be able to view your working program at

```
http(s)://<username>.github.io/<reponame>
```

## Submit Your Solution
Remember to `add`, `commit`, and `push` your script once it's finished!

In order to submit you assignment, you need to both `push` your completed solution to your GitHub repository (the one in the cloud that you created by forking), **and** submit a link to your repository to [Canvas](https://canvas.uw.edu/) (so that we know where to find your work)!

Before you submit your assignment, double-check the following:

1. Confirm that your program is completed and works without errors. The main functionality (searching for tweets and seeing their sentiment) should work as expected. 
* Be sure and fill out the **`SUBMISSION.md`** included in the assignment directory, answering the questions.
* `commit` the final version of your work, and `push` your code to your GitHub repository.

Submit a a link to your GitHub repository via [this canvas page](https://canvas.uw.edu/courses/1041440/assignments/3208934).

The assignment is due on **Wed May 25 at 6:00 AM**.

### Grading Rubric
See the assignment page on Canvas for the grading rubric.
