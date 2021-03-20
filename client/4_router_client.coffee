
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
    Router.route '/deviceHomePage/:_deviceUUID',()->
      self=this
      Meteor.loginWithPassword this.params._deviceUUID,'123456',(error)->
          console.log('Login Error is ' + JSON.stringify(error))
          if error and error.reason and error.reason is 'User not found'
              console.log 'User Not Found, need create'
          if !error
              self.render 'timeline'
              Session.set 'channel','timeline'
      console.log this.params._deviceUUID

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
    Router.route '/simpleUserProfile/:_id',()->
      Session.set('simpleUserProfileUserId',this.params._id)
      this.render 'simpleUserProfile'
    Router.route '/timeline',()->
      this.render 'timeline'
      Session.set 'channel','timeline'
    Router.route '/clusteringFix/:_id',()->
      this.render 'clusteringFix'
      return
    Router.route '/clusteringFixPerson/:gid/:fid',()->
      this.render 'clusteringFixPerson'
    Router.route '/timelineAlbum/:_uuid',()->
      console.log "TimeLine album: run into this page"
      this.render 'timelineAlbum'
    Router.route '/ishavestranger/',()->
      this.render 'haveStranger'
    Router.route '/device/dashboard/:group_id',()->
      this.render 'deviceDashboard'
    Router.route '/recognitionCounts/:group_id',()->
      this.render 'recognitionCounts'
    Router.route '/user',()->
      this.render 'user'
      Session.set 'channel','user'
    Router.route '/dashboard',()->
      this.render 'dashboard'
    Router.route '/registerFollow',()->
      this.render 'registerFollow'
      Session.set 'channel','registerFollow'
    Router.route '/authOverlay',()->
      this.render 'authOverlay'
      Session.set 'channel','authOverlay'
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
    Router.route '/introductoryPage1',()->
      this.render 'introductoryPage1'
      Session.set 'channel','introductoryPage1'
    Router.route '/introductoryPage2',()->
      this.render 'introductoryPage2'
      Session.set 'channel','introductoryPage2'
    Router.route '/webHome',()->
      this.render 'webHome'
    Router.route '/help',()->
      this.render 'help'
    Router.route '/progressBar',()->
      this.render 'progressBar'
      Session.set 'channel','progressBar'
    Router.route '/groupPerson/:_id', ()->
      this.render 'groupPerson'
    Router.route '/groupDevices/:_id', ()->
      this.render 'groupDevices'
    Router.route '/dayTasks/:_id', ()->
      this.render 'dayTasks'
    Router.route '/bindGroupUser', ()->
      this.render 'bindGroupUser'
    Router.route '/bindUserPopup/:_id',()->
      this.render 'bindUserPopup'
    Router.route '/newLabel',()->
      this.render 'newLabel'
    Router.route '/my_email',()->
      this.render 'my_email'
      Session.set 'channel','my_email'
    Router.route '/my_accounts_management', {
      action: ->
        this.render 'accounts_management'
        Session.set 'channel','my_accounts_management'
    }
    # Router.route '/my_accounts_management',()->
    #   if Meteor.isCordova is true
    #     this.render 'accounts_management'
    #     Session.set 'channel','my_accounts_management'
    #     return
    Router.route '/my_accounts_management_addnew',()->
      this.render 'accounts_management_addnew'
      Session.set 'channel','my_accounts_management_addnew'
    Router.route '/my_password',()->
      this.render 'my_password'
      Session.set 'channel','my_password'
    Router.route '/api_server_setup',()->
      this.render 'api_server_setup'
      Session.set 'channel','api_server_setup'
    Router.route '/mqtt_server_setup',()->
      this.render 'mqtt_server_setup'
      Session.set 'channel','mqtt_server_setup'
    Router.route '/my_notice',()->
      this.render 'my_notice'
      Session.set 'channel','my_notice'
    Router.route '/display_lang',()->
      this.render 'display_lang'
      Session.set 'channel','display_lang'
    Router.route '/my_about',()->
      this.render 'my_about'
      Session.set 'channel','my_about'
    Router.route '/deal_page',()->
      this.render 'deal_page'
      Session.set 'channel','deal_page'
    Router.route '/userProfile',()->
      this.render 'userProfile'
      Session.set 'channel','userProfile'
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
    Router.route '/hotPosts/:_id',()->
      this.render 'hotPosts'
    Router.route 'recommendStory',()->
      this.render 'recommendStory'
    Router.route '/selectTemplate',()->
      this.render 'selectTemplate'
    Router.route '/scene',()->
      this.render 'scene'
    Router.route '/addHomeAIBox',()->
      this.render 'addHomeAIBox'
    Router.route '/scanFailPrompt',()->
      this.render 'scanFailPrompt'
    Router.route '/setGroupname',()->
      this.render 'setGroupname'
    Router.route '/setDevicename',()->
      this.render 'setDevicename',{
        data:()->
          curDevice = Session.get('curDevice');
          return curDevice
      }
    Router.route '/checkInOutMsgList',()->
      this.render 'checkInOutMsgList'
    Router.route '/groupUserHide/:_id',()->
      this.render 'groupUserHide'
    Router.route '/faces', ()->
      Session.set 'channel','faces'
      this.render 'faces'
    Router.route '/scannerAddDevice', ()->
      this.render 'scannerAddDevice'
    Router.route '/chooseLabelType/:uuid',()->
      Session.set 'channel','chooseLabelType/'+this.params.uuid
      this.render 'chooseLabelType'
