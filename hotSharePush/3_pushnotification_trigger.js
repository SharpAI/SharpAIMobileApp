// Generated by CoffeeScript 1.12.2
(function() {
  var root = typeof exports !== "undefined" && exports !== null ? exports : this;

  var JPush = require("jpush-sdk");
  var client = JPush.buildClient('50e8f00890be941f05784e6f', 'ec9940bbc7fcc646fc492ed8');

  pushnotification = function(pushServer, itemObj) {
    function isObject(obj){ 
        return (typeof obj=='object')&&obj.constructor==Object; 
    } 
    function isValid(obj) {
        if (obj) {
            if ((typeof obj=='string')&&obj.constructor==String) {
                if (obj == '') {
                    return false;
                } else {
                    return true;
                }
            }
            return true;
        }
        return false;
    }
    if (!isObject(itemObj)) {
       console.log("itemObj is invalid, itemObj="+itemObj);
       return -1;
    }
    var fromserver = itemObj.fromserver;
    //var eventType = itemObj.eventType;
    //var doc = itemObj.doc;
    var userId = itemObj.userId;
    var content = itemObj.content; 
    var extras = itemObj.extras;
    //var toUserId = itemObj.toUserId;
    var pushToken = itemObj.pushToken;
    var waitReadCount = itemObj.waitReadCount;

    if (!(isValid(fromserver) && isValid(userId) && isValid(content)
        && isValid(extras) && isValid(pushToken))) {
        console.log("Abort: invalid itemObj: itemObj="+JSON.stringify(itemObj));
        return -1;
    }
    fromserver = decodeURIComponent(itemObj.fromserver);
    if (!(pushToken === void 0 || pushToken.type === void 0 || pushToken.token === void 0)) {
      try {
        if (pushToken.type === 'JPush') {
          token = pushToken.token;
          /*if (token == '1507bfd3f7c9dcfe7f1') {
            client.push().setPlatform('ios', 'android').setAudience(JPush.registration_id(token)).setNotification('回复通知', JPush.ios(content, null, null, null, extras), JPush.android(content, null, 1, extras)).setOptions(null, 60).send(function(err, res) {
                    if (err) {
                        console.log('Send Jpush error: '+err.message);
                    } else {
                        console.log('Sendno: ' + res.sendno);
                        console.log('Msg_id: ' + res.msg_id);
                    }
            });
          }*/
          console.log("Send notification: JPush,  token="+token+", content="+content);
          return client.push().setPlatform('ios', 'android').setAudience(JPush.registration_id(token)).setNotification('回复通知', JPush.ios(content, null, null, null, extras), JPush.android(content, null, 1, extras)).setOptions(null, 60).send(function(err, res) {
                if (err) {
                    console.log('Send Jpush error: '+err.message);
                } else {
                    console.log('Sendno: ' + res.sendno);
                    console.log('Msg_id: ' + res.msg_id);
                }
          });
        } else if (pushToken.type === 'iOS') {
          token = pushToken.token;
/*if (token == '18d4149ff1d5f88833b9d5cbd9ad31c8073c6209eee3ad9b19cd7f75f19deb45') {
    pushServer.sendIOS('me', token, '', content, waitReadCount);
}*/
          console.log("Send notification: iOS,  token="+token+", content="+content);
          return pushServer.sendIOS('me', token, '', content, waitReadCount);
        } else if (pushToken.type === 'GCM') {
          token = pushToken.token;
          return console.log("Send notification: GCM,  token="+token+", content="+content);
          return pushServer.sendAndroid('me', token, '', content, 1);
        }
      } catch (error1) {
        error = error1;
        return console.log("Exception in pushnotification: error=" + error);
      }
    } else {
        console.log("toUserToken is invalid! Abort. toUserToken="+JSON.stringify(toUserToken));
    }
  }

}).call(this);
