import mongoose from "mongoose";

export const getNewCustomers = async (req, res) => {
  try {
    const customers = await mongoose.connection.db
      .collection("shopifyCustomers")
      .aggregate([
        {
          $addFields: {
            createdAt: { $toDate: "$created_at" },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            newCustomers: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getGeographicalDistribution = async (req, res) => {
  try {
    const distribution = await mongoose.connection.db
      .collection("shopifyCustomers")
      .aggregate([
        {
          $group: {
            _id: "$default_address.city",
            customerCount: { $sum: 1 },
          },
        },
        { $sort: { customerCount: -1 } },
      ])
      .toArray();

    res.json(distribution);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
