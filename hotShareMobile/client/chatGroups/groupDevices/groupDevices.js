Template.groupDevices.onRendered(function () {
  var group_id = Router.current().params._id;
  Meteor.subscribe('device_by_groupId', group_id);
});

Template.groupDevices.helpers({
  currentFWVer: function(firmwareVersion){
    if(firmwareVersion){
      return firmwareVersion
    } else {
      return TAPi18n.__("unknown")
    }
  },
  isChecked: function(autoUpdate){
    if(autoUpdate){
      return 'checked'
    } else {
      return ''
    }
  },
  lists: function() {
    var group_id = Router.current().params._id;
    return Devices.find({groupId: group_id}).fetch();
  },
  isEditing:function(uuid){
    if(Session.get('isEditing') == uuid){
      return true;
    }
    return false;
  },
  isShow:function(uuid,tag){
    if(Session.get('isEditing') == uuid && tag==1){
      return 'display:none';
    }
    if(Session.get('isEditing') != uuid && tag==2){
      return 'display:none';
    }
    return '';
  },
  getId:function(uuid){
    return "input_"+uuid;
  },
  isLatest: function(uuid){
    var curDevice = Devices.findOne({uuid:uuid});
    if(!curDevice.islatest && curDevice.islatest == null && curDevice.islatest == undefined){
        return 'display:none';
    }
    return '';
  }
});


Template.groupDevices.events({
  'click .latest_update': function(e,t){
    PUB.toast(TAPi18n.__("Your_face_security_box_is_currently_the_latest_version"));
    return
  },
  'click #switch_update': function(e,t){
    console.log('switch update')
    if(this.autoUpdate){
        Devices.update({_id:this._id},{$set:{autoUpdate:false}})
    } else {
      Devices.update({_id:this._id},{$set:{autoUpdate:true}})
    }
    return;
  },
  'click .name':function(e){
    var self = this;
    Session.set('isEditing',this.uuid);
    Meteor.setTimeout(function(){
    var node = $("#input_"+self.uuid);
      var t = node.val();
      node.val("").focus().val(t);
    },1000);
    // var td = $(e.currentTarget);
    // var text = $(e.currentTarget).text();
    // var input = $('<input type="text" class="edit" value="'+text+'">');
    // $(e.currentTarget).html(input);
    // $('input').click(function(){
    //   return false;
    // }); //阻止表单默认点击行为
    // var len = text.length;
    // // $('input').setSelectionRange(len,len);
    // $('input').select();
    // $('input').blur(function(event){
    //   var nextxt=$(event.currentTarget).val();
    //   if(nextxt == ''||nextxt == self.name){
    //     nextxt = self.name;
    //   }else{
    //     Meteor.call('change_device_name',self._id,self.uuid,self.groupId,nextxt,function(err){
    //       if(err){
    //         console.log(err);
    //         PUB.toast('修改失败，请重试');
    //         td.html(self.name);
    //       }
    //     })
    //   }
    //   td.html(nextxt);
    // }); //表单失去焦点文本框变成文本
  },
  'blur input':function(e){
    var self = this;
    var newName = $(e.currentTarget).val();
    if(newName == ''||newName == this.name){
      Session.set('isEditing',null);
      return;
    }
    Meteor.call('change_device_name', this._id, this.uuid, this.groupId, newName, function (err) {
      if (err) {
        console.log(err);
        PUB.toast(TAPi18n.__("The_modification_failed_please_try_again"));
      }else{
        Session.set('isEditing',null);
      }
    })
  },
  'click .delBtnContent':function(e){
    var uuid = $(e.currentTarget).data('uuid');
    var id = e.currentTarget.id;
    var group_id = Router.current().params._id;
    //删除设备
    Meteor.call('delete_device',id,uuid,group_id,function(err){
      if(err){
        console.log(err);
        return;
      }
      PUB.toast(TAPi18n.__("successfully_deleted"));
    })
  },
  'click .back': function(){
    return PUB.back();
  },
  'click .goTimelime': function(e){
    var group_id = Router.current().params._id;
    Session.set("channel",'groupDevices/'+group_id);
    return PUB.page('/timelineAlbum/'+e.currentTarget.id+'?from=timeline');
  },
  'click .goEdit':function(){
    var self = this;
    if(!self.name){
      self.name = TAPi18n.__("Unknown_device");
    }
    Session.set('curDevice',self);
    var group_id = Router.current().params._id;
    Session.set("channel",'groupDevices/'+group_id);
    return PUB.page('/setDevicename');
  }
});
Template.setDevicename.events({
  'click .left-btn':function(){
    PUB.back();
  },
  'click .right-btn':function(){
    $('.setGroupname-form').submit();
  },
  'submit .setGroupname-form':function(e){
    e.preventDefault();
    var newName = e.target.text.value;
    if(newName == ''){
      PUB.toast(TAPi18n.__("Please_enter_the_device_name"));
      return;
    }
    if(newName == this.name){
      PUB.toast(TAPi18n.__("Device_name_has_not_been_modified"));
      return;
    }
    Meteor.call('change_device_name',this._id,this.uuid,this.groupId,newName,function(err){
      if(err){
        console.log(err);
        PUB.toast(TAPi18n.__("The_modification_failed_please_try_again"));
      }else{
        return PUB.back();
      }
    })
  }
})
