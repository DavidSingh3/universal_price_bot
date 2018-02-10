const Discord = require('discord.io')
const request = require('./requests').request

const API_host = process.env.API_host || 'http://localhost'

// Initialize Discord Bot
const bot = new Discord.Client({
  token: process.env.token,
  autorun: true
})

const requestLimit = 1e3 * 30 // seconds to milliseconds
const userLock = {}
const privilegedUsers = [
  '222527365664735233' // F40PH
]

bot.on('ready', function (evt) {
  console.log('Connected')
  console.log('Logged in as: ')
  console.log(bot.username + ' - (' + bot.id + ')')
})

bot.on('message', async (user, userID, channelID, message, evt) => {
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`
  if (message.substring(0, 1) === '!') {
    let args = message.substring(1).split(' ')
    const cmd = args[0]

    args = args.splice(1).map(arg => arg.toUpperCase())
    switch (cmd) {
      case 'price':
        if (args.length !== 2)
          break

        if (userLock[userID]) {
          const lastRequested = userLock[userID]
          const now = Date.now()
          const millisecondsAgo = now - lastRequested
          const rem = requestLimit - millisecondsAgo
          if (rem > 0) {
            bot.sendMessage({
              to: channelID,
              message: '```' + user + ' must wait ' + parseInt(rem / 1e3) + ' more seconds before requesting another price.```'
            })
            break
          }
        }
        try {
          userLock.forEach(
            user => {
              const lastRequested = userLock[user]
              const now = Date.now()
              const millisecondsAgo = now - lastRequested
              const rem = requestLimit - millisecondsAgo
              if(rem <= 0)
                delete userLock[user]
            }
          )
        } catch (e) {
          console.log(e)
        }

        if (privilegedUsers.indexOf(userID) === -1)
          userLock[userID] = Date.now()

        try {
          const options = {
            method: 'POST',
            url: API_host + '/price/' + args[0] + '/' + args[1],
            headers: {
              'Cache-Control': 'no-cache',
              'User-Agent': 'none',
              'Content-Type': 'application/json'
            }
          }
          const req = await request(options, (response, body) => response)
          console.log(req)
          const data = JSON.parse(req)
          if (data.length === 0)
            return
          data.unshift({
            n: '========',
            p: '========'
          })
          data.unshift({
            n: 'Exchange',
            p: args[1] + '/' + args[0]
          })
          const tabLength = 5
          const keyLength = data.reduce(
            (length, key) => {
              if (key.p.length > length)
                return key.p.length
              return length
            }, 0
          )
          let lineLength = 0
          const message = '```' + data.map(
            key => {
              const line = key.n
                .concat(Array(keyLength + tabLength - key.n.length).fill(' ').join(''))
                .concat(key.p)
              lineLength = Math.max(lineLength, line.length)
              return line
            }
          ).join('\n') + '```'

          bot.sendMessage({
            to: channelID,
            message
          })
        } catch (e) {
          console.log(e)
        }
        break
// Just add any case commands if you want to..
    }
  }
})