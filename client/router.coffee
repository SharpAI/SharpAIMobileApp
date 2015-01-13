if Meteor.isClient
  Meteor.startup ()->
    Router.route '/',()->
      this.render 'home'
      Session.set 'channel','home'
    Router.route '/search',()->
      this.render 'search'
      Session.set 'channel','search'
    Router.route '/bell',()->
      this.render 'bell'
      Session.set 'channel','bell'
    Router.route '/user',()->
      this.render 'user'
      Session.set 'channel','user'
    Router.route '/dashboard',()->
      this.render 'dashboard'
    Router.route '/add',()->
      this.render 'addPost'
      Session.set 'channel','addPost'
    Router.route '/loginForm',()->
      this.render 'loginForm'
      Session.set 'channel','loginForm'
    Router.route '/signupForm',()->
      this.render 'signupForm'
      Session.set 'channel','signupForm'
    Router.route '/registerFollow',()->
      this.render 'registerFollow'
      Session.set 'channel','registerFollow'
    Router.route '/authOverlay',()->
      this.render 'authOverlay'
      Session.set 'channel','authOverlay'
    Router.route '/posts/:_id', {
        waitOn: ->
          Meteor.subscribe("publicPosts",this.params._id);
        action: ->
          post = Posts.findOne({_id: this.params._id})
          Session.set('postContent',post);
          Session.set("DocumentTitle",post.title + ':' + post.addontitle);
          this.render 'showPosts', {data: post}
      }
