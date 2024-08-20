import mongoose from "mongoose";

export const getSalesOverTime = async (req, res) => {
  try {
    const { interval = "daily" } = req.query;
    const groupBy = {
      daily: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      monthly: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
      quarterly: { $dateToString: { format: "%Y-Q%q", date: "$createdAt" } },
      yearly: { $dateToString: { format: "%Y", date: "$createdAt" } },
    };

    const sales = await mongoose.connection.db
      .collection("shopifyOrders")
      .aggregate([
        {
          $addFields: {
            createdAt: { $toDate: "$created_at" },
          },
        },
        {
          $group: {
            _id: groupBy[interval],
            totalSales: {
              $sum: { $toDouble: "$total_price_set.shop_money.amount" },
            },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSalesGrowthRate = async (req, res) => {
  try {
    const sales = await mongoose.connection.db
      .collection("shopifyOrders")
      .aggregate([
        {
          $addFields: {
            createdAt: { $toDate: "$created_at" },
            totalSales: { $toDouble: "$total_price_set.shop_money.amount" },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            totalSalesSum: { $sum: "$totalSales" },
          },
        },
        { $sort: { _id: 1 } },
        {
          $setWindowFields: {
            sortBy: { _id: 1 },
            output: {
              previousSales: {
                $shift: {
                  output: "$totalSalesSum",
                  by: -1,
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            totalSalesSum: 1,
            previousSales: 1,
            growthRate: {
              $cond: {
                if: { $eq: ["$previousSales", null] },
                then: 0,
                else: {
                  $divide: [
                    { $subtract: ["$totalSalesSum", "$previousSales"] },
                    "$previousSales",
                  ],
                },
              },
            },
          },
        },
      ])
      .toArray();

    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRepeatCustomers = async (req, res) => {
  try {
    const { interval = "daily" } = req.query;
    const groupBy = {
      daily: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      monthly: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
      quarterly: { $dateToString: { format: "%Y-Q%q", date: "$createdAt" } },
      yearly: { $dateToString: { format: "%Y", date: "$createdAt" } },
    };

    const repeatCustomers = await mongoose.connection.db
      .collection("shopifyOrders")
      .aggregate([
        {
          $addFields: {
            createdAt: { $toDate: "$created_at" },
          },
        },
        {
          $group: {
            _id: "$customer_id",
            orderCount: { $sum: 1 },
          },
        },
        {
          $match: { orderCount: { $gt: 1 } },
        },
        {
          $group: {
            _id: groupBy[interval],
            repeatCustomers: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    res.json(repeatCustomers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCustomerLifetimeValue = async (req, res) => {
  try {
    const cohorts = await mongoose.connection.db
      .collection("shopifyOrders")
      .aggregate([
        {
          $addFields: {
            createdAt: { $toDate: "$created_at" },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            totalSpent: {
              $sum: { $toDouble: "$total_price_set.shop_money.amount" },
            },
            customerCount: { $sum: 1 },
          },
        },
        {
          $project: {
            cohort: "$_id",
            avgLifetimeValue: { $divide: ["$totalSpent", "$customerCount"] },
          },
        },
        { $sort: { cohort: 1 } },
      ])
      .toArray();

    res.json(cohorts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
