const { sqlForPartialUpdate } = require("./sql")
const { BadRequestError } = require("../expressError")

describe("Testing sql helper function", () => {
    test("Should return {setCols: values from jsToSql, values: [values from dataToUpdate]:}", () => {
        const dataToUpdate = {nums: 1, person: "Tony"};
        const jsToSql = {nums: "nums", person: "person"}

        const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
        expect(result).toEqual({setCols: '"nums"=$1, "person"=$2', values: [1, "Tony"]})
    });

    test("Should throw error if no data provided", () => {
        const dataToUpdate = {};
        const jsToSql = {nums: "nums", person: "person"}

        const f = () => {
            sqlForPartialUpdate(dataToUpdate, jsToSql)
        };

        expect(f).toThrow(BadRequestError);
    });

});