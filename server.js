var express    = require('express'),
    app        = express(),
    server     = require('http').createServer(app),
    twitterAPI = require('node-twitter-api'),
    _          = require('underscore')


//---------- set up Twitter stuff
if (!process.env.TWITTER_CONSUMER_KEY ||
    !process.env.TWITTER_CONSUMER_SECRET ||
    !process.env.TWITTER_ACCESS_TOKEN ||
    !process.env.TWITTER_ACCESS_TOKEN_SECRET) {
  console.log('ERROR: TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITTER_ACCESS_TOKEN, and TWITTER_ACCESS_TOKEN_SECRET must be set in your environment.')
  process.exit()
}

var twitter = new twitterAPI({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callback: 'http://localtest.me:8080/oauth'
})

var
  token = process.env.TWITTER_ACCESS_TOKEN,
  secret = process.env.TWITTER_ACCESS_TOKEN_SECRET

// twitter.verifyCredentials(token, secret, function(error, data, response) {
//   if (error) {
//     console.log('ERROR: Invalid Twitter access token and/or access token secret.')
//     console.log(error)
//     process.exit()
//   } else {
//     console.log('SUCCESS: Twitter credentials are valid.')
//   }
// })


//---------- start listening
var port = process.env.PORT || 8080
console.log("Listening on port", port)
server.listen(port)
app.use(express.bodyParser())
app.use(express.logger())
app.use(express.static(__dirname + "/public"))
app.post('/tweets-for-meme', tweetsForMeme)
app.post('/mock-tweets-for-meme', mockTweetsForMeme)


function tweetsForMeme(req, res) {
  console.log("This is called TweetsForMeme")
  var meme = "#" + req.body.meme
  twitter.search({q: meme, count: 100, result_type: 'mixed'}, token, secret, function(error, data, response) {
    if (error) {
      console.log("ERROR:", error, response)
      var json = JSON.stringify({ message: response })
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(json)
    } else {
      var topTenTweets = _.sortBy(data.statuses, function(status) {
        return status.retweet_count
      }).reverse().slice(0, 10)
      var json = JSON.stringify(topTenTweets)
      res.setHeader('Content-Type', 'application/json')
      res.end(json)
    }
  })
}

function mockTweetsForMeme(req, res) {
  console.log("This is hit")
  var topTweets = [
    { id: 410854284670955500,
      id_str: "410854284670955520",
      text: "The Dark Knight Light. #AddaWordRuinaMovie",
      retweet_count: 26,
      user: { screen_name: "jason_s_dolley" } },
    { id: 411342778921406460,
      id_str: "411361322493042688",
      text: "The Cat 'Tis Came Back #AddaWordRuinaMovie",
      retweet_count: 0,
      user: { screen_name: "AddAWordBot" } },
    { id: 411343492468580350,
      id_str: "411361876015329280",
      text: "#AddaWordRuinaMovie  Gone with the Wind Farm http://t.co/xCPwRKkOss",
      retweet_count: 0,
      user: { screen_name: "garciavet" } }
  ]
  var json = JSON.stringify(topTweets)
  res.setHeader('Content-Type', 'application/json')
  res.end(json)
}
