// module for external API requests
// import request method to make requests
module.exports = {
  doRequest: require('request'),
  request: options => {
    return new Promise(
      (resolve, reject) => {
        module.exports.doRequest(options, (error, response, body) => {
          if(!error)
            resolve(body)
          else
            reject(error)
        })
      }
    )
  }
}