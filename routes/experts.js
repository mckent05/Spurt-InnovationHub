const express = require("express");
const {
  getExperts,
  createExpert,
  updateExpert,
} = require("../controllers/experts");
const { roleCheck } = require("../middleWare/authenticationHandler");

const routes = express.Router();

routes
  .route("/")
  .get(getExperts)
  .post(roleCheck(["expert", "admin"]), createExpert);

routes.route("/update-expert").patch(roleCheck(["expert"]), updateExpert);
// routes.route("/by-client/:clientId").get(projectByClient);
// routes.route("/:id").get(getProject).delete(deleteProject).put(updateProject);

module.exports = routes;
