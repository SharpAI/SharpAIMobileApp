//Meteor.connection._stream.rawUrl


var START_WITH_HTTPs = /^https?:/
var END_WITH_SLASH = /\/$/

function ensureDDPRawURL(){
  if (Meteor.isCordova) {
    var ROOT_URL = window.localStorage.getItem('Meteor.rootUrl')
    if (ROOT_URL){
        __meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL
          = __meteor_runtime_config__.ROOT_URL
          = Meteor.absoluteUrl.defaultOptions.rootUrl
          = ROOT_URL

        if (Meteor.connection && Meteor.connection._stream && Meteor.connection._stream.rawUrl){
          if (Meteor.connection._stream.rawUrl!=ROOT_URL){
            Meteor.connection._stream.rawUrl = ROOT_URL
          }
        }
    }
  }
}

ensureDDPRawURL()

function checkRootUrl(opt) {
  if (!START_WITH_HTTPs.test(opt))
    throw new Meteor.Error('option should be a string that start with http or https')
}

function setRootUrl(opt) {
  if (!END_WITH_SLASH.test(opt))
    opt += '/'
  window.localStorage.setItem('Meteor.rootUrl', opt)
  ensureDDPRawURL()
  window.location.reload()
}

Meteor.switchRootUrl = function (opt) {
  checkRootUrl(opt)
  Meteor.isCordova
    ? setRootUrl(opt)
    : window.location.replace(opt)
}
