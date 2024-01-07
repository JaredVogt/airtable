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
    createdByForm: 'Rainy'
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

// ---- Script specific input/output and data

// Script specific data
const smsNumber = '+15075937399'  // FIXME this should be looked up from a table
const destinationNumber = '+12066615101'

// Assign variables from input.config()
const {house, contact, amount, method, paymentAccount, action, methodDetails, methodOverride, ID, baseURL, dueDate, business, category, createdByForm} = input.config()

// create input.config object for downstream Actions (all variables must be set or Actions will fail) 
output.set('execute', '')  // Stop and output false
output.set('smsNumber', smsNumber)
output.set('destinationNumber', destinationNumber)
output.set('message', '')

// ---- Script specific functions

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

// Return only if the date values are the same. The point here is to add Urgent to the message
const isDueTodayAndRainy = (dueDate) => {
  return createdByForm === 'Rainy' && dueDate === formatDate(new Date())
}

// Construct the SMS message that will be passed along to Airtable SMS automation
function createMessage() {
  const inDataEntries = [
    {condition: isDueTodayAndRainy(dueDate), value: 'URGENT*******'},
    {condition: contact, value: contact},
    {condition: amount, value: `${amount} / ${method} / ${paymentAccount}`},
    {condition: action, value: `Action: ${action}`},
    {condition: methodDetails, value: `Details: ${methodDetails}`},
    {condition: methodOverride, value: `Method: ${methodOverride}`},
    {condition: ID, value: baseURL},
    {condition: true, value: '-----'},
    {condition: house, value: `House: ${house}`},
    {condition: business, value: `Business: ${business}`},
    {condition: category, value: `Category: ${category}`}
  ]

  // Add it all together
  let message = inDataEntries
    .filter(entry => entry.condition)
    .map(entry => entry.value)
    .join('\n')

  // Finish creating output object
  output.set('message', message)
}

// ---- MAIN 

// Used by conditional logic in next step in Airtable automation to abort automation 
if (action === "Paid" || action === "Autopaid") {
  output.set('execute', "false")  // if "false", conditional logic aborts
} else {
  createMessage()
}
