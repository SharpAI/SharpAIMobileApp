var view = null;
var dadaset_view = null;
var type = new ReactiveVar('');
var limit1 = new ReactiveVar(0);
var limit2 = new ReactiveVar(0);
var limit3 = new ReactiveVar(0);
var selected = new ReactiveVar([]);
var selected2 = new ReactiveVar([]);
var lebeledPreLists = new ReactiveVar([]);
var limitSetp = 10;

//重新训练
retrain = function (group_id) {
  var group = SimpleChat.Groups.findOne({ _id:group_id });
  var user = Meteor.user();
  var msg = {
    _id: new Mongo.ObjectID()._str,
    form: {
      id: Meteor.userId(),
      name: user.profile && user.profile.fullname ? user.profile.fullname : user.username,
      icon: user.profile && user.profile.icon ? user.profile.icon : '/userPicture.png'
    },
    to: {
      id: group._id,
      name: group.name,
      icon: group.icon
    },
    to_type: 'group',
    type: 'text',
    text: 'train',
    create_time: new Date(),
    is_read: false,
    wait_classify: false
  };
  sendMqttGroupMessage(msg.to.id, msg, function (err) {
    if (err) {
      console.log(err);
    }
  });
}

Template.groupPhoto.helpers({
  is_type: function(val){
    return type.get() === val;
  },
  isLoading:function(){
    return Session.get('group_person_loaded') != true;
  },
  is_hover: function(val){
    return type.get() === val ? 'hover' : '';
  },
  is_selected: function(){
    return selected.get().length > 0 ;
  },
  is_selected2: function(){
    return selected2.get().length > 0 ;
  },
  list1: function(id){
    return SimpleChat.Messages.find({is_people: true, 'to.id': id, admin_label: {$ne: true}}, {limit: limit1.get(), sort: {create_time: 1}})
  },
  list2: function(id){
    // return SimpleChat.GroupPhotoLabel.find({group_id: id}, {limit: limit2.get(), sort: {create_time: 1}})
    // return Person.find({group_id: id},{limit: limit2.get(), sort:{createAt: -1}}).fetch();
    var arrEnglish = [];
    var arrPinyin = [];
    Person.find({group_id: id},{limit: limit2.get(), sort:{createAt: -1}}).forEach(function(item){
      if(item.name && item.name.charCodeAt(0) > 255){
        item.pinyin = makePy(item.name)[0];
        arrPinyin.push(item);
      } else {
        arrEnglish.push(item);
      }
    });
    var compare = function (prop) {
        return function (obj1, obj2) {
            var val1 = obj1[prop];
            var val2 = obj2[prop];
            // 移除首尾空格
            val1 = val1.replace(/(^\s*)|(\s*$)/g, ""); 
            val2 = val2.replace(/(^\s*)|(\s*$)/g, ""); 
            // 统一英文字符为大写
            val1 = val1.toLocaleUpperCase();
            val2 = val2.toLocaleUpperCase();
            if (val1 < val2) {
                return -1;
            } else if (val1 > val2) {
                return 1;
            } else {
                return 0;
            }            
        } 
    }
    arrEnglish = arrEnglish.sort(compare("name"));
    arrPinyin = arrPinyin.sort(compare("pinyin"));
    arrEnglish = arrEnglish.concat(arrPinyin);
    return arrEnglish;
  },
  conMainStyle: function(){
    if(type.get() === TAPi18n.__("Unlabeled")){
      if(selected.get().length > 0){
        return 'bottom: 100px;';
      } else {
        return 'bottom: 40px;';
      } 
    } else {
      return 'bottom: 60px;';
    }
  }
});

