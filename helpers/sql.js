const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

/* Accepts two objects
  dataToUpdate = {numEmployees: 1, logUrl: "logo_url_1"}
  jsToSql = {numEmployees: 2, logoUrl: "logo_url_2"}

  Extracts keys from dataToUpdate -> ['numEmployees', 'logoUrl']
  Throws badRequestError if no data was provided for dataToUpdate

  Maps keys of jsToSql + =$ + idx -> 
  {numEmployees: 2, logoUrl: "logo_url_2"} -> ['"numEmployees"=$1', '"logoUrl"=$2'] ->
  Save array to variable 'cols'

  returns object -> 
  {
    setCols: values of cols joined with ", " -> "numEmployees=$1, logoUrl=$2",
    values: [numEmployees, logoUrl]
  }

 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
