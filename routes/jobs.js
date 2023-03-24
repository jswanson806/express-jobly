"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAuthorized } = require("../middleware/auth");
const Job = require("../models/job");

const JobNewSchema = require("../schemas/jobNew.json");
// const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * company should be { title, salary, equity, company_handle }
 *
 * Returns { title, salary, equity, company_handle }
 *
 * Authorization required: login, admin
 */
// ensureLoggedIn, ensureAuthorized,
router.post("/", ensureAuthorized, ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, JobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { jobs: [ { title, salary, equity, company_handle }, ...] }
 *
 * Can filter on provided search filters:
 * - minSalary
 * - hasEquity
 * - title (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const queryParams = req.query;
    const jobs = await Job.findAll(queryParams);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

// /** GET /[handle]  =>  { company }
//  *
//  *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
//  *   where jobs is [{ id, title, salary, equity }, ...]
//  *
//  * Authorization required: none
//  */

// router.get("/:handle", async function (req, res, next) {
//   try {
//     const company = await Company.get(req.params.handle);
//     return res.json({ company });
//   } catch (err) {
//     return next(err);
//   }
// });

// /** PATCH /[handle] { fld1, fld2, ... } => { company }
//  *
//  * Patches company data.
//  *
//  * fields can be: { name, description, numEmployees, logo_url }
//  *
//  * Returns { handle, name, description, numEmployees, logo_url }
//  *
//  * Authorization required: login, admin
//  */

// router.patch("/:handle", ensureLoggedIn, ensureAuthorized, async function (req, res, next) {
//   try {
//     const validator = jsonschema.validate(req.body, companyUpdateSchema);
//     if (!validator.valid) {
//       const errs = validator.errors.map(e => e.stack);
//       throw new BadRequestError(errs);
//     }

//     const company = await Company.update(req.params.handle, req.body);
//     return res.json({ company });
//   } catch (err) {
//     return next(err);
//   }
// });

// /** DELETE /[handle]  =>  { deleted: handle }
//  *
//  * Authorization: login, admin
//  */

// router.delete("/:handle", ensureLoggedIn, ensureAuthorized, async function (req, res, next) {
//   try {
//     await Company.remove(req.params.handle);
//     return res.json({ deleted: req.params.handle });
//   } catch (err) {
//     return next(err);
//   }
// });


module.exports = router;