Template.groupPhoto.events({
  'click .back': function(){
    Template.groupPhoto.close();
  },
  'click .nav li': function(e){
    type.set($(e.currentTarget).html());
  },
  'click .btn-default': function(e, t){
    var type = '';
    var call_back_handle = function(nameOrReason){
      if (!nameOrReason) {
        $('.btn-default').show();
        return;
      }

      var localTask = [];
      var wait_labels = [];

      $(e.currentTarget).html(TAPi18n.__("Processing"));
      var select = selected.get();
      select.map(function(item){
        var ids = item.split('|');
        var msgObj = SimpleChat.Messages.findOne({_id: ids[0]});
        msgObj.images.map(function(img, i){
          if (img._id === ids[1]){
            if(_.pluck(wait_labels, '_id').indexOf(msgObj.people_uuid + '|' + msgObj.people_id) === -1){
              wait_labels.push({
                _id: msgObj.people_uuid + '|' + msgObj.people_id,
                id: msgObj.people_id,
                uuid: msgObj.people_uuid,
                url: img.url,
                img_type: img.img_type,
                label:img.label,
                style: img.style,
                sqlid: img.sqlid
              });
            }

            // update local da
            console.log('label', i);
            localTask.push({
              _id: ids[0],
              index: i,
              obj: img,
              uuid:msgObj.people_uuid,
              create_time:msgObj.create_time,
              group_id: t.data.id
            });
          }
        });
      });

      console.log('nameOrReason:', nameOrReason, 'labels:', wait_labels);
      console.log('local task:', localTask);

      Meteor.call('upLabels', t.data.id, nameOrReason, wait_labels,type, function(err, res){
        var flag = type === 'label' ? TAPi18n.__("Label") : TAPi18n.__("delete");
        if (err || !res){
          $(e.currentTarget).html(flag);
          $('.btn-default').show();
          return alert(flag + TAPi18n.__("Failure"));
        }

        localTask.map(function(task){
          var $set = JSON.parse('{"images.'+task.index+'.admin_label": true}');
          console.log('update local db:', $set, 'id:', task._id);
          SimpleChat.Messages.update({_id: task._id}, {$set: $set}, function(err, num){
            if (err || num <= 0)
              return;
            var flag_label = type === 'label' ? nameOrReason : TAPi18n.__("Deleted");
            var is_delete = type === 'label' ? false : true;
            // 生成群相册的标注信息（一张照片一条）
            SimpleChat.GroupPhotoLabel.insert({
              msg_id: task._id,
              img__id: task.obj._id,
              img_id: task.obj.id,
              img_uuid: task.uuid,
              img_type: task.obj.img_type,
              img_style: task.obj.style,
              img_sqlid: task.obj.sqlid,
              img_index: task.index,
              img_label: flag_label,
              img_url: task.obj.url,
              is_delete:is_delete,
              group_id: task.group_id,
              create_time: new Date()
            });
            // 处理是否已经全部标注
            var obj = SimpleChat.Messages.findOne({_id: task._id});
            if (obj && obj.images && obj.images){
              obj.admin_label = true;
              obj.images.map(function(img){
                if (!img.admin_label)
                  obj.admin_label = false;
              });
              if (obj.admin_label === true)
                SimpleChat.Messages.update({_id: task._id}, {$set: {admin_label: true}});
            }
            if (is_delete) {
              return;
            }
            try {
              if(task.obj.img_type && task.obj.img_type == 'face') {
                var person_info = {
                  //'id': res[updateObj.images[i].label].faceId,
                  'uuid': task.uuid,
                  'name': nameOrReason,
                  'group_id': task.group_id,
                  'img_url': task.obj.url,
                  'type': task.obj.img_type,
                  'ts': new Date(task.create_time).getTime(),
                  'accuracy': 1,
                  'fuzziness': 1,
                  'sqlid': task.obj.sqlid,
                  'style': task.obj.style
                };
                var data = {
                  face_id:task.obj.id,
                  person_info: person_info,
                  formLabel:true //是否是聊天室标记
                };
                console.log('data in index.js is: ',JSON.stringify(data));
                //Meteor.call('send-person-to-web', person_info, function(err, res){});
                Meteor.call('ai-checkin-out',data,function(err,res){});
              }
            } catch(e){}

          });
        });
        $(e.currentTarget).html(flag);
        $('.btn-default').show();
        selected.set([]);
        alert(flag+TAPi18n.__("done"));
        loadMoreImg();
      });

    };
    if (e.currentTarget.id == 'not-label-del'){
      type = 'delete';
      $('.label-btn').hide();
      SimpleChat.show_remove(call_back_handle);
      return;
    }
    if (e.currentTarget.id == 'not-label-label') {
      type = 'label';
      $('.del-btn').hide();
      SimpleChat.show_label(t.data.id, call_back_handle);
      return;
    }

    if (e.currentTarget.id == 'labeled-label'){
      console.log('a is not b');
      var lists = lebeledPreLists.get();
      console.log(lists);
      // To DO
      return;
    }
    if (e.currentTarget.id == 'labeled-del') {
      console.log('is not a');
      var lists = lebeledPreLists.get();
      console.log(lists);     
      // 从person 表中删除相应face
      Meteor.call('remove-person-face',lists, function(err, res){
        if(err){
          console.log('groupPhoto labeled del Err:'+err);
          return PUB.toast(TAPi18n.__("The_deletion_failed_please_try_again"));
        }
        for(var i=0; i < lists.length; i++) {
          // 告诉平板， 这不是a
          var trainsetObj = {
            group_id: lists[i].group_id,
            type: 'trainset',
            url: lists[i].face_url,
            person_id: '',
            device_id: lists[i].device_id,
            face_id: lists[i].face_id,
            drop: true,
            img_type: 'face',
            style:'front',
            sqlid: 0
          }
          console.log('groupPhoto labeled del trainsetObj='+JSON.stringify(trainsetObj));
          sendMqttMessage('/device/'+lists[i].group_id, trainsetObj);
          try{
            $('#'+lists[i].face_id).remove();
          } catch (err){}
        };
        selected2.set([]);
        lebeledPreLists.set([]);
      });
      return;
    }
  }
});


