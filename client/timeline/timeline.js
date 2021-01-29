deviceStatusVar = new ReactiveVar(false);

Template.timeline.onRendered(function () {
  Meteor.subscribe('group_devices',function(){
    Session.set('groupDevicesLoading',false);
  });
  if (!localStorage.getItem('devicetipFlag')) {
    deviceStatusVar.set(true);
  }
});


Template.timeline.helpers({
  showDeviceStatusTip: function(devs) {
    return deviceStatusVar.get() && devs && devs.length > 0;
  },
  isLoading:function(){
    if (Session.get('groupDevicesLoading') === false) {
      return false;
    }
    return true;
  },
  deviceSupportOnlineOffline: function(online){
    return typeof online ==='boolean'
  },
  sawPersonRecently: function(uuid){
    var device = Devices.findOne({uuid:uuid});
    if(device && device.last_person_ts){
      if(new Date().getTime() - device.last_person_ts < 5*60*1000){
        return true;
      }
    }
    return false;
  },
  lists: function(){
    var lists = [];
    SimpleChat.GroupUsers.find({user_id:Meteor.userId()},{sort:{create_time:-1}}).forEach(function(item){
      var devices =  Devices.find({groupId: item.group_id},{sort:{createAt:-1}}).fetch();
      if(devices.length > 0){
        lists.push({
          group_id: item.group_id,
          group_name: item.group_name,
          devices:devices
        });
      }
    });
    return lists;
  },
  withLiteVersion: function(){
    return withLiteVersion;
  }
});

Template.timeline.events({
  'click .back': function(){
    return PUB.back();
  },
  'click .deviceItem': function(e){
    if(!withLiteVersion){
      Session.set("timelinehref",false)
      return PUB.page('/timelineAlbum/'+e.currentTarget.id+'?from=timeline');
    }
  }
})
