/**
This is an example of code to use in an Airtable Automation to send data to a Make Webhook.
* Only copy the code below the line into Airtable
* The code at the top allows for testing that this file is working as expected
* `input` has to be set up to mimic the properties that Airtable will pass when input.config() is called
* Match this up with what is in Airtable config
* `node <filename>` will show you what is being sent to airtable.
**/
let baseUrl = 'https://github.com/JaredVogt/airtable/blob/main/' 
let fileUrl = 'exampleMakeSMS.mjs'
let fullUrl = `${baseUrl}${fileUrl}`

// Function to test that code below is spitting out what is expected
async function fetch(hook, therest) {
  console.log(`Github location: ${fullUrl})`
  console.log(hook)
  console.log(therest)
}

// Create input.config for testing - NOTE: THIS IS SPECIFIC TO EACH USECASE
let input = {
  config: () => ({
    user: 'user',
    vendor: 'vendor',
    description: 'description',
    amount: 'amount'
  })
}

// --------------- everything below here, copy into airtable ----------------------------
// Github Source: https://github.com/JaredVogt/airtable/blob/main/exampleMakeSMS.mjs
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



