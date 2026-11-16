import { Router } from "express";
import { ObjectId } from "mongodb";
import { sendSuccess } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { servicesCollection } from "../../config/db.js";
import { BRANCHES } from "../../constants/branches.js";

// Mounted at /services

const serviceRouter = Router();

// POST /services
// Adds a new service with validated fields
serviceRouter.post("/", async (req, res) => {
  const body = req.body;

  if (!body || typeof body !== "object") {
    throw new ApiError(400, "Request body is required");
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const branch = typeof body.branch === "string" ? body.branch.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const image = typeof body.image === "string" ? body.image.trim() : "";
  const price = Number(body.price);
  const duration = Number(body.duration);
  const keyFeatures = Array.isArray(body.keyFeatures)
    ? body.keyFeatures.map((f) => String(f).trim()).filter(Boolean)
    : [];
  const slot = typeof body.slot === "string" && body.slot.trim() ? body.slot.trim() : null;
  const createdBy = typeof body.createdBy === "string" && body.createdBy.trim() ? body.createdBy.trim() : "";

  if (!name) {
    throw new ApiError(400, "Service name is required");
  }

  if (!BRANCHES.includes(branch)) {
    throw new ApiError(400, `Branch must be one of: ${BRANCHES.join(", ")}`);
  }

  if (!description) {
    throw new ApiError(400, "Service description is required");
  }

  if (!image || (!image.startsWith("http://") && !image.startsWith("https://"))) {
    throw new ApiError(400, "A valid image URL is required");
  }

  if (Number.isNaN(price) || price < 0) {
    throw new ApiError(400, "Price must be a number greater than or equal to 0");
  }

  if (!Number.isInteger(duration) || duration <= 0) {
    throw new ApiError(400, "Duration must be a positive integer in minutes");
  }

  if (keyFeatures.length === 0) {
    throw new ApiError(400, "At least one key feature is required");
  }

  if (!createdBy) {
    throw new ApiError(400, "Creator information (createdBy) is required");
  }

  const newService = {
    name,
    branch,
    description,
    image,
    price,
    duration,
    keyFeatures,
    slot,
    createdBy,
    creatorEmail: typeof body.creatorEmail === "string" ? body.creatorEmail.trim() : undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await servicesCollection.insertOne(newService);
  return sendSuccess(res, { insertedId: result.insertedId }, "Service added successfully", 201);
});

// GET /services
// Returns services, optionally filtered by branch, createdBy, or name
serviceRouter.get("/", async (req, res) => {
  const queries = req.query;
  const find = {};

  if (typeof queries.createdBy === "string" && queries.createdBy.trim()) {
    find.createdBy = queries.createdBy.trim();
  }
  if (typeof queries.branch === "string" && queries.branch.trim()) {
    find.branch = queries.branch.trim();
  }
  if (typeof queries.name === "string" && queries.name.trim()) {
    find.name = { $regex: queries.name.trim(), $options: "i" };
  }

  const services = await servicesCollection.find(find).toArray();
  return sendSuccess(res, services, "Services fetched successfully");
});

// GET /services/:id
// Returns one service by id
serviceRouter.get("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, "Service not found");
  }

  const service = await servicesCollection.findOne({
    _id: new ObjectId(req.params.id),
  });

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  return sendSuccess(res, service, "Service fetched successfully");
});

export default serviceRouter;
