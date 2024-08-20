import express from "express";
import {
  getNewCustomers,
  getGeographicalDistribution,
} from "../controllers/customer.js";
import {
  getSalesOverTime,
  getSalesGrowthRate,
  getRepeatCustomers,
  getCustomerLifetimeValue,
} from "../controllers/order.js";

const router = express.Router();

router.get("/sales-over-time", getSalesOverTime);
router.get("/sales-growth-rate", getSalesGrowthRate);
router.get("/new-customers", getNewCustomers);
router.get("/repeat-customers", getRepeatCustomers);
router.get("/geographical-distribution", getGeographicalDistribution);
router.get("/customer-lifetime-value", getCustomerLifetimeValue);

export default router;
