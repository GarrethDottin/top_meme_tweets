var TEMPLATES = (function() {
  var _cache = {}

  function _tUrl(name) {
    return "/templates/" + name + ".hbs"
  }
  return {
    precompile: function(names) {
      for (var i in names) {
        $.get(_tUrl(names[i]), function(source) {
          TEMPLATES.compileAndCache(names[i], source)
        })
      }
    },

    compileAndCache: function(name, source) {
      var template = Handlebars.compile(source)
      _cache[name] = template
      return template
    },

    render: function(name, context, renderCallback) {
      var self = this
      function compileCacheAndRender(source) {
        template = self.compileAndCache(name, source)
        renderCallback(template(context))
      }

      var template = _cache[name]
      if (template) {
        renderCallback(template(context))
      } else {
        $.get(_tUrl(name), compileCacheAndRender)
      }
    }
  }
}())

var Controller = {
  init: function() {
    console.log(TEMPLATES.precompile(['tweet']))
    TEMPLATES.precompile(['tweet'])
    $('form').on('submit', this.showTweetsForMeme)
  },

  showTweetsForMeme: function(e) {
    e.preventDefault()
    $(".container .tweets").html('')
    var $form = $(event.target)
    $.post($form.attr('action'), $form.serialize(), Controller.renderTweets.bind(Controller))
  },

  renderTweets: function(tweets) {
    for (var i in tweets) {
      TEMPLATES.render('tweet', tweets[i], this.appendTweet)
    }
  },

  appendTweet: function(html) {
    console.log(html)
    $(".container .tweets").append(html)
  }
}

$(function() {
  Controller.init()
})
