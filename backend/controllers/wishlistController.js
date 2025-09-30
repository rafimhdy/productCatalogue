import Wishlist from "../models/wishlistModel.js";

// Add product to wishlist
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.id;

        Wishlist.add(userId, productId, (err, result) => {
            if (err) {
                if (err.message === "Product already in wishlist") {
                    return res.status(400).json({ message: "Product already in wishlist" });
                }
                console.error("Error adding to wishlist:", err);
                return res.status(500).json({ message: "Failed to add to wishlist" });
            }
            res.status(201).json({ message: "Product added to wishlist successfully" });
        });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        Wishlist.remove(userId, productId, (err, result) => {
            if (err) {
                console.error("Error removing from wishlist:", err);
                return res.status(500).json({ message: "Failed to remove from wishlist" });
            }
            res.json({ message: "Product removed from wishlist successfully" });
        });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get user's wishlist
export const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;

        Wishlist.getByUserId(userId, (err, results) => {
            if (err) {
                console.error("Error fetching wishlist:", err);
                return res.status(500).json({ message: "Failed to fetch wishlist" });
            }
            res.json(results);
        });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Check if product is in wishlist
export const checkWishlistStatus = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        Wishlist.isInWishlist(userId, productId, (err, results) => {
            if (err) {
                console.error("Error checking wishlist status:", err);
                return res.status(500).json({ message: "Failed to check wishlist status" });
            }
            res.json({ isInWishlist: results.length > 0 });
        });
    } catch (error) {
        console.error("Error checking wishlist status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
