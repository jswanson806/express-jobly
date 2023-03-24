"use strict";

process.env.NODE_ENV = "test";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 99999,
    equity: "0.05",
    company_handle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE salary = 99999`);
    expect(result.rows).toEqual([
      {
        title: "new",
        salary: 99999,
        equity: "0.05",
        company_handle: "c1",
      },
    ]);
  });
});


/************************************** findAll */


// THIS ISNT WORKING ########################################################################################################
describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: "j1",
        salary: 50000,
        equity: "0",
        company_handle: "c1"
      },
      {
        title: "j2",
        salary: 75000,
        equity: "0.5",
        company_handle: "c2"
      },
      {
        title: "j3",
        salary: 97000,
        equity: "0.8",
        company_handle: "c3",
      }]);
  });
});

  // test("works: title filter", async function () {
  //   const filter = {name: 'j1'}
  //   let jobs = await Job.findAll(filter);
  //   expect(jobs).toEqual([
  //     {
  //       title: "j1",
  //       salary: 50000,
  //       equity: "0",
  //       company_handle: "c1",
  //     },
  //   ]);
  // });

  // test("works: minSalary filter", async function () {
  //   const filter = {minSalary: 97000}
  //   let jobs = await Job.findAll(filter);
  //   expect(jobs).toEqual([
  //     {
  //       title: "j3",
  //       salary: 97000,
  //       equity: "0.8",
  //       company_handle: "c3",
  //     },
  //   ]);
  // });

  // test("works: hasEquity filter", async function () {
  //   const filter = {hasEquity: true}
  //   let jobs = await Job.findAll(filter);
  //   expect(jobs).toEqual([
  //     {
  //       title: "j2",
  //       salary: 75000,
  //       equity: "0.5",
  //       company_handle: "c2"
  //     },
  //     {
  //       title: "j3",
  //       salary: 97000,
  //       equity: "0.8",
  //       company_handle: "c3",
  //     }
  //   ]);
  // });

  // test("works: minSalary & hasEquity filter", async function () {
  //   const filter = {minSalary: 75000, hasEquity: true}
  //   let jobs = await Job.findAll(filter);
  //   expect(jobs).toEqual([
  //     {
  //       title: "j2",
  //       salary: 75000,
  //       equity: "0.5",
  //       company_handle: "c2"
  //     },
  //     {
  //       title: "j3",
  //       salary: 97000,
  //       equity: "0.8",
  //       company_handle: "c3",
  //     }
  //   ]);
  // });

  // test("works: hasEquity filter = false returns all companies", async function () {
  //   const filter = {hasEquity: true}
  //   const jobs = await Job.findAll(filter);
  //   expect(jobs).toEqual([
  //     {
  //       title: "j1",
  //       salary: 50000,
  //       equity: "0",
  //       company_handle: "c1"
  //     },
  //     {
  //       title: "j2",
  //       salary: 75000,
  //       equity: "0.5",
  //       company_handle: "c2"
  //     },
  //     {
  //       title: "j3",
  //       salary: 97000,
  //       equity: "0.8",
  //       company_handle: "c3",
  //     }
  //   ]);
  // });
// });

// /************************************** get */

// describe("get", function () {
//   test("works", async function () {
//     let company = await Company.get("c1");
//     expect(company).toEqual({
//       handle: "c1",
//       name: "C1",
//       description: "Desc1",
//       numEmployees: 1,
//       logoUrl: "http://c1.img",
//     });
//   });

//   test("not found if no such company", async function () {
//     try {
//       await Company.get("nope");
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });

// /************************************** update */

// describe("update", function () {
//   const updateData = {
//     name: "New",
//     description: "New Description",
//     numEmployees: 10,
//     logoUrl: "http://new.img",
//   };

//   test("works", async function () {
//     let company = await Company.update("c1", updateData);
//     expect(company).toEqual({
//       handle: "c1",
//       ...updateData,
//     });

//     const result = await db.query(
//           `SELECT handle, name, description, num_employees, logo_url
//            FROM companies
//            WHERE handle = 'c1'`);
//     expect(result.rows).toEqual([{
//       handle: "c1",
//       name: "New",
//       description: "New Description",
//       num_employees: 10,
//       logo_url: "http://new.img",
//     }]);
//   });

//   test("works: null fields", async function () {
//     const updateDataSetNulls = {
//       name: "New",
//       description: "New Description",
//       numEmployees: null,
//       logoUrl: null,
//     };

//     let company = await Company.update("c1", updateDataSetNulls);
//     expect(company).toEqual({
//       handle: "c1",
//       ...updateDataSetNulls,
//     });

//     const result = await db.query(
//           `SELECT handle, name, description, num_employees, logo_url
//            FROM companies
//            WHERE handle = 'c1'`);
//     expect(result.rows).toEqual([{
//       handle: "c1",
//       name: "New",
//       description: "New Description",
//       num_employees: null,
//       logo_url: null,
//     }]);
//   });

//   test("not found if no such company", async function () {
//     try {
//       await Company.update("nope", updateData);
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });

//   test("bad request with no data", async function () {
//     try {
//       await Company.update("c1", {});
//       fail();
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });
// });

// /************************************** remove */

// describe("remove", function () {
//   test("works", async function () {
//     await Company.remove("c1");
//     const res = await db.query(
//         "SELECT handle FROM companies WHERE handle='c1'");
//     expect(res.rows.length).toEqual(0);
//   });

//   test("not found if no such company", async function () {
//     try {
//       await Company.remove("nope");
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });
