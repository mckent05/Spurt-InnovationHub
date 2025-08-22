const {
  BadRequestError,
  NotfoundError,
  InternalServerError,
  UnAuthenticatedError,
} = require("../Error");
const { Hub, HubAvailability } = require("../model/hub");
const { StatusCodes } = require("http-status-codes");
const User = require("../model/user");

const getHubs = async (req, res) => {
  try {
    const { city, q } = req.query;
    const filter = {};
    if (city) filter.location = city;
    if (q)
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    const hubs = await Hub.find(filter).limit(100).sort({ name: 1 });
    res.status(StatusCodes.OK).json(hubs);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

const getHub = async (req, res) => {
  const {
    params: { id: id },
  } = req;
  try {
    const hub = await Hub.findById(id);
    if (!hub) {
      const error = new NotfoundError(`User with ${id} not found`);
      return res.status(error.statusCode).json({ error: error.message });
    }
    const avail = await HubAvailability.find({
      hub: hub._id,
      startsAt: { $gte: new Date() },
    })
      .sort({ startsAt: 1 })
      .limit(100);
    res.status(StatusCodes.OK).json({ hub, availability: avail });
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

const createHub = async (req, res) => {
  try {
    const hub = await Hub.create({ ...req.body, manager: req.user.userId });
    res.status(StatusCodes.CREATED).json(hub);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

const hubAvailability = async (req, res) => {
  try {
    const { startsAt, endsAt, capacity } = req.body;
    const hub = Hub.findById(req.params.id);
    if (req.user.userId !== hub.managerId) {
      return res.status(StatusCodes.FORBIDDEN).json({ error: "Access Denied" });
    }
    const avail = await HubAvailability.create({
      hub: req.params.id,
      startsAt,
      endsAt,
      capacity,
    });
    res.status(StatusCodes.CREATED).json(avail);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

module.exports = {
  getHubs,
  getHub,
  hubAvailability,
  createHub,
};
