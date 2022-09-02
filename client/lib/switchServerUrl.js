//Meteor.connection._stream.rawUrl


var START_WITH_HTTPs = /^https?:/
var END_WITH_SLASH = /\/$/

var MQTT_ADDRESS = '165.232.62.29'
var MQTT_PORT = 80

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

function ensureMQTTAddress(){
  var mqttAddress = window.localStorage.getItem('Meteor.mqttAddress')
  var mqttPort = window.localStorage.getItem('Meteor.mqttPort')
  if(!mqttAddress){
    window.localStorage.setItem('Meteor.mqttAddress', MQTT_ADDRESS)
  }
  if(!mqttPort){
    window.localStorage.setItem('Meteor.mqttPort', MQTT_PORT)
  }
}

ensureDDPRawURL()
ensureMQTTAddress()

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
Meteor.getRootUrl = function(){
  if (Meteor.isCordova) {
    var ROOT_URL = window.localStorage.getItem('Meteor.rootUrl')
    if (ROOT_URL){
      return ROOT_URL
    }
  }

  return  __meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL
}
