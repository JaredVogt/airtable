// TODO stub out input.config to grab

// --------------- everything below here, copy into airtable
let config = input.config()

// Setup config for Make
let method = 'POST'
let headers = {'Content-Type': 'application/json; charset=utf-8'}

// Setup app specific data
let hook = "https\://hook.us1.make.com/yecsm5yk9jvkv141tx93jyappkjeyr1c"
let table = 'grid'
let smsNumber = '+12065580284'
let destinationNumber = '+12066615101'

// Create the message
let message = `WG: ${config.user}/${config.vendor}/${config.description}/${config.amount}`

// Create Airtable object
let data = {
  table,
  smsNumber,
  destinationNumber,
  message
}

let body = JSON.stringify(data)  // encode object

// Make that call!
const response = await fetch(hook, {
  method,
  headers,
  body
})



