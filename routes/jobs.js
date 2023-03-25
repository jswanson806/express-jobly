"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAuthorized } = require("../middleware/auth");
const Job = require("../models/job");

const JobNewSchema = require("../schemas/jobNew.json");
const JobUpdateSchema = require("../schemas/jobUpdate.json");

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

// /** GET /[id]  =>  { job }
//  *
//  *  Job is { title, salary, equity, company_handle }
//  *   where jobs is [{ id, title, salary, equity }, ...]
//  *
//  * Authorization required: none
//  */

router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

// /** PATCH /[handle] { fld1, fld2, ... } => { job }
//  *
//  * Patches job data.
//  *
//  * fields can be: { title, salary, equity, company_handle }
//  *
//  * Returns { title, salary, equity, company_handle }
//  *
//  * Authorization required: login, admin
//  */
// ensureLoggedIn, ensureAuthorized, 
router.patch("/:id", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, JobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

// /** DELETE /[handle]  =>  { deleted: handle }
//  *
//  * Authorization: login, admin
//  */
// ensureLoggedIn, ensureAuthorized,
router.delete("/:id",  async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
