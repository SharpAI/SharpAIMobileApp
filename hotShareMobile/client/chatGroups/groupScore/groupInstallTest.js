//0:不显示 1:开始测试 2:点击右上角 3:安装检查
var showPop = new ReactiveVar(0);
var labelScore = new ReactiveVar('-/-');
var roateScore = new ReactiveVar('-/-');
var timer;
Template.groupInstallTest.onRendered(function(){
    var group_id = Router.current().params._id;
    Meteor.subscribe('device_by_groupId',group_id);
    showPop.set(1);
})

Template.groupInstallTest.helpers({
    popupConfig:function(){
        var s = showPop.get();
        var isShow = s === 0?"display:none;":"";
        var content = '';
        var btn = '';
        var head = '';
        switch(s){
            case 1:
                content = '点击开始之前，请确保只有一人进入摄像头画面，点击开始之后，请距离1-2米正面对着摄像头20秒后离开';
                btn = '开始';
                break;
            case 2:
                content = '请点击右上角查看帮助';
                btn = '确定';
                break;
            case 3:
                head = '请按以下步骤检查';
                content = '<p>1.按照摄像头说明安装好</p><p>2.盒子启动-能正常扫到盒子</p><p>3.摄像头配置-调整摄像头参数及shinobi导入</p>';
                btn = "确定";
                break;

        }
        return {
            isShow:isShow,
            content:content,
            btn:btn,
            head:head
        }
    },
})
Template.groupInstallTest.events({
    'click .check':function(e){
        showPop.set(3);
    },
    'click .back':function(e){
        e.preventDefault();
        e.stopPropagation();
        var s = Session.get('isStarting');
        if(s && s.isTesting){
            return PUB.toast('正在测试中，请勿离开');
        }
        Session.set('isStarting',null);
        return PUB.back();
    },
    'click #operate':function(e){
        e.stopPropagation();
        var t = showPop.get();
        if(t == 1){
            var group_id = Router.current().params._id;
            Session.set('isStarting',{
                isTesting:true,
                group_id:group_id
            })
            //开始测试
            $('.progress-bar').addClass('time');
            timer = Meteor.setTimeout(test_score,40*1000);
        }
        showPop.set(0);
    },

})
var test_score = function(){
    $('.progress').hide();
    $('.progress-bar').removeClass('time');
    var st = Session.get('isStarting');
    st.isTesting = false;
    st.showScore = true;
    
    var totalCount = message_queue.length;
    var labelArr = _.filter(message_queue,function(m){
        if(m.label &&  m.label != ''){
            return true;
        }
        return false;
    });
    var frontArr = _.filter(message_queue,function(m){
        return m.style == 'front'
    });
    var front_len = frontArr.length;
    if(totalCount != 0){
        roateScore.set(Math.floor(front_len/totalCount * 100) + '');
    }else{
        roateScore.set('0');
        showPop.set(2);
    }
    if(front_len != 0){
        labelScore.set(Math.floor(labelArr.length/front_len * 100) + '');
    }else{
        labelScore.set('0');
    }
    message_queue = [];
    if(totalCount == 0 || front_len == 0){
        st.status = "fail";
    }else{
        st.status = "success";
    }
    Session.set('isStarting',st);
}
Template.popup.events({
    'click .close':function(){
        showPop.set(0);
    }
})
Template.score.helpers({
    label_score:function(){
        return labelScore.get();
    },
    roate_score:function(){
        return roateScore.get();
    },
    cancel:function(){
        var s = Session.get('isStarting');
        if(!s || s.isTesting){
            return true;
        }
        return false;
    },
    isSuccess:function(){
        var s = Session.get('isStarting');
        if(s.status == "success"){
            return true;
        }
        return false;
    },
    testres:function(tag){
        console.log(tag);
        if(tag == 1 && labelScore.get()>70){
            return true;
        }
        if(tag == 2 && roateScore.get()>70){
            return true;
        }
        return false;
    },
    showBtn:function(){
        var s = Session.get('isStarting');
        if(!s || s.isTesting){
            return false;
        }
        return true;
    },
})

Template.score.onRendered(function(){
})
Template.score.events({
    'click #restart':function(e){
        labelScore.set('-/-');
        roateScore.set('-/-');
        message_queue = [];
        var st = Session.get('isStarting');
        st.isTesting = true;
        st.showScore = null;
        Session.set('isStarting',st);
        $('.progress').show();
        $('.progress-bar').addClass('time');
        timer = Meteor.setTimeout(test_score,40*1000);
    },
    'click #goTimeLine':function(){
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
        return PUB.toast('该群组下暂无设备');
    },
    'click #goLink':function(e){
        var ref = cordova.ThemeableBrowser.open('http://workaiossqn.tiegushi.com/description.pdf', '_blank', {  
            title: {  
                color: '#000000',  
                showPageTitle: true,  
                staticText: '部署说明'  
            },  
            closeButton: {  
                image: 'back',  
                imagePressed: 'back_pressed',  
                align: 'left',  
                event: 'closePressed'  
            },
            statusbar: {
                color: '#37a7fe'
            },
            toolbar: {  
                height: 44,
                color: '#37a7fe' 
            }  
        }); 
        ref.addEventListener('closePressed', function(event) {
            return ref.close();
        }); 
    }
})
var message_queue = [];
GroupInstallTest = function(message){
    message = JSON.parse(message);
    console.log('GroupInstallTest');
    if(message.event_type == "motion"){
        return;
    }
    if(message.images && message.images.length>0){
        message_queue.push.apply(message_queue,message.images);
    } 
    console.log('GroupInstallTest',message_queue.length); 
}