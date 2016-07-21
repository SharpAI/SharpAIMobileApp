if Meteor.isServer
  # # ddp = DDP.connect 'http://host1.tiegushi.com'
  # refNames = new Meteor.Collection("refnames")#, {connection: ddp})
  # refNameCount = refNames.find({}).count()
  
  # # test data
  # if refNameCount <= 0
  #   refNames.insert({text: '李白'})
  #   refNames.insert({text: '赵云'})
  #   refNames.insert({text: '大白'})
  #   refNames.insert({text: '曹操'})
  #   refNames.insert({text: '林冲'})


  # ddp = DDP.connect 'http://host1.tiegushi.com'
  db_url= process.env.MONGO_GUSHITIE_URL || 'mongodb://hotShareAdmin:aei_19056@host1.tiegushi.com:27017/hotShare'
  connect = MongoInternals.NpmModule.MongoClient.connect
  connect = Meteor.wrapAsync(connect, {server : { reconnectTries : 3000, reconnectInterval: 2000, autoReconnect : true }})

  db = connect(db_url)
  @GushitieUsers = db.collection('users')

  GushitieUsers.aggregate = Meteor.wrapAsync(GushitieUsers.aggregate, GushitieUsers)
  GushitieUsers.insert = Meteor.wrapAsync(GushitieUsers.insert, GushitieUsers)
  GushitieUsers.update = Meteor.wrapAsync(GushitieUsers.update, GushitieUsers)
  GushitieUsers.findOne = Meteor.wrapAsync(GushitieUsers.findOne, GushitieUsers)
  GushitieUsers._ensureIndex = Meteor.wrapAsync(GushitieUsers.ensureIndex, GushitieUsers)

  GushitieDB = new MongoInternals.RemoteCollectionDriver(db_url)
  GushitieRefnames = new Mongo.Collection("refnames", { _driver: GushitieDB })
  refNameCount = GushitieRefnames.find({}).count()
  console.log 'refNameCount:' + refNameCount

  @getOrCreateGushiTieServiceAccount=(userId)->
    gushitieUser = GushitieUsers.findOne({_id:userId})
    console.log(gushitieUser)
    result = Accounts.updateOrCreateUserFromExternalService('gushitie', {id: userId, _OAuthCustom: true}, {})
    if gushitieUser and gushitieUser.username
      gushitieUsername = gushitieUser.username
    else
      gushitieUsername = gushitieUser.profile.fullname
    try
      Meteor.users.update({_id: result.userId},{
          $set: {
            username: gushitieUsername
            name: gushitieUser.profile.fullname
            'services.gushitie.icon': gushitieUser.profile.icon
            avatarOrigin: 'url'
            avatarUrl:gushitieUser.profile.icon
          }
        }
      )
    catch err
      console.log(err)

    console.log(result)
    return result
  Accounts.registerLoginHandler('anonymous', (options)->
    unless (options.uuid or options.userId)
      throw new Meteor.Error(403, 'Missing parameter: UUID/UserID');

    if options.uuid
      skip = Math.ceil(Random.fraction()*(refNameCount-1))
      name = GushitieRefnames.find({}, {skip: skip, limit: 1}).fetch()[0].text
      username = Random.id()
      user = Meteor.users.findOne({'services.anonymous.id': options.uuid})
      result = Accounts.updateOrCreateUserFromExternalService('anonymous', {id: options.uuid, _OAuthCustom: true}, {})
      console.log(user)

      if !user or !user.name
        Meteor.users.update({_id: result.userId}, {$set: {username: username, name: name}})
      # unless user.name
      #   Meteor.users.update({_id: result.userId}, {$set: {username: username, name: name}})

      return result
    if options.userId
      # unless user.name
      #   Meteor.users.update({_id: result.userId}, {$set: {username: username, name: name}})
      result=getOrCreateGushiTieServiceAccount(options.userId)
      return result
  )