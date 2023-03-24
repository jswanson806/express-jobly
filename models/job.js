"use strict";

const db = require("../db")
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, compHandle }
   *
   * */

  static async create({ title, salary, equity, company_handle }) {

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle`,
        [
            title, 
            salary, 
            equity, 
            company_handle,
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   * 
   * Accepts optional query parameters {title, minSalary, hasEquity}
   * 
   * Filters results based on query parameters
   * 
   * Returns [{ title, salary, equity, company_handle }, ...]
   * 
   * */

// THIS WORKS BUT TEST FAILS ##############################################################################################

  static async findAll(queryParams) {
    const filters = queryParams;


    // query the db for all companies
    const jobsRes = await db.query(`SELECT title, salary, equity, company_handle FROM jobs`);
    console.log(jobsRes.rows);

    if(typeof filters !== "undefined"){

    // filter results based on queryParams
    const filteredJobs = jobsRes.rows.filter(job => {
      let isValid = true;
      for (const key in filters) {
        // key is "title"
        if(key === "title"){
          // filter out jobs whose name does not include substring from filters, case-insensitive
          isValid = isValid && job[key].toLowerCase().includes(filters[key].toLowerCase());
          // key is "minSalary"
        } else if(key === "minSalary") {
          // filter out jobs with less than "minSalary"
          isValid = isValid && job.salary >= filters[key];
          // key is "hasEquity"
        } else if(key === "hasEquity"){
          // filter out jobs without equity
          isValid = isValid && Number(job.equity) > 0;
        }
      }
      return isValid;
    });

    return filteredJobs;
  } else {

    return jobsRes;
  }

}
  

  // /** Given a job handle, return data about company.
  //  *
  //  * Returns { title, salary, equity, company_handle }
  //  *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
  //  *
  //  * Throws NotFoundError if not found.
  //  **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No company: ${id}`);

    return job;
  }

  // /** Update company data with `data`.
  //  *
  //  * This is a "partial update" --- it's fine if data doesn't contain all the
  //  * fields; this only changes provided ones.
  //  *
  //  * Data can include: {name, description, numEmployees, logoUrl}
  //  *
  //  * Returns {handle, name, description, numEmployees, logoUrl}
  //  *
  //  * Throws NotFoundError if not found.
  //  */

  // static async update(handle, data) {
  //   const { setCols, values } = sqlForPartialUpdate(
  //       data,
  //       {
  //         numEmployees: "num_employees",
  //         logoUrl: "logo_url",
  //       });
  //   const handleVarIdx = "$" + (values.length + 1);

  //   const querySql = `UPDATE companies 
  //                     SET ${setCols} 
  //                     WHERE handle = ${handleVarIdx} 
  //                     RETURNING handle, 
  //                               name, 
  //                               description, 
  //                               num_employees AS "numEmployees", 
  //                               logo_url AS "logoUrl"`;
  //   const result = await db.query(querySql, [...values, handle]);
  //   const company = result.rows[0];

  //   if (!company) throw new NotFoundError(`No company: ${handle}`);

  //   return company;
  // }

  // /** Delete given company from database; returns undefined.
  //  *
  //  * Throws NotFoundError if company not found.
  //  **/

  // static async remove(handle) {
  //   const result = await db.query(
  //         `DELETE
  //          FROM companies
  //          WHERE handle = $1
  //          RETURNING handle`,
  //       [handle]);
  //   const company = result.rows[0];

  //   if (!company) throw new NotFoundError(`No company: ${handle}`);
  // }
}


module.exports = Job;
