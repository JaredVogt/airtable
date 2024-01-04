/**
Script that is called by "New Record" trigger in Grid base. It formats a message and uses output.set to pass along an object for use in the Twilio action.
**/

// Housekeeping for github
const baseUrl = 'https://github.com/JaredVogt/airtable/blob/main/' 
const fileUrl = 'grid-formatMessageSMS.mjs'
const fullUrl = `${baseUrl}${fileUrl}`

//  --------------- Testing ------------------------------------------------------------
// Create input.config for testing - NOTE: THIS IS SPECIFIC TO EACH USECASE
const input = {
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
const output = {
  set: (key, value) =>
    console.log(`Output: ${key}, ${value}`)
}

// --------------- COPY EVERYTHING BELOW LINE INTO AIRTABLE SCRIPT --------------------
// Github Source: https://github.com/JaredVogt/airtable/blob/main/grid-formatMessageSMS.mjs
const P = console.log

// Format date to match Airtable (adjusted to PST)
function formatDate(dateString) {
    const date = new Date(dateString)
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
    const pstOffset = 8 * 60 * 60000 // PST is UTC-8
    const pstDate = new Date(utcDate.getTime() - pstOffset)
    const year = pstDate.getFullYear()
    const month = (pstDate.getMonth() + 1).toString().padStart(2, '0')
    const day = pstDate.getDate().toString().padStart(2, '0')
    const newDate = `${year}-${month}-${day}`
    return newDate
}

const inData = input.config()  // test format in input above - MUST MATCH Airtable

// Setup app specific data
const smsNumber = '+15075937399'  // FIXME this should be looked up from a table
const destinationNumber = '+12066615101'

// Used by conditional logic in next step in Airtable automation to abort automation
if (inData.action === "Paid") {
  output.set('execute', 'false')
}

// return only if the values are the same. The point here is to add Urgent to the message
const isDueToday = (dueDate) => {
  return dueDate === formatDate(new Date())
}

// Construct the SMS message  
const inDataEntries = [
  {condition: isDueToday(inData.dueDate), value: 'URGENT*******'},
  {condition: inData.contact, value: inData.contact},
  {condition: inData.amount, value: `${inData.amount} / ${inData.method} / ${inData.paymentAccount}`},
  {condition: inData.action, value: `Action: ${inData.action}`},
  {condition: inData.methodDetails, value: `Details: ${inData.methodDetails}`},
  {condition: inData.methodOverride, value: `Method: ${inData.methodOverride}`},
  {condition: inData.ID, value: inData.baseURL},
  {condition: true, value: '-----'},
  {condition: inData.house, value: `House: ${inData.house}`},
  {condition: inData.business, value: `Business: ${inData.business}`},
  {condition: inData.category, value: `Category: ${inData.category}`}
]

let message = inDataEntries
  .filter(entry => entry.condition)
  .map(entry => entry.value)
  .join('\n')

// Finish creating output object
output.set('smsNumber', smsNumber)
output.set('destinationNumber', destinationNumber)
output.set('message', message)

// Twilio action will use output to send message
