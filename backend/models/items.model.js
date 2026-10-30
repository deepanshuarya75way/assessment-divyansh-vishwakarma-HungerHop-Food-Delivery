import mongoose from "mongoose";

const cityDiscountSchema = new mongoose.Schema(
    {
        city: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        discountPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        discountedPrice: {
            type: Number,
            min: 0
        }
    },
    { _id: false }
);

const itemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String,
            required: true
        },

        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true
        },

        cityDiscounts: {
            type: [cityDiscountSchema],
            default: []
        },

        category: {
            type: String,
            enum: [
                "Snacks",
                "Main Course",
                "Desserts",
                "Pizza",
                "Burgers",
                "Sandwiches",
                "South Indian",
                "North Indian",
                "Chinese",
                "Fast Food",
                "Others"
            ],
            required: true
        },

        price: {
            type: Number,
            min: 0,
            required: true
        },

        foodtype: {
            type: String,
            enum: ["veg", "non veg"],
            required: true
        },

        rating: {
            average: {
                type: Number,
                default: 0
            },
            count: {
                type: Number,
                default: 0
            }
        }
    },
    {
        timestamps: true
    }
);

export const Item = mongoose.model("Item", itemSchema);