var loadMoreImg = function(){
  var img_item_count = $('.wait-label-item').length;
  if (img_item_count >= 20) {
    return;
  }
  limit = limit1.get() + limitSetp;
  limit1.set(limit);
  SimpleChat.withMessageHisEnable && SimpleChat.loadMoreMesage({is_people: true, 'to.id': data.id,admin_label: {$ne: true}}, {limit: limit, sort: {create_time: -1}}, limit);
}

// lazyload
var lazyloadInitTimeout = {'TAPi18n.__("Unlabeled")': null, 'TAPi18n.__("Labeled")': null,'labelDataset':null};
var lazyloadInit = function($ul, type){
  lazyloadInitTimeout[type] && Meteor.clearTimeout(lazyloadInitTimeout[type]);
  lazyloadInitTimeout[type] = Meteor.setTimeout(function(){
    $ul.find('img.lazy:not([src])').lazyload({
      container: $ul.parent()
    });
    lazyloadInitTimeout[type] && Meteor.clearTimeout(lazyloadInitTimeout[type]);
  }, 600);
};

Template.groupPhoto.onRendered(function(){
  var group_id = Router.current().params._id;
  Meteor.subscribe('group_person',group_id, limit2.get(),{
    onReady: function(){
      Session.set('group_person_loaded',true);
    },
    onStop: function(err){
      console.log(err);
    }
  });
  var data = this.data;
  SimpleChat.withMessageHisEnable && SimpleChat.loadMoreMesage({is_people: true, 'to.id': data.id,admin_label: {$ne: true}}, {limit: limitSetp, sort: {create_time: -1}}, limitSetp);

  this.$('.photos').each(function(){
    $(this).scroll(function(){
      var height = $(this).find('> ul').height();
      var top = $(this).scrollTop();
      if ($(this).scrollTop() <= 0){
        var limit = 0;
        if (type.get() === TAPi18n.__("Unlabeled")){
          limit = limit1.get() + limitSetp;
          limit1.set(limit);
          SimpleChat.withMessageHisEnable && SimpleChat.loadMoreMesage({is_people: true, 'to.id': data.id,admin_label: {$ne: true}}, {limit: limit, sort: {create_time: -1}}, limit);
        } else {
          limit = limit2.get() + 50;
          limit2.set(limit);
          Meteor.subscribe('group_person',group_id, limit2.get());
        }
        console.log('=='+ TAPi18n.__("Already_scrolled_to_the_top")+type.get()+' ==');
      } else if (height-top <= $(this).height() -20){
        if (type.get() === TAPi18n.__("Unlabeled"))
          limit1.set(limit1.get()+limitSetp);
        else
          limit2.set(limit2.get()+50);
        console.log('=='+ TAPi18n.__("Already_scrolled_to_the_bottom")+type.get()+' ==');
      }
    });
  });

  // disable img longpress default events
  $(document).on('touchstart','img', function(e){
    e.stopPropagation();
    e.preventDefault();
  });
});

