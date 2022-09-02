
create_group = function(name,cb){
  var offsetTimeZone = (new Date().getTimezoneOffset())/-60;

  var id = new Mongo.ObjectID()._str;
  var user = Meteor.user();
  SimpleChat.Groups.insert({
    _id: id,
    name: name,
    icon: '',
    describe: '',
    create_time: new Date(),
    template:null,
    offsetTimeZone: offsetTimeZone,
    last_text: '',
    last_time: new Date(),
    barcode: rest_api_url + '/restapi/workai-group-qrcode?group_id=' + id,
    //建群的人
    creator:{
      id:user._id,
      name:user.profile && user.profile.fullname ? user.profile.fullname : user.username
    }
  }, function(error, result){
    if(error) {
      console.log(error);
      PUB.toast('registion error');
      cb('error');
    }
    SimpleChat.GroupUsers.insert({
      group_id: id,
      group_name: name,
      group_icon: '',
      user_id: user._id,
      user_name: user.profile && user.profile.fullname ? user.profile.fullname : user.username,
      user_icon: user.profile && user.profile.icon ? user.profile.icon : '/userPicture.png',
      create_time: new Date()
    });
    /*
    if(d.groupId) { // 如果有group_id, 设备更换新的群组
      return changeDeviceGroup(id, name);
    }
    return addDeviceToGroup(id, name);
    */
    cb(null);
  })
}
