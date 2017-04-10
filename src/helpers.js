import { Blob } from 'blob-util'

let logDebugEnabled = true

/**
 * @param enabled true if logDebug() shall write messages to the console
 */
export function setLogDebug (enabled) {
  logDebugEnabled = enabled
}

/**
 * Write DEBUG log message to console
 * @param msg
 */
export function logDebug (msg) {
  if (logDebugEnabled) {
    console.log(msg)
  }
}

/**
 * Write ERROR log message to console
 * @param msg
 */
export function logError (msg) {
  console.log(`Error: ${msg}`)
}

// "payload":{"message":"Not Found","shortMessage":"LOGIN failed","type":404,"action":{"type":"LOGIN","payload":{"credentials":{"username":"admin@internal","password":"admi"}}}}}
export function hidePassword ({ action, param }) {
  if (action) {
    const hidden = JSON.parse(JSON.stringify(action))
    if (action.payload) {
      if (action.payload.credentials && action.payload.credentials.password) {
        hidden.payload.credentials.password = '*****'
      }

      if (action.payload.action && action.payload.action.payload &&
        action.payload.action.payload.credentials && action.payload.action.payload.credentials.password) {
        hidden.payload.action.payload.credentials.password = '*****'
      }
    }
    return hidden
  }

  if (param) {
    if (param['password']) {
      const hidden = JSON.parse(JSON.stringify(param))
      hidden.password = '*****'
      return hidden
    }
    return param
  }

  return action
}

export function formatTwoDigits (num) {
  return String('0' + num).slice(-2)
}

/**
 * Download given content as a file in the browser
 *
 * @param data Content of the file
 * @param fileName
 * @param mimeType
 * @returns {*}
 */
export function fileDownload ({ data, fileName = 'myFile.dat', mimeType = 'application/octet-stream' }) {
  if (data) {
    const a = document.createElement('a')

    if (navigator.msSaveBlob) { // IE10
      return navigator.msSaveBlob(new Blob([data], { mimeType }), fileName)
    } else if ('download' in a) { // html5 A[download]
      a.href = `data:${mimeType},${encodeURIComponent(data)}`
      a.setAttribute('download', fileName)
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      return true
    } else { // do iframe dataURL download (old ch+FF):
      const f = document.createElement('iframe')
      document.body.appendChild(f)
      f.src = `data:${mimeType},${encodeURIComponent(data)}`
      setTimeout(() => document.body.removeChild(f), 333)
      return true
    }
  }
}

export function valuesOfObject (obj) {
  return Object.keys(obj).map(key => obj[key])
}

export function getURLQueryParameterByName (name, url) {
  if (!url) {
    url = window.location.href
  }
  name = name.replace(/[\[\]]/g, '\\$&')
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  const results = regex.exec(url)

  if (!results) {
    return null
  }
  if (!results[2]) {
    return ''
  }

  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}
