
if Meteor.isClient
  @getImagePath=(path,uri,id)->
    if !path or !id
      return ''
    $selector = $(".image_"+id)
    if path.indexOf('cdvfile://') > -1 and (window.wkwebview or withLocalBase64)
      if $selector and $selector.attr('src') and $selector.attr('src') isnt '' and $selector.attr('src').indexOf('data:') is 0
        return $selector.attr('src')
      fileExtension = uri.replace(/^.*\./, '')
      console.log('Path need to be replaced ' + path + ' this URI ' + uri + ' extension ' + fileExtension)
      `
          window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function() {
              window.resolveLocalFileSystemURL(uri, function (fileEntry) {
                  fileEntry.file(function (file) {
                      var reader = new FileReader();
                      reader.onloadend = function (event) {
                          var localURL = event.target._localURL;
                          //retCount++;
                          var smallImage = event.target.result;
                          console.log('got small image ');
                          $(".image_"+id).attr('src',smallImage);
                      };
                      reader.readAsDataURL(file);
                  }, function (e) {
                      console.log('fileEntry.file Error = ' + e);
                  });
              }, function (e) {
                  console.log('resolveLocalFileSystemURL Error = ' + e);
              });
          },function(){
              console.log('Request file system error');
          });
      `
      return ''
    path
  reCaculateAndSetItemHeight = (node,textarea)->
    #Compute the new scrollHeight
    grid_size=Math.floor(getDisplayElementWidth()/6 - baseGap*2);
    min_widget_height = (baseGap * 2) + grid_size;
    scrollHeight = document.getElementById(node.id+"TextArea").scrollHeight
    $(textarea).css('height', 'auto').css('height', scrollHeight);
    sizey = Math.ceil((scrollHeight+baseGap*2)/min_widget_height)
    resizeItem = $('#'+node.id)
    orig_sizey = parseInt(resizeItem.attr("data-sizey"))
    if sizey isnt orig_sizey
      height = sizey*min_widget_height - baseGap*2
      resizeItem.css("height", height)
      $(node).css('height', "")
      sizex = parseInt(resizeItem.attr("data-sizex"))
      gridster.resize_widget(resizeItem, sizex,sizey)
  toolbarHiddenHandle = (event,node)->
    if Session.get('textMenu') isnt 'main'
      setTimeout ()->
        Session.set 'textMenu','main'
        $(node).data('toolbarObj').options.content= '#text-toolbar-options'
        $(node).data('toolbarObj').reInitializeToolbar()
      ,500
  toolbarMainMenuClickHandle = (event, buttonClicked,node,grid)->
    $(node).data('toolbarObj').hide()
    textdiv = $(event.target).children('.textdiv')
    textarea = textdiv.children('textarea')
    doc_id =  $(textarea).attr("text")
    if buttonClicked.id == "modify"
      $(textarea).attr('readOnly',false)
      $(textarea).off('focus')
      $(textarea).off('focusout')
      $(textarea).off('blur')
      `global_disable_longpress = true`
      `global_toolbar_hidden = true`

      height = $('.addPost').height()
      $(node).css('z-index', 20)
      $('#blur_overlay').css('height',height)
      #gridster pressed_revert's z-index is 10. blur should be larger than 10. otherwise,
      #some image may not be in blur status.
      $('#blur_overlay').css('z-index', 14)

      $(textarea).focus(()->
        Session.set('textareaFocused', true)
        console.log("textareaFocused true")
        $(node).addClass("edit");
        $(textarea).off('focus')
        $(".head").css 'position','absolute'
      )

      $(textarea).focus()

      $(textarea).focusout(()->
        console.log("focusout")
        $(this).attr("readOnly", true)
        `global_disable_longpress = false`
        `global_toolbar_hidden = false`
        Session.set('textareaFocused', false)
        console.log("textareaFocused false")
        $('#blur_overlay').css('height','')
        $(node).css('z-index', '')
        $(node).removeClass("edit");
        Template.addPost.__helpers.get('saveDraft')()

        $(textarea).off('focusout')
        $(".head").css 'position','fixed'
      )

    else if buttonClicked.id == "del"
      console.log("del "+ node.id)
      if gridster?
        gridster.remove_widget2(node, false)
      Drafts.remove node.id
    else if buttonClicked.id is "font"
      setTimeout ()->
        Session.set 'textMenu','font'
        $(node).data('toolbarObj').options.content= '#text-font-toolbar-options'
        $(node).data('toolbarObj').reInitializeToolbar()
        $(node).data('toolbarObj').show()
      ,500
    else if buttonClicked.id is "align"
      setTimeout ()->
        Session.set 'textMenu','align'
        $(node).data('toolbarObj').options.content= '#text-align-toolbar-options'
        $(node).data('toolbarObj').reInitializeToolbar()
        $(node).data('toolbarObj').show()
      ,500
    else if buttonClicked.id is "align-to-left"
      console.log 'Need align to left'
      textarea.css("text-align","left");
      Drafts.update({_id: doc_id}, {$set: {layout: {align:'left'}}});
    else if buttonClicked.id is "align-to-center"
      console.log 'Need align to center'
      textarea.css('text-align','center')
      Drafts.update({_id: doc_id}, {$set: {layout: {align:'center'}}});
    else if buttonClicked.id is "align-to-right"
      console.log 'Need align to right'
      textarea.css('text-align','right')
      Drafts.update({_id: doc_id}, {$set: {layout: {align:'right'}}});
    else if buttonClicked.id is "font-normal"
      console.log 'Need font-normal'
      reCaculateAndSetItemHeight(node,textarea)
      Drafts.update({_id: doc_id}, {$set: {layout: {font:'normal'}}});
    else if buttonClicked.id is "font-quota"
      console.log 'Need font-quota'
      reCaculateAndSetItemHeight(node,textarea)
      Drafts.update({_id: doc_id}, {$set: {layout: {font:'quota'}}});
    return
  appendNodeToLayoutEngine = (node,insertedObj,grid)->
    #console.log 'Added node id is ' + node.id
    unless grid
      return
    type = insertedObj.type
    if type is "text"
      if window.unSelectedElem
        insert_row = parseInt($(window.unSelectedElem).attr('data-row'))
        window.unSelectedElem = undefined
        console.log('Selected data-row is ' + insert_row)
        grid.add_widget(node, 6, 1, 1, insert_row)
      else if insertedObj.toTheEnd
        grid.add_widget(node, 6, 1, 1)
      else
        max_row = 1
        middle = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)/2
        middle = 150 if middle is 0
        $('.resortitem:near-viewport(-'+ middle+')').each( ( i, itemElem )->
          if i == 0
            max_row = parseInt($(itemElem).attr("data-row"))
          cur_row = parseInt($(itemElem).attr("data-row"))
          console.log("near-viewport id:"+ itemElem.id + " data-row:"+ cur_row)
          if max_row < cur_row
            max_row = cur_row
        )
        console.log("max_row " + max_row)
        grid.add_widget(node, 6, 1, 1, max_row)
    else if type is 'music'
      grid.add_widget(node, 6, 1, 1)
    else if type is "image"
      if insertedObj.inIframe and insertedObj.iframe
        console.log('to insert iframe')
        grid.add_widget(node, parseInt(insertedObj.data_sizex,baseGap*2), parseInt(insertedObj.data_sizey,baseGap*2))
      # Images loaded during rendering
      else if Session.get('NewImgAdd') is 'true'
        if (window.imageCounter2 % 3) is 0
          grid.add_widget(node, 6, 3,1,window.insertRow)
          window.insertRow +=3
        else if (window.imageCounter2 % 3) is 1
          grid.add_widget(node, 3, 3,1,window.insertRow)
        else
          grid.add_widget(node, 3, 3,4,window.insertRow)
          window.insertRow +=3
        window.imageCounter2++
      # Images to be inserted before the element
      else if window.unSelectedElem
        currentCount = insertedObj.currentCount
        totalCount = insertedObj.totalCount
        console.log("Now painting currentCount is " + currentCount + " totalCount is " + totalCount)
        if currentCount is 1
          insert_row = parseInt($(window.unSelectedElem).attr('data-row'))
          insert_col = parseInt($(window.unSelectedElem).attr('data-col'))
          insert_sizex = parseInt($(window.unSelectedElem).attr('data-sizex'))
          insert_sizey = parseInt($(window.unSelectedElem).attr('data-sizey'))
          if insert_col is 1
            window.nextCol = 4
            insert_sizex = 3
            insert_sizey = 3
            window.nextRow = insert_row
          else
            window.nextCol = 1
            insert_sizey = 3
            window.nextRow = insert_row + 3
        else
          insert_sizex = 3
          insert_sizey = 3
          insert_col = window.nextCol
          insert_row = window.nextRow
          if insert_col is 1
            window.nextCol = 4
          else
            window.nextCol = 1
            window.nextRow = insert_row + 3
        if currentCount >= totalCount
          window.unSelectedElem = undefined
        grid.add_widget(node, insert_sizex, insert_sizey, insert_col, insert_row)
      # To be inserted at the end of the screen.
      else if insertedObj.toTheEnd
        grid.add_widget(node, parseInt(insertedObj.data_sizex,baseGap*2), parseInt(insertedObj.data_sizey,baseGap*2))
      # To be inserted on the middle of screen.
      else
        max_row = 1
        middle = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)/2
        middle = 150 if middle is 0
        $('.resortitem:near-viewport(-'+ middle+')').each( ( i, itemElem )->
          if i == 0
            max_row = parseInt($(itemElem).attr("data-row"))
          cur_row = parseInt($(itemElem).attr("data-row"))
          console.log("near-viewport id:"+ itemElem.id + " data-row:"+ cur_row)
          if max_row < cur_row
            max_row = cur_row
        )
        console.log("max_row " + max_row)
        if window.add_image_to_right
          window.add_image_to_right = false
          grid.add_widget(node, 3, 3,4,max_row)
        else
          window.add_image_to_right = true
          grid.add_widget(node, 3, 3,1,max_row)
      return
    return
  cropHandlerOnImage = (node)->
    Session.set 'isReviewMode','3'
    Session.set 'cropDraftId',node.id

    $('#isImage'+node.id).css('display',"none")
    $('#crop'+node.id).css('display',"block")
    $('#'+node.id).css('z-index',"12")
    image = $(node).find('img').attr("src")
    style = $('#'+node.id).getStyleProp();
    if style is undefined
      style = ''
    scale = Drafts.findOne({_id:node.id}).scale
    if scale is undefined
      scale = 1
    console.log "imgUrl is "+image
    imgWidth = $(node).width()
    imgHeight = $(node).height()
    console.log "imgWidth is "+imgWidth
    console.log "imgHeight is "+imgHeight
    containerId= "#default"+node.id
    console.log "containerId is "+containerId
    crop = new CROP()
    crop.init {
      container: containerId,
      image: image,
      style: style,
      width: imgWidth,
      height: imgHeight,
      mask: false,
      zoom: {steps: 0.01,min: 1,max: 3,value: scale},
      callback: ()->
        console.log("crop-img width="+$("#default"+node.id+" .crop-img").width()+", scale="+scale)
        console.log("crop-img height="+$("#default"+node.id+" .crop-img").height())
        Session.set 'imgSizeW',$("#default"+node.id+" .crop-img").width()/scale
        Session.set 'imgSizeH',$("#default"+node.id+" .crop-img").height()/scale
    }
    if window.device.model is "iPhone7,1"
      top = $('#'+node.id).offset().top
      $('#blur_overlay').css('height',top)
      $('#blur_overlay').css('z-index', 14)
      height = $('#'+node.id).height()
      bottomTop = top + height
      $('#blur_bottom').css('top',bottomTop)
      docHeight = window.getDocHeight()
      bottomHeight = docHeight - bottomTop
      $('#blur_bottom').css('height',bottomHeight)

      $('#blur_left').css('top',top)
      $('#blur_right').css('top',top)
      $('#blur_left').css('height',height)
      $('#blur_right').css('height',height)

      left = $('#'+node.id).offset().left
      $('#blur_left').css('width',left)
      screenWidth = window.screen.width
      width = $('#'+node.id).width()
      right = screenWidth - left - width
      $('#blur_right').css('width',right)

    cropimg = $(containerId).find('.crop-overlay')[0]
    hammertime = new Hammer(cropimg)
    pinch = new Hammer.Pinch();
    rotate = new Hammer.Rotate();
    pinch.recognizeWith(rotate);
    hammertime.add([pinch, rotate]);
    initScale = 1
    pinchStatus = 0;
    hammertime.on("pinchstart pinchin pinchout pinchend", (e)->
      e.preventDefault();
      zoom = $(containerId).find('input')
      if e.type is 'pinchstart'
        initScale = zoom.val()
        pinchStatus = 1
      else if e.type is 'pinchend'
        initScale = zoom.val()
        pinchStatus = 0
      else if e.type is 'pinchin' or e.type is 'pinchout'
        if pinchStatus is 0
          return
        scale = initScale * e.scale;
        if scale > 3
          scale = 3
        else if scale < 1
          scale = 1
        crop.slider(scale);
        #apply background color to range progress
        zoom.val(scale)
    )
  initToolBar = (node,insertedObj,grid)->
    #console.log 'Added node id is ' + node.id
    type = insertedObj.type
    if type == "text"
      $(node).toolbar
        content: '#text-toolbar-options'
        position: 'top'
        hideOnClick: true
      $(node)
      .on 'toolbarItemClick', (event, buttonClicked)=>
        #console.log("toolbarItemClick on " + buttonClicked.id)
        toolbarMainMenuClickHandle(event, buttonClicked,node,grid)
      .on 'toolbarHidden', (event)=>
        console.log("toolbarHidden")
        toolbarHiddenHandle(event,node)

      $('#'+node.id+'TextArea').on('keyup input',(e)->
        e.preventDefault()
        id = this.id.replace("TextArea", "")
        grid_size=Math.floor(getDisplayElementWidth()/6 - baseGap*2)
        console.log('#display width is '+getDisplayElementWidth()+' .addPost width is '+$('.addPost').width())
        min_widget_height =  grid_size + baseGap*2;
        #offset = this.offsetHeight - this.clientHeight;
        $(this).css('height', 'auto').css('height', this.scrollHeight)

        sizey = Math.ceil((this.scrollHeight+baseGap*2)/min_widget_height)

        resizeItem = $('#'+id)
        #resizeItem.css("height", this.scrollHeight)
        orig_sizey = parseInt(resizeItem.attr("data-sizey"))
        console.log('sizey '+sizey+' this.scrollHeight '+this.scrollHeight+' min_widget_height'+min_widget_height)
        if gridster? and sizey isnt orig_sizey
          $(this).css('height', "")
          sizex = parseInt(resizeItem.attr("data-sizex"))
          gridster.resize_widget(resizeItem, sizex,sizey)
          console.log('propertychange sizey:'+ sizey + 'height:' +height + 'scrollHeight:'+this.scrollHeight)
        height = sizey*min_widget_height - baseGap*2
        resizeItem.css("line-height", height+'px')
      )
      text = insertedObj.text
      if text and text isnt ''
        Meteor.defer ()->
          $('#'+node.id+'TextArea').trigger('keyup')
    else if type is "image"
      $(node).toolbar
        content: '#image-toolbar-options'
        position: 'top'
        hideOnClick: true
      $(node).on 'toolbarItemClick',(event,buttonClicked)->
        console.log($(buttonClicked).attr('id')+' event on nodeid '+node.id)
        if buttonClicked.id is "del"
          console.log("del "+ node.id)
          if gridster?
            gridster.remove_widget2(node, false)
          Drafts.remove node.id
        else if buttonClicked.id is "crop"
          console.log("crop "+ node.id)
          cropHandlerOnImage(node)
        return
    return
  Template.addPostItem.onRendered ()->
    data=this.data
    type = data.type
    node=this.find('.resortitem')
    unless gridster
      initGridster()
    appendNodeToLayoutEngine(node,data,gridster)
    initToolBar(node,data,gridster)
    console.log('Type '+type)
    if type is "text" and (!data.noKeyboardPopup)
      $(node).trigger("toolbarItemClick", {id:"modify"})

  Template.addPostItem.helpers
    calcStyle: ()->
      # For backforward compatible. Only older version set style directly
      if this.style and this.style isnt ''
        ''
      else
        calcTextItemStyle(this.layout)
    getImagePath: (path,uri,id)->
      getImagePath(path,uri,id)
  Template.addPostItem.events
