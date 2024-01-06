const P = console.log
const {recordID} = input.config(). // get the recordID 

// Define Table and fields
let tableName = 'Payments';
let fields = ['Amount', 'Description']; // Replace with the fields you want to retrieve


// Get specific field values from a table/recordID
async function getFields(tableName, recordID, fields) {
    try {
        let table = base.getTable(tableName)
        let record = await table.selectRecordAsync(recordId)

        if (record) {
            let fieldValues = {};
            for (let fieldName of fields) {
                fieldValues[fieldName] = record.getCellValue(fieldName)
            }
            return fieldValues
        } else {
            throw new Error(`Record not found: ${recordID} `);
        }
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

// Call the function
let values = await getFields(tableName, recordID, fields);
console.log(values)
