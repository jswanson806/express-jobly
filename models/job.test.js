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
    equity: 0.05,
    company_handle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      title: "new",
      salary: 99999,
      equity: "0.05",
      company_handle: "c1",
    });

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

  test("works: title filter", async function () {
    const filter = {title: "j1"}
    let jobs = await Job.findAll(filter);
    expect(jobs).toEqual([
      {
        title: "j1",
        salary: 50000,
        equity: "0",
        company_handle: "c1",
      },
    ]);
  });

  test("works: minSalary filter", async function () {
    const filter = {minSalary: 97000}
    let jobs = await Job.findAll(filter);
    expect(jobs).toEqual([
      {
        title: "j3",
        salary: 97000,
        equity: "0.8",
        company_handle: "c3",
      },
    ]);
  });

  test("works: hasEquity filter", async function () {
    const filter = {hasEquity: 'true'}
    let jobs = await Job.findAll(filter);
    expect(jobs).toEqual([
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
      }
    ]);
  });

  test("works: minSalary & hasEquity filter", async function () {
    const filter = {minSalary: 75000, hasEquity: 'false'}
    let jobs = await Job.findAll(filter);
    expect(jobs).toEqual([
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
      },
    ]);
  });

  test("works: hasEquity filter = false returns all companies", async function () {
    const filter = {hasEquity: 'false'}
    const jobs = await Job.findAll(filter);
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
      }
    ]);
  });


// /************************************** get */

describe("get", function () {
  test("works", async function () {
    
    const jobs = await db.query(`SELECT * FROM jobs`);
    
    let job = await Job.get(jobs.rows[0].id);
    expect(job).toEqual({
      title: "j1",
      salary: 50000,
      equity: "0",
      company_handle: "c1"
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// /************************************** update */

describe("update", function () {
  const updateData = {
    title: "j4",
    salary: 50000,
    equity: 0,
    company_handle: "c1"
  };

  test("works", async function () {
    const jobs = await db.query(`SELECT * FROM jobs`)
    
    const targetJob = jobs.rows[0];
    let job = await Job.update(targetJob.id, updateData);
    expect(job).toEqual({
      title: "j4",
      salary: 50000,
      equity: "0",
      company_handle: "c1"
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE id = ${targetJob.id}`);
    expect(result.rows).toEqual([{
      title: "j4",
      salary: 50000,
      equity: "0",
      company_handle: "c1",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New",
      salary: null,
      equity: null,
      company_handle: "c1",
    };
    const newResult = await db.query(
      `SELECT id, title, salary, equity, company_handle
       FROM jobs
       WHERE title = 'j1'`);
    const targetJob = newResult.rows[0];
    let job = await Job.update(targetJob.id, updateDataSetNulls);
    expect(job).toEqual({
      title: "New",
      ...updateDataSetNulls,
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'New'`);
    expect(result.rows).toEqual([{
      title: "New",
      salary: null,
      equity: null,
      company_handle: "c1",
    }]);
  });

  test("not found if no such company", async function () {
    try {
      await Job.update(9999999, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      const result = await db.query(
        `SELECT title, salary, equity, company_handle
         FROM jobs
         WHERE title = 'j1'`);
      const targetJob = result.rows[0];
      await Job.update(targetJob.id, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** remove */

describe("remove", function () {
  test("works", async function () {
    const jobs = await db.query(`SELECT * FROM jobs`);
    const jobToRemove = jobs.rows[0];
    await Job.remove(jobToRemove.id);
    const res = await db.query(
        `SELECT title FROM jobs WHERE id = ${jobToRemove.id}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(99999999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
