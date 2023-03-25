"use strict";

process.env.NODE_ENV = "test";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
    const newJob = {
        title: "new",
        salary: 99999,
        equity: 0.05,
        company_handle: "c1",
      };

  test("ok for admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
      title: "new",
      salary: 99999,
      equity: "0.05",
      company_handle: "c1"
    },
    });
  });

  test("unauth for user", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "new",
          salary: 10000,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: 1,
          salary: 88888,
          equity: 0.5,
          company_handle: "c1"
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
            {
              title: "j1",
              salary: 50000,
              equity:"0",
              company_handle: "c1",
            },
            {
              title: "j2",
              salary: 75000,
              equity: "0.5",
              company_handle: "c2",
            },
            {
              title: "j3",
              salary: 97000,
              equity: "0.8",
              company_handle: "c3",
            },
          ],
    });
  });

  test("works with minSalary query param", async function () {
    const resp = await request(app).get("/jobs").query({ minSalary: 97000 });
    expect(resp.body).toEqual({
      jobs:
          [
            {
              title: "j3",
              salary: 97000,
              equity: "0.8",
              company_handle: "c3",
            }
          ],
    });
  });

  test("works with hasEquity query param", async function () {
    const resp = await request(app).get("/jobs").query({ hasEquity: true });
    expect(resp.body).toEqual({
      jobs:
          [
            {
              title: "j2",
              salary: 75000,
              equity: "0.5",
              company_handle: "c2",
            },
            {
              title: "j3",
              salary: 97000,
              equity: "0.8",
              company_handle: "c3",
            }
          ],
    });
  });

//   test("works with queryParams for name", async function () {
//     const resp = await request(app).get("/companies").query({ name: "1" });
//     expect(resp.body).toEqual({
//       companies:
//           [
//             {
//               handle: "c1",
//               name: "C1",
//               description: "Desc1",
//               numEmployees: 1,
//               logoUrl: "http://c1.img",
//             }
//           ],
//     });
//   });

//   test("fails: test BadRequestError", async function () {
//     const resp = await request(app).get("/companies").query({ minEmployees: 2, maxEmployees: 1 });
//     expect(resp.statusCode).toEqual(400);
//   });

//   test("fails: test next() handler", async function () {
//     // there's no normal failure event which will cause this route to fail ---
//     // thus making it hard to test that the error-handler works with it. This
//     // should cause an error, all right :)
//     await db.query("DROP TABLE companies CASCADE");
//     const resp = await request(app)
//         .get("/companies")
//         .set("authorization", `Bearer ${u2Token}`);
//     expect(resp.statusCode).toEqual(500);
//   });
// });

// /************************************** GET /companies/:handle */

// describe("GET /companies/:handle", function () {
//   test("works for anon", async function () {
//     const resp = await request(app).get(`/companies/c1`);
//     expect(resp.body).toEqual({
//       company: {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//     });
//   });

//   test("works for anon: company w/o jobs", async function () {
//     const resp = await request(app).get(`/companies/c2`);
//     expect(resp.body).toEqual({
//       company: {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       },
//     });
//   });

//   test("not found for no such company", async function () {
//     const resp = await request(app).get(`/companies/nope`);
//     expect(resp.statusCode).toEqual(404);
//   });
// });

// /************************************** PATCH /companies/:handle */

// describe("PATCH /companies/:handle", function () {
//   test("works for admin", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           name: "C1-new",
//         })
//         .set("authorization", `Bearer ${u2Token}`);
//     expect(resp.body).toEqual({
//       company: {
//         handle: "c1",
//         name: "C1-new",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//     });
//   });

//   test("unauth for user", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           name: "C1-new",
//         })
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           name: "C1-new",
//         });
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found on no such company", async function () {
//     const resp = await request(app)
//         .patch(`/companies/nope`)
//         .send({
//           name: "new nope",
//         })
//         .set("authorization", `Bearer ${u2Token}`);
//     expect(resp.statusCode).toEqual(404);
//   });

//   test("bad request on handle change attempt", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           handle: "c1-new",
//         })
//         .set("authorization", `Bearer ${u2Token}`);
//     expect(resp.statusCode).toEqual(400);
//   });

//   test("bad request on invalid data", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           logoUrl: "not-a-url",
//         })
//         .set("authorization", `Bearer ${u2Token}`);
//     expect(resp.statusCode).toEqual(400);
//   });
// });

// /************************************** DELETE /companies/:handle */

// describe("DELETE /companies/:handle", function () {
//   test("works for admin", async function () {
//     const resp = await request(app)
//         .delete(`/companies/c1`)
//         .set("authorization", `Bearer ${u2Token}`);
//     expect(resp.body).toEqual({ deleted: "c1" });
//   });

//   test("unauth for user", async function () {
//     const resp = await request(app)
//         .delete(`/companies/c1`)
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app)
//         .delete(`/companies/c1`);
//     expect(resp.statusCode).toEqual(401);
//   });


//   test("not found for no such company", async function () {
//     const resp = await request(app)
//         .delete(`/companies/nope`)
//         .set("authorization", `Bearer ${u2Token}`);
//     expect(resp.statusCode).toEqual(404);
//   });
});
