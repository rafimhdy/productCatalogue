import BestSeller from "../models/bestSellerModel.js";
import Review from "../models/reviewModel.js";

// Get best sellers for homepage (public endpoint)
export const getBestSellers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        BestSeller.getBestSellers(limit, (err, bestSellers) => {
            if (err) {
                console.error("Error fetching best sellers:", err);
                return res.status(500).json({ message: "Failed to fetch best sellers" });
            }

            res.json(bestSellers);
        });
    } catch (error) {
        console.error("Error in getBestSellers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get best sellers by category
export const getBestSellersByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        BestSeller.getBestSellersByCategory(categoryId, limit, (err, bestSellers) => {
            if (err) {
                console.error("Error fetching best sellers by category:", err);
                return res.status(500).json({ message: "Failed to fetch best sellers" });
            }

            res.json(bestSellers);
        });
    } catch (error) {
        console.error("Error in getBestSellersByCategory:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get trending products
export const getTrendingProducts = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const limit = parseInt(req.query.limit) || 10;

        BestSeller.getTrendingProducts(days, limit, (err, trending) => {
            if (err) {
                console.error("Error fetching trending products:", err);
                return res.status(500).json({ message: "Failed to fetch trending products" });
            }

            res.json(trending);
        });
    } catch (error) {
        console.error("Error in getTrendingProducts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Calculate best sellers (admin endpoint)
export const calculateBestSellers = async (req, res) => {
    try {
        console.log("Starting manual best sellers calculation...");

        // First update all product ratings
        Review.updateAllProductRatings((updateErr) => {
            if (updateErr) {
                console.error("Error updating product ratings:", updateErr);
                return res.status(500).json({ message: "Failed to update product ratings" });
            }

            console.log("Product ratings updated, now calculating best sellers...");

            // Then calculate best sellers
            BestSeller.calculateBestSellers((calcErr, results) => {
                if (calcErr) {
                    console.error("Error calculating best sellers:", calcErr);
                    return res.status(500).json({ message: "Failed to calculate best sellers" });
                }

                console.log(`Best sellers calculation completed. ${results.length} products ranked.`);
                res.json({
                    message: "Best sellers calculated successfully",
                    totalProducts: results.length,
                    products: results
                });
            });
        });
    } catch (error) {
        console.error("Error in calculateBestSellers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Add endpoint to manually trigger calculation
export const triggerBestSellersUpdate = async (req, res) => {
    try {
        console.log("Manual trigger for best sellers calculation...");

        // First update all product ratings
        Review.updateAllProductRatings((updateErr) => {
            if (updateErr) {
                console.error("Error updating product ratings:", updateErr);
                return res.status(500).json({ message: "Failed to update product ratings" });
            }

            console.log("Product ratings updated, now calculating best sellers...");

            // Then calculate best sellers
            BestSeller.calculateBestSellers((calcErr, results) => {
                if (calcErr) {
                    console.error("Error calculating best sellers:", calcErr);
                    return res.status(500).json({ message: "Failed to calculate best sellers" });
                }

                console.log(`Best sellers calculation completed. ${results ? results.length : 0} products ranked.`);
                res.json({
                    message: "Best sellers calculated and updated successfully",
                    totalProducts: results ? results.length : 0,
                    products: results || []
                });
            });
        });
    } catch (error) {
        console.error("Error in triggerBestSellersUpdate:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get best sellers calculation info
export const getBestSellersInfo = async (req, res) => {
    try {
        BestSeller.getLastCalculationDate((err, result) => {
            if (err) {
                console.error("Error fetching calculation date:", err);
                return res.status(500).json({ message: "Failed to fetch calculation info" });
            }

            const lastCalculation = result[0]?.last_calculation;
            const hoursAgo = lastCalculation
                ? Math.floor((Date.now() - new Date(lastCalculation).getTime()) / (1000 * 60 * 60))
                : null;

            res.json({
                lastCalculation,
                hoursAgo,
                needsUpdate: !lastCalculation || hoursAgo > 4
            });
        });
    } catch (error) {
        console.error("Error in getBestSellersInfo:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
