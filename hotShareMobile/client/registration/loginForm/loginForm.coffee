# id1 = null
# id2 = null
Template.loginForm.events
    'click #toSignup':(e,t)->
      return PUB.page('/signupForm');
    # 'focus input':(e,t)->
    #   if id2 isnt null
    #     Meteor.clearTimeout id2
    #     id2 = null
    #   id1 = Meteor.setTimeout ->
    #         $('.company').css('display','none')
    #         $('.bottom-img').css('display','none')
    #       ,10
    # 'blur input':(e,t)->
    #   if id1 isnt null
    #     Meteor.clearTimeout id1
    #     id1 = null
    #   id2 = Meteor.setTimeout ->
    #         $('.company').css('display','block')
    #         $('.bottom-img').css('display','block')
    #       ,500
    'click #btn_back' :->
      $('input').blur()
      PUB.back()
#      Router.go '/authOverlay'
      # $('.login').css('display',"none")
      # $('#register').css('display',"block")
      # $('#weibo').css('display',"block")
      # $('#login').css('display',"block")
      # $('.recovery').css('display',"none")
#      $('.authOverlay').css('-webkit-filter',"none")
    'click .forgetPwdBtn': (e)->
      menus = [TAPi18n.__("forget_password"),TAPi18n.__("Contact_Customer_Service")]
      menuTitle = ''
      callback = (buttonIndex)->
        if buttonIndex is 1
          # $('.login').css('display',"none")
          # $('#register').css('display',"none")
          # $('#weibo').css('display',"none")
          # $('#login').css('display',"none")
          # $('.recovery').css('display',"block")
          # $('.agreeDeal').css('display',"none")
          Router.go '/recoveryForm'
        else if buttonIndex is 2
          $('.customerService,.customerServiceBackground').fadeIn(300)
      PUB.actionSheet(menus, menuTitle, callback)
    'click .btnClose' :->
      $('.customerService,.customerServiceBackground').hide()
    'click #sendEmailBtn' :(e,t)->
      mailAddress = t.find('#customerEmail').value
      content = t.find('#sendContent').value
      qqValueReg = RegExp(/^[1-9][0-9]{4,9}$/)
      mailValueReg = RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/) 
      subject = TAPi18n.__("user") + mailAddress + TAPi18n.__("Need_manual_customer_service")
      if !mailValueReg.test(mailAddress) and !qqValueReg.test(mailAddress)
        PUB.toast(TAPi18n.__("Please_enter_the_correct_QQ_number_or_email"))
        return false
      if qqValueReg.test(mailAddress)
        mailAddress += '@qq.com'
      if content is ''
        PUB.toast(TAPi18n.__("Please_explain_the_reason_for_the_appeal"))
        return false
      $("#sendContent").val('')
      Meteor.call('sendEmailToAdmin', mailAddress,subject ,content)
      PUB.toast(TAPi18n.__("The_email_has_been_sent"))
      $('.customerService,.customerServiceBackground').hide()
    'click .forgetPassword' :->
      # $('.login').css('display',"none")
      # $('#register').css('display',"none")
      # $('#weibo').css('display',"none")
      # $('#login').css('display',"none")
      # $('.recovery').css('display',"block")
      # $('.agreeDeal').css('display',"none")
      $('body').height($('body')[0].clientHeight);
      Router.go '/recoveryForm'
    'submit #login-form':(e,t)->
      e.preventDefault()
      if Meteor.status().connected isnt true
        PUB.toast 'Your device is currently offline...'
        return
      name = t.find('#login-username').value
      Session.set 'userName',name
      pass = t.find('#login-password').value
      if name is ''
        PUB.toast 'Please input your Username'
        return
      if pass is ''
        PUB.toast 'Please input your Password'
        return
      t.find('#sub-login').disabled = true
      t.find('#sub-login').innerText = 'Logging in ...'
      Meteor.loginWithPassword name, pass,(error)->
        if error
          PUB.toast 'Incorrect Username or Password'
          t.find('#sub-login').disabled = false
          t.find('#sub-login').innerText = 'Login'
        else
          Router.go '/'
          ###
          if window.localStorage.getItem("isSecondUse") == 'true'
            Router.go('/')
          else
            if window.localStorage.getItem("enableHomeAI") == 'true'
              Router.go('/scene')
            else
              Meteor.call 'enableHomeAI',(err,res)->
                if !err and res is true
                  window.localStorage.setItem("enableHomeAI",'true')
                  Router.go('/scene')
                else
                  Router.go('/introductoryPage')
          ###
          checkShareUrl()
          return
      false 
