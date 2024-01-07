// Github Source: https://github.com/JaredVogt/airtable/blob/main/grid-formatMessageSMS.mjs

/**
Script that is called by "New Record" trigger in Grid base. It formats a message and uses output.set to pass along an object for use in the Twilio action.
**/

const P = console.log

// ---- Get the data
// Table to access
const tableName = 'Payments'

// Fields to retrieve (column name, local name)
const fields = [
  ['Amount', 'amount'],
  ['Description', 'description'],
  ['Contacts', 'contact'],
  ['House', 'house'],
  ['Method', 'method'],
  ['Payment Account', 'paymentAccount'],
  ['Action', 'action'],
  ['Method Details', 'methodDetails'],
  ['Method Override', 'methodOverride'],
  ['Due Date', 'dueDate'],
  ['Business', 'business'],
  ['Category', 'category'],
  ['Created by Form', 'createdByForm']
]

// Get specific field values from table by recordID
async function getFields(tableName, fields) {
  // Initialize object to hold record data
  const iData = {...input.config()}  // use spread operator to insert input.config() properties (recordID, baseURL)
  
  try {
    const record = await base
      .getTable(tableName)
      .selectRecordAsync(iData.recordID)

    if (record) {
      for (const [column, local] of fields) {
        let value = record.getCellValue(column)
        // NOTE: if something goes wrong, look here!!!!
        // This "flattens" the iData. Some values are arrays/objects and the key data needs to be extracted
        // Arrays are checked first, then objects and then everything else just passes through
        // Objects require a check for null since it evaluates as an object ?!?!
        // P(value)  // uncomment to see actual cell value
         iData[local] = 
            Array.isArray(value)  // check if array first
            ? (value[0].name || value[0])  // if it is, return based on the two valid forms
            : (value?.name || value)  // otherwise, check if object with .name prob, or just return value
      }
    return iData  // here ya go
    } else {
      throw new Error(`Record not found: ${iData.recordID}`)
    }
  } catch (error) {
    console.error('Error:', error.message)
    return null
  }
}

// Get record data
const data = await getFields(tableName, fields)

// ---- Process data and prep for next step in automation

// SMS info 
const smsNumber = '+15075937399'  // FIXME this should be looked up from a table
const destinationNumber = '+12066615101'


// create input.config object for downstream Actions (all variables must be set or Actions will fail) 
output.set('execute', '')  // Stop and output false
output.set('smsNumber', smsNumber)
output.set('destinationNumber', destinationNumber)
output.set('message', '')


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

// Return only if the date values are the same (and it came from Rainy). Used to add Urgent to the message
const isDueTodayAndRainy = (dueDate) => {
  return data.createdByForm === 'Rainy' && dueDate === formatDate(new Date())
}

// Truncate long values
const truncateValue = (value) => {
  if (typeof value === 'string' && value.includes('\n')) {
    return 'check record'
  }
  return value
}

// Construct the SMS message that will be passed along to Airtable SMS automation
function createMessage() {
  const lines = [
    {test: isDueTodayAndRainy(data.dueDate), line: 'URGENT*******'},
    {test: data.contact, line: data.contact},
    {test: data.amount, line: `${data.amount} / ${data.method} / ${data.paymentAccount}`},
    {test: data.action, line: `Action: ${data.action}`},
    {test: data.methodDetails, line: `Details: ${truncateValue(data.methodDetails)}`},  // this can be long
    {test: data.methodOverride, line: `Method: ${data.methodOverride}`},
    {test: data.baseURL, line: data.baseURL},
    {test: true, line: '-----'},
    {test: data.house, line: `House: ${data.house}`},
    {test: data.business, line: `Business: ${data.business}`},
    {test: data.category, line: `Category: ${data.category}`}
  ]

  // Add it all together
  let message = lines
    .filter(entry => entry.test)
    .map(entry => entry.line)
    .join('\n')

  output.set('message', message)
}

// ---- MAIN 

// Used by conditional logic in next step in Airtable automation to abort automation 
if (data.action === "Paid" || data.action === "Autopaid") {
  output.set('execute', "false")  // if "false", conditional logic aborts
} else {
  createMessage()
}