Template.groupPhotoImg.onRendered(function(){
  var $img = this.$('img');
  // console.log($img, $img.parent().parent(), $img.parent().parent().attr('data-type'));
  lazyloadInit($img.parent().parent(), $img.parent().parent().attr('data-type'));
});

Template.groupPhotoImg1.onRendered(function(){
  var $img = this.$('img');
  // console.log($img, $img.parent().parent(), $img.parent().parent().attr('data-type'));
  lazyloadInit($img.parent().parent(), $img.parent().parent().attr('data-type'));
});

Template.groupPhotoImg.helpers({
  has_selected: function(val1, val2){
    var id = val1 + '|' + val2; 
    return selected.get().indexOf(id) >= 0;
  },
  is_type: function(val){
    return type.get() === val;
  }
});

Template.groupPhotoImg.events({
  'click li': function(e, t){
    if (type.get() != TAPi18n.__("Unlabeled"))
      return;

    var id = e.currentTarget.id + '|' + this._id;
    var res = selected.get();
    var index = res.indexOf(id);
    if (index >= 0)
      res.splice(index, 1);
    else
      res.push(id);
    selected.set(res);
    console.log(id);
  }
});

Template.groupPhoto.open = function(id){
  view && Blaze.remove(view);
  type.set(TAPi18n.__("Unlabeled"));
  limit1.set(limitSetp);
  limit2.set(50);
  selected.set([]);

  var data = {
    id: id,
    limit: type.get() === TAPi18n.__("Unlabeled") ? limit1.get() : limit2.get(),
    // list1: SimpleChat.Messages.find({is_people: true, 'to.id': id}, {limit: limit1.get(), sort: {create_time: 1}}),
    // list2: SimpleChat.Messages.find({is_people: true, 'to.id': id}, {limit: limit1.get(), sort: {create_time: 1}}),
    type: type.get()
  };
  Session.set('group_person_loaded',false);
  view = Blaze.renderWithData(Template.groupPhoto, data, document.body);
  $('body').css('overflow', 'hidden');
  $('.groupsProfile').hide();
};

Template.groupPhoto.close = function(){
  // 释放变量
  limit1.set(0);
  limit2.set(0);
  selected.set([]);
  selected2.set([]);
  lebeledPreLists.set([]);
  
  view && Blaze.remove(view);
  view = null;
  $('body').css('overflow', 'auto');
  $('.groupsProfile').show();
};


// Template.groupPhotoImg1.helpers({
//   has_selected: function(id){
//     return selected2.get().indexOf(id) >= 0;
//   },
// });

Template.groupPhotoImg1.helpers({
  getLabelTimes: function() {
    var times = this.label_times;
    if(times && Number(times) > 999){
      return '999+';
    }
    return times;
  },
  isNeedLabelMore: function() {
    return this.imgCount < 15;
  }
});

