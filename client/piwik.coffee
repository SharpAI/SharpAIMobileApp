window.trackByPiwik = false
window.trackEvent=(category, action)->
  try
    console.log('Track Event')
    if typeof(piwik) isnt 'undefined'
      piwik.trackEvent(category, action)
    else if window.trackByPiwik is true
      $.getScript('http://piwik.tiegushi.com/piwik.js' ,()->
        console.log('Got piwik')
        window.piwik = Piwik.getTracker( 'http://piwik.tiegushi.com/piwik.php', 14 )
        piwik.trackEvent(category, action)
      )
  catch error
    console.log('trackevent exception')

window.trackImportEvent=(url)->
  try
    console.log('Track Event')
    if typeof(piwik) isnt 'undefined'
      piwik.trackEvent('logs', 'import', 'URL', url)
    else if window.trackByPiwik is true
      $.getScript('http://piwik.tiegushi.com/piwik.js' ,()->
        console.log('Got piwik')
        window.piwik = Piwik.getTracker( 'http://piwik.tiegushi.com/piwik.php', 14 )
        piwik.trackEvent('logs', 'import', 'URL', url)
      )
  catch error
    console.log('trackevent exception')

window.trackPage=(url,title)->
  try
    console.log('Track URL')
    if typeof(piwik) is 'undefined'
      initPiwik(url,title)
    else if window.trackByPiwik is true
      piwik.setCustomUrl(url)
      piwik.setReferrerUrl(url)
      piwik.setDocumentTitle(title)
      piwik.trackPageView()
  catch error
    console.log('trackpage exception')

initPiwik=(url,title)->
  if typeof(Piwik) isnt 'undefined'
    console.log('Has piwik');
  else if window.trackByPiwik is true
    $.getScript('http://piwik.tiegushi.com/piwik.js' ,()->
      console.log('Got piwik')
      window.piwik = Piwik.getTracker( 'http://piwik.tiegushi.com/piwik.php', 14 )
      piwik.setCustomUrl(url)
      piwik.setReferrerUrl(url)
      piwik.setDocumentTitle(title)
      piwik.trackPageView()
    )
