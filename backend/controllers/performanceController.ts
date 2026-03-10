import { Performance } from "../models/Performance.ts";

export const getPerformance = async (req: any, res: any) => {
  try {
    const reviews = await Performance.find({ user_id: req.params.userId });
    res.json(reviews.map((r: any) => ({
      ...r.toObject(),
      id: r._id
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createPerformanceReview = async (req: any, res: any) => {
  const { user_id, rating, comments } = req.body;
  try {
    const review = await Performance.create({
      user_id,
      reviewer_id: req.user.id,
      rating,
      comments
    });
    res.json({ id: review._id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