Template.groupPhotoImg1.events({
  'click .labelMoreImage': function (e) {
    e.stopPropagation();
    e.preventDefault();

    var group_id = Router.current().params._id;
    var deviceLists =  Devices.find({groupId: group_id}).fetch();
    
    if (deviceLists && deviceLists.length > 0) {
      if(deviceLists.length == 1 && deviceLists[0].uuid) {
        return PUB.page('/timelineAlbum/'+deviceLists[0].uuid+'?from=groupchat');
      } else {
        Session.set('_groupChatDeviceLists',deviceLists);
        return $('._checkGroupDevice').fadeIn();
      }
    }
    return PUB.toast(TAPi18n.__("No_face_box_under_the_monitoring_group"));

  },
  'click li': function(e){
    var self = this;
    
    // remove or reName Person
    var options = {
      title: TAPi18n.__("please_choose"),
      buttonLabels: [TAPi18n.__("View_all_photos_of_this_person"),TAPi18n.__("Delete_this_person"),TAPi18n.__("Rename_this_person")],
      addCancelButtonWithLabel: TAPi18n.__("cancel"),
      androidEnableCancelButton: true
    };

    window.plugins.actionsheet.show(options, function(index) {
      switch (index) {
        case 1:
          return Template.person_labelDataset.open(self.group_id,self.name);
          break;
        case 2:
          var confirmTitle = TAPi18n.__("To_delete")+self.name+'」?';
          PUB.confirm(confirmTitle, function() {
            Meteor.call('removePersonById', self._id, function(error, result) {
              if (error) {
                console.log(error);
                return PUB.toast(TAPi18n.__("The_deletion_failed_please_try_again"));
              }
              var trainsetObj = {
                group_id: self.group_id,
                face_id: self.faceId,
                drop_person: true,
              };
              console.log('removePersonById'+JSON.stringify(trainsetObj));
              sendMqttMessage('/device/'+self.group_id, trainsetObj);
              //重新训练
              retrain(self.group_id);
              return PUB.toast(TAPi18n.__("Deleted"));
            });
          });
          break;
        case 3:
          var promptTip = TAPi18n.__("Enter_a_new_name_to_rename_this_Person");
          var promptTitle = TAPi18n.__("Rename")+self.name+'」';
          navigator.notification.prompt(promptTip, function(results) {
            var newName = results.input1;
            newName = newName.replace(/(^\s*)|(\s*$)/g,"");
            if (results.buttonIndex == 2) {
              if (!newName) {
                return PUB.toast(TAPi18n.__("Please_type_in_your_name"));
              }
              Meteor.call('renamePerson',self._id, newName,function(err, res) {
                if (err) {
                  console.log('==sr==,error = '+err);
                  return PUB.toast(TAPi18n.__("Rename_failed"))
                }
                return PUB.toast(TAPi18n.__("Has_been")+self.name+TAPi18n.__("Renamed_to")+newName+'」');
              });
            }
          }, promptTitle, [TAPi18n.__("cancel"),TAPi18n.__("Rename_this_person")], '');
          break;
        default:
          break;
      }
    });

    // return Template.person_labelDataset.open(group_id,name);
    /*var id = this.id;
    var res = selected2.get();
    var index = res.indexOf(id);
    var lists = lebeledPreLists.get();
    if(index >= 0){
      res.splice(index, 1);
      lists.splice(index,1);
    } else {
      res.push(id);
      lists.push({
        face_id: this.id,
        face_url: this.url,
        group_id: $(e.currentTarget).data('gid'),
        device_id: $(e.currentTarget).data('did'),
        faceId: $(e.currentTarget).data('fid'),
        name: $(e.currentTarget).data('name')
      });
    }
    console.log(res);
    console.log(lists);
    selected2.set(res);
    lebeledPreLists.set(lists);*/
  }
})

Template.labelDatasetImg.onRendered(function(){
  var $img = this.$('img');
  // console.log($img, $img.parent().parent(), $img.parent().parent().attr('data-type'));
  lazyloadInit($img.parent().parent(), $img.parent().parent().attr('data-type'));
});

Template.labelDatasetImg.helpers({
  has_selected: function(id){
    return selected2.get().indexOf(id) >= 0;
  },
});

Template.labelDatasetImg.events({
  'click li': function(e){
    e.preventDefault();
    e.stopPropagation();
    var id = this._id;
    var res = selected2.get();
    var index = res.indexOf(id);
    var lists = lebeledPreLists.get();
    if(index >= 0){
      res.splice(index, 1);
      lists.splice(index,1);
    } else {
      res.push(id);
      lists.push({
        face_id: this.id,
        face_url: this.url,
        group_id: $(e.currentTarget).data('gid'),
        device_id: $(e.currentTarget).data('did'),
        faceId: $(e.currentTarget).data('fid'),
        name: $(e.currentTarget).data('name')
      });
    }
    console.log(res);
    console.log(lists);
    selected2.set(res);
    lebeledPreLists.set(lists);
  }
});

