/**
Script that is called by "New Record" trigger in Grid base. It formats a message and uses output.set to pass along an object for use in the Twilio action.
**/

// Housekeeping for github
let baseUrl = 'https://github.com/JaredVogt/airtable/blob/main/' 
let fileUrl = 'grid-formatMessageSMS.mjs'
let fullUrl = `${baseUrl}${fileUrl}`

//  --------------- Testing ------------------------------------------------------------
// Create input.config for testing - NOTE: THIS IS SPECIFIC TO EACH USECASE
let input = {
  config: () => ({
    description: "Monthly pool Dec ",
    ID: "recRb3gud3e4zffok",
    baseURL: "https://airtable.com/app8h9cEDY8k6sxSY/tblcF3PpkZxiL6OiP/recRb3gud3e4zffok",
    dueDate: "2024-01-02",
    contact: "Ramirez Pool Service",
    method: "Zelle",
    methodDetails: ["ramirezpoolservice@gmail.com"],
    paymentAccount: "BofA 7311",
    amount: 235,
    methodOverride: null,
    house: "1617",
    business: null,
    category: "Home Maintenance",
    action: "Paid",
    user: 'user',
  })
}

// Echo output.set() for testing
let output = {
  set: (key, value) =>
    console.log(`Output: ${key}, ${value}`)
}

// --------------- COPY EVERYTHING BELOW LINE INTO AIRTABLE SCRIPT --------------------
// Github Source: https://github.com/JaredVogt/airtable/blob/main/grid-formatMessageSMS.mjs
let P = console.log

// Format date to match Airtable (adjusted to PST)
function formatDate(dateString) {
    const date = new Date(dateString);
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    const pstOffset = 8 * 60 * 60000; // PST is UTC-8
    const pstDate = new Date(utcDate.getTime() - pstOffset);
    let year = pstDate.getFullYear();
    let month = (pstDate.getMonth() + 1).toString().padStart(2, '0');
    let day = pstDate.getDate().toString().padStart(2, '0');
    let newDate = `${year}-${month}-${day}`;
    return newDate
}

let config = input.config()  // see format in input above - MUST MATCH Airtable

// Setup app specific data
let smsNumber = '+15075937399'  // FIXME this should be looked up from a table
let destinationNumber = '+12066615101'

// Used by conditional logic in next step in Airtable automation to abort automation
if () {
  output.set('execute', 'false')
}

// Construct the SMS message  
// FIXME ChatGPT - https://chat.openai.com/c/d0c668f9-af84-409c-82d0-bab72282417a
let message = ''
if (config.dueDate === formatDate(Date())) {
  message += `URGENT*******\n`
}  
if (config.contact) {message += `${config.contact}\n`}
if (config.amount) {message += `${config.amount} / ${config.method} / ${config.paymentAccount}\n`}
if (config.action) {message += `Action: ${config.action}\n`}
if (config.methodDetails) {message += `Details: ${config.methodDetails}\n`}
if (config.methodOverride) {message += `Method: ${config.methodOverride}\n`}
if (config.ID) {message += `${config.baseURL}\n`}
message += '-----\n'
if (config.house) {message += `House: ${config.house}\n`}
if (config.business) {message += `Business: ${config.business}\n`}
if (config.category) {message += `Category: ${config.category}\n`}

// Finish creating output object
output.set('smsNumber', smsNumber)
output.set('destinationNumber', destinationNumber)
output.set('message', message)

// Twilio action will use output to send message
