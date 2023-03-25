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
   * Returns { title, salary, equity, compHandle }
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


  static async findAll(queryParams) {
    const filters = queryParams;

    // query the db for all companies
    const jobsRes = await db.query(`SELECT title, salary, equity, company_handle FROM jobs`);


    if(typeof filters !== "undefined"){

    // filter results based on queryParams
    const filteredJobs = jobsRes.rows.filter(job => {
      let isValid = true;
      for (const key in filters) {
        // key is "title"
        if (key === "title"){
          // filter out jobs whose name does not include substring from filters, case-insensitive
          isValid = isValid && job[key].toLowerCase().includes(filters[key].toLowerCase());
          // key is "minSalary"
        } else if (key === "minSalary") {
          // filter out jobs with less than "minSalary"
          isValid = isValid && job.salary >= filters[key];
          // key is "hasEquity"
        } else if (key === "hasEquity" && filters[key] == 'true'){
              // filter out jobs without equity
              isValid = isValid && job.equity > 0;
        }
      }
      return isValid;
    });

    return filteredJobs;
  } else {

    return jobsRes.rows;
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
          `SELECT title,
                  salary,
                  equity,
                  company_handle
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);

    return job;
  }

  // /** Update job data with `data`.
  //  *
  //  * This is a "partial update" --- it's fine if data doesn't contain all the
  //  * fields; this only changes provided ones.
  //  *
  //  * Data can include: {title, salary, equity, company_handle}
  //  *
  //  * Returns {title, salary, equity, company_handle}
  //  *
  //  * Throws NotFoundError if not found.
  //  */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          title: "title",
          salary: 0,
          equity: 0,
        });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING title,
                                salary,
                                equity,
                                company_handle`;
    const result = await db.query(querySql, [...values, id]);

    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);

    return job;
  }

  // /** Delete given job from database; returns undefined.
  //  *
  //  * Throws NotFoundError if company not found.
  //  **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);
  }
}


module.exports = Job;