Template.person_labelDataset.open = function(group_id,name){
  dadaset_view && Blaze.remove(dadaset_view);
  limit3.set(50);
  selected2.set([]);

  var data = {
    group_id: group_id,
    name:name,
    limit: limit3.get(),
  };
  Session.set('lableDadaSetLoaded',false);
  dadaset_view = Blaze.renderWithData(Template.person_labelDataset, data, document.body);
};

Template.person_labelDataset.close = function(){
    // 释放变量
  limit3.set(0);
  selected2.set([]);
  lebeledPreLists.set([]);
  
  dadaset_view && Blaze.remove(dadaset_view);
  dadaset_view = null;
};

Template.person_labelDataset.onRendered(function(){
  var data = this.data;
  var group_id = data && data.group_id ;
  Meteor.subscribe('person_labelDataset',group_id,data.name, limit3.get(),{
    onReady: function(){
      Session.set('lableDadaSetLoaded',true);
    },
    onStop: function(err){
      console.log(err);
    }
  });
  $('.photos').scroll(function(){
    var height = $(this).find('> ul').height();
    var top = $(this).scrollTop();
    if (height-top <= $(this).height() -20){
      var limit = limit3.get() + 50;
      limit3.set(limit);
      Meteor.subscribe('person_labelDataset',group_id,data.name, limit3.get());
    }
  });
});

Template.person_labelDataset.helpers({
  list:function(){
    return LableDadaSet.find({group_id: this.group_id,name:this.name},{limit: limit3.get(), sort:{createAt: -1}}).fetch();
  },
  is_selected2:function(){
    return selected2.get().length > 0 ;
  },
  isLoading:function(){
    return Session.get('lableDadaSetLoaded') != true;
  }
});

Template.person_labelDataset.events({
  // 全选
  'click #selectAll': function(){
    var lists = [];
    var preLists = [];
    LableDadaSet.find({group_id: this.group_id,name:this.name},{limit: limit3.get(), sort:{createAt: -1}}).forEach(function(item){
      lists.push(item._id);
      preLists.push({
        face_id: item.id,
        face_url: item.url,
        group_id: item.group_id,
        device_id: item.uuid,
        faceId: item.id,
        name: item.name
      });
    });

    console.log(lists);
    console.log(preLists);
    selected2.set(lists);
    lebeledPreLists.set(preLists);
  },
  // 全不选
  'click #unSelectAll': function(){
    selected2.set([]);
    lebeledPreLists.set([]);
  },
  'click .back': function(){
    Template.person_labelDataset.close();
  },
  'click .btn-default': function(e, t){
    if (e.currentTarget.id == 'labeled-del') {
      console.log('is not a');
      var lists = lebeledPreLists.get();
      console.log(lists);
      // 从person 表中删除相应face
      Meteor.call('remove-person-face',lists, function(err, res){
        if(err){
          console.log('groupPhoto labeled del Err:'+err);
          return PUB.toast(TAPi18n.__("The_deletion_failed_please_try_again"));
        }
        for(var i=0; i < lists.length; i++) {
          // 告诉平板， 这不是a
          var trainsetObj = {
            group_id: lists[i].group_id,
            type: 'trainset',
            url: lists[i].face_url,
            person_id: '',
            device_id: lists[i].device_id,
            face_id: lists[i].face_id,
            drop: true,
            img_type: 'face',
            style:'front',
            sqlid: 0
          }
          console.log('groupPhoto labeled del trainsetObj='+JSON.stringify(trainsetObj));
          sendMqttMessage('/device/'+lists[i].group_id, trainsetObj);
          try{
            $('#'+lists[i].face_id).remove();
          } catch (err){}
        };
        selected2.set([]);
        lebeledPreLists.set([]);
        //重新训练
        retrain(lists[0].group_id);
      });
      return;
    }
  }
});