Template.recoveryForm.events
    'focus input':(e,t)->
      Meteor.setTimeout ->
        $('.company').css('display','none')
      ,10
    'blur input':(e,t)->
      Meteor.setTimeout ->
        $('.company').css('display','block')
      ,10
    'click #btn_back' :->
      $('input').blur()
      Router.go '/loginForm'
      # $('.login').css('display',"none")
      # $('#register').css('display',"block")
      # $('#weibo').css('display',"block")
      # $('#login').css('display',"block")
      # $('.recovery').css('display',"none")
    'submit #recovery-form':(e,t)->
      e.preventDefault()
      if Meteor.status().connected isnt true
        PUB.toast 'Connection Error. Try again?'
        return
      email = t.find('#recovery-email').value
      if email is ''
        return
      qqValueReg = RegExp(/^[1-9][0-9]{4,9}$/)
      mailValueReg = RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/) 
      if !mailValueReg.test(email) and !qqValueReg.test(email)
        PUB.toast(TAPi18n.__("Please_enter_the_correct_QQ_number_or_email"))
        return false
      if qqValueReg.test(email)
        email += '@qq.com'
      # if Meteor.call('checkUserByEmail', email) is 'undefined'
      #   PUB.toast '未检测到与您输入邮箱匹配的帐号,请检查输入的邮箱'
      Meteor.call('checkUserByEmail', email,(error,result)->
        if result isnt undefined and result isnt null
          Meteor.call('sendResetPasswordEmail', result._id, result.emails[0].address)
          console.log result
          PUB.toast(TAPi18n.__("A_password_reset_emai"))
          Router.go '/loginForm'
        else
          PUB.toast(TAPi18n.__("If_the_account_matching"))
        );
      return

      t.find('#sub-recovery').disabled = true
      t.find('#sub-recovery').innerText = TAPi18n.__("Resetting")
      subject = TAPi18n.__("user") + email + TAPi18n.__("Need_to_reset_your_password")
      content = "TAPi18n.__('APP_has_received')\n\nTAPi18n.__('Application_Information')――\n\nTAPi18n.__('User_account_email')" + email + "\n\n\nTAPi18n.__('This_email_is_automatically')"
      Meteor.call('sendEmailToAdmin', email,subject ,content)
      PUB.toast(TAPi18n.__("The_password_reset_request"))
      Router.go '/loginForm'

###
      Accounts.forgotPassword {email:email},(error)->
       t.find('#sub-recovery').disabled = false
       t.find('#sub-recovery').innerText = '重设'
       if error
         if error.error is 403 and error.reason is 'User not found'
           PUB.toast '您填写的邮件地址不存在！'
         else
           PUB.toast '暂时无法处理您的请求，请稍后重试！'
       else
          PUB.toast '请访问邮件中给出的网页链接地址，根据页面提示完成密码重设。'
         navigator.notification.confirm('请访问邮件中给出的网页链接地址，根据页面提示完成密码重设。', (r)->
           if r is 1
             $('#recovery-email').val('');
         , '提示信息', ['确定']);
         Router.go '/loginForm'
          $('.login').css('display',"none")
          $('#register').css('display',"block")
          $('#weibo').css('display',"block")
          $('#login').css('display',"block")
          $('.recovery').css('display',"none")###
