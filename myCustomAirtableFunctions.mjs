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
  const data = {...input.config()}  // use spread operator to insert input.config() properties (recordID, baseURL)
  
  try {
    const record = await base
      .getTable(tableName)
      .selectRecordAsync(data.recordID)

    if (record) {
      for (const [column, local] of fields) {
        let value = record.getCellValue(column)
        // NOTE: if something goes wrong, look here!!!!
        // This "flattens" the data. Some values are arrays/objects and the key data needs to be extracted
        // Arrays are checked first, then objects and then everything else just passes through
        // Objects require a check for null since it evaluates as an object ?!?!
        // P(value)  // uncomment to see actual cell value
         data[local] = 
            Array.isArray(value)  // check if array first
            ? (value[0].name || value[0])  // if it is, return based on the two valid forms
            : (value?.name || value)  // otherwise, check if object with .name prob, or just return value
      }
    return data  // here ya go
    } else {
      throw new Error(`Record not found: ${data.recordID}`)
    }
  } catch (error) {
    console.error('Error:', error.message)
    return null
  }
}

// Get record data
const data = await getFields(tableName, fields)

