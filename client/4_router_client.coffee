
if Meteor.isClient
  Meteor.startup ()->
    Tracker.autorun ()->
      channel = Session.get 'channel'
      $(window).off('scroll')
      console.log('channel changed to '+channel+' Off Scroll')
      setTimeout ->
          Session.set 'focusOn',channel
        ,300
    Router.route '/',()->
      this.render 'home'
      Session.set 'channel','home'
      return
    Router.route '/notice',()->
      this.render 'notice'
      return
    Router.route '/message',()->
      this.render 'chatGroups'
      Session.set 'channel','message'
      return
    Router.route '/group/add',()->
      this.render 'groupAdd'
      return
    Router.route '/groupsProfile/:_type/:_id',()->
      console.log 'this.params._type'+this.params._type
      if this.params._type is 'group'
        limit = withShowGroupsUserMaxCount || 29;
        Meteor.subscribe("get-group-user-with-limit",this.params._id,limit)
      else
        Meteor.subscribe('usersById',this.params._id)
      console.log(this.params._id)
      Session.set('groupsId',this.params._id)
      Session.set('groupsType',this.params._type)
      this.render 'groupsProfile'
      return
    Router.route '/simpleUserProfile/:_id',()->
      Session.set('simpleUserProfileUserId',this.params._id)
      this.render 'simpleUserProfile'
      return
    Router.route '/timeline',()->
      this.render 'timeline'
      Session.set 'channel','timeline'
    Router.route '/clusteringFix/:_id',()->
      this.render 'clusteringFix'
      return
    Router.route '/clusteringFixPerson/:gid/:fid',()->
      this.render 'clusteringFixPerson'
      return
    # Router.route '/homePage',()->
    #   if Meteor.isCordova is true
    #     this.render 'homePage'
    #     Session.set 'channel','homePage'
    #   return
    Router.route '/timelineAlbum/:_uuid',()->
      console.log "TimeLine album: run into this page"
      this.render 'timelineAlbum'
      return
    Router.route '/ishavestranger/',()->
      this.render 'haveStranger'
      return
    Router.route '/device/dashboard/:group_id',()->
      this.render 'deviceDashboard'
      return
    Router.route '/recognitionCounts/:group_id',()->
      this.render 'recognitionCounts'
      return
    Router.route '/explore',()->
      if Meteor.isCordova is true
        this.render 'explore'
        Session.set 'channel','explore'
      return
    Router.route '/bell',()->
      if Meteor.isCordova is true
        this.render 'bell'
        Session.set 'channel','bell'
      return
    Router.route '/user',()->
      this.render 'user'
      Session.set 'channel','user'
      return
    Router.route '/dashboard',()->
      if Meteor.isCordova is true
        this.render 'dashboard'
        return
    Router.route '/perfShow/:_id',()->
      if Meteor.isCordova is true
        this.render 'perfShow'
        return
    Router.route '/followers',()->
      if Meteor.isCordova is true
        this.render 'followers'
        return
    Router.route '/add',()->
      if Meteor.isCordova is true
        this.render 'addPost'
        Session.set 'channel','addPost'
        return
    Router.route '/registerFollow',()->
      if Meteor.isCordova is true
        this.render 'registerFollow'
        Session.set 'channel','registerFollow'
        return
    Router.route '/authOverlay',()->
      if Meteor.isCordova is true
        this.render 'authOverlay'
        Session.set 'channel','authOverlay'
        return
      else
        this.render 'webHome'
        return
    Router.route '/loginForm', ()->
      Session.set 'channel','loginForm'
      this.render 'loginForm'
      return
    Router.route '/signupForm', ()->
      this.render 'signupForm'
      return
    Router.route '/recoveryForm', ()->
      this.render 'recoveryForm'
      return
    Router.route '/introductoryPage',()->
      this.render 'introductoryPage'
      Session.set 'channel','introductoryPage'
      return
    Router.route '/introductoryPage1',()->
      this.render 'introductoryPage1'
      Session.set 'channel','introductoryPage1'
      return
    Router.route '/introductoryPage2',()->
      this.render 'introductoryPage2'
      Session.set 'channel','introductoryPage2'
      return

    Router.route '/webHome',()->
      this.render 'webHome'
      return
    Router.route '/help',()->
      this.render 'help'
      return
    Router.route '/progressBar',()->
      if Meteor.isCordova is true
        this.render 'progressBar'
        Session.set 'channel','progressBar'
        return
    Router.route '/redirect/:_id',()->
      Session.set('nextPostID',this.params._id)
      this.render 'redirect'
      return
    Router.route '/groupInstallTest/:_id/:uuid',()->
      Session.set('channel','groupInstallTest/'+this.params._id+'/'+this.params.uuid);
      this.render 'groupInstallTest'
      return
    Router.route '/groupPerson/:_id', ()->
      this.render 'groupPerson'
      return
    Router.route '/groupDevices/:_id', ()->
      this.render 'groupDevices'
      return
    Router.route '/dayTasks/:_id', ()->
      this.render 'dayTasks'
      return
    Router.route '/bindGroupUser', ()->
      this.render 'bindGroupUser'
      return
    Router.route '/bindUserPopup/:_id',()->
      this.render 'bindUserPopup'
      return
    Router.route '/comReporter/:_id',()->
      this.render 'companyItem'
      return
    Router.route '/collectList',()->
      Meteor.subscribe('collectedMessages', {sort: {collectDate: -1}, limit: 10})
      this.render 'collectList'
      return
    Router.route '/newLabel',()->
      this.render 'newLabel'
      return
    Router.route '/my_email',()->
      if Meteor.isCordova is true
        this.render 'my_email'
        Session.set 'channel','my_email'
        return
    Router.route '/my_accounts_management', {
      waitOn: ->
        [Meteor.subscribe("userRelation")]
      loadingTemplate: 'loadingPost'
      action: ->
        if Meteor.isCordova is true
          this.render 'accounts_management'
          Session.set 'channel','my_accounts_management'
    }
    # Router.route '/my_accounts_management',()->
    #   if Meteor.isCordova is true
    #     this.render 'accounts_management'
    #     Session.set 'channel','my_accounts_management'
    #     return
    Router.route '/my_accounts_management_addnew',()->
      if Meteor.isCordova is true
        this.render 'accounts_management_addnew'
        Session.set 'channel','my_accounts_management_addnew'
        return
    Router.route '/my_password',()->
      if Meteor.isCordova is true
        this.render 'my_password'
        Session.set 'channel','my_password'
        return
    Router.route '/api_server_setup',()->
      if Meteor.isCordova is true
        this.render 'api_server_setup'
        Session.set 'channel','api_server_setup'
        return
    Router.route '/mqtt_server_setup',()->
      if Meteor.isCordova is true
        this.render 'mqtt_server_setup'
        Session.set 'channel','mqtt_server_setup'
        return
    Router.route '/my_notice',()->
      if Meteor.isCordova is true
        this.render 'my_notice'
        Session.set 'channel','my_notice'
        return
    Router.route '/my_blacklist',()->
      if Meteor.isCordova is true
        this.render 'my_blacklist'
        Session.set 'channel','my_blacklist'
        return
    Router.route '/display_lang',()->
      if Meteor.isCordova is true
        this.render 'display_lang'
        Session.set 'channel','display_lang'
        return
    Router.route '/my_about',()->
      if Meteor.isCordova is true
        this.render 'my_about'
        Session.set 'channel','my_about'
        return
    Router.route '/deal_page',()->
      if Meteor.isCordova is true
        this.render 'deal_page'
        Session.set 'channel','deal_page'
        return
    Router.route '/topicPosts',()->
      if Meteor.isCordova is true
        this.render 'topicPosts'
        Session.set 'channel','topicPosts'
        return
    Router.route '/addTopicComment',()->
      if Meteor.isCordova is true
        this.render 'addTopicComment'
        Session.set 'addTopicComment_server_import', this.params.query.server_import
        Session.set 'channel','addTopicComment'
        return
    Router.route '/thanksReport',()->
      if Meteor.isCordova is true
        this.render 'thanksReport'
        Session.set 'channel','thanksReport'
        return
    Router.route '/reportPost',()->
      if Meteor.isCordova is true
        this.render 'reportPost'
        Session.set 'channel','reportPost'
        return
    Router.route '/userProfile',()->
      if Meteor.isCordova is true
        this.render 'userProfile'
        Session.set 'channel','userProfile'
        return
    Router.route 'userProfilePage1',
      template: 'userProfile'
      path: '/userProfilePage1'
    Router.route 'userProfilePage2',
      template: 'userProfile'
      path: '/userProfilePage2'
    Router.route 'userProfilePage3',
      template: 'userProfile'
      path: '/userProfilePage3'
    Router.route 'searchMyPosts',
      template: 'searchMyPosts'
      path: '/searchMyPosts'
    Router.route 'unpublish',
      template: 'unpublish'
      path: '/unpublish'
    Router.route 'setNickname',
      template: 'setNickname'
      path: '/setNickname'
    Router.route '/userProfilePage',()->
      this.render 'userProfilePage'
      return
    Router.route '/hotPosts/:_id',()->
      this.render 'hotPosts'
      return
    Router.route 'recommendStory',()->
      this.render 'recommendStory'
      return
    Router.route '/selectTemplate',()->
      this.render 'selectTemplate'
      return
    Router.route '/scene',()->
      this.render 'scene'
      return
    Router.route '/addHomeAIBox',()->
      this.render 'addHomeAIBox'
      return
    Router.route '/scanFailPrompt',()->
      this.render 'scanFailPrompt'
      return
    Router.route '/setGroupname',()->
      this.render 'setGroupname'
      return
    Router.route '/setDevicename',()->
      this.render 'setDevicename',{
        data:()->
          curDevice = Session.get('curDevice');
          return curDevice
      }
      return
    Router.route '/checkInOutMsgList',()->
      this.render 'checkInOutMsgList'
      return
    Router.route '/groupUserHide/:_id',()->
      this.render 'groupUserHide'
      return

    Router.route '/faces', ()->
      Session.set 'channel','faces'
      this.render 'faces'
      return
    Router.route '/scannerAddDevice', ()->
      this.render 'scannerAddDevice'
      return
    Router.route '/chooseLabelType/:uuid',()->
      Session.set 'channel','chooseLabelType/'+this.params.uuid
      this.render 'chooseLabelType'
      return
    Router.route '/autolabel/:uuid',()->
      this.render 'autolabel'
      return
