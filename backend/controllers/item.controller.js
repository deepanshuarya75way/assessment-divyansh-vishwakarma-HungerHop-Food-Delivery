
import { ApiError } from "../config/apierror.js";
import { ApiResponse } from "../config/apiresponse.js";
import { asyncHandler } from "../config/asynchandler.js";
import { Item } from "../models/items.model.js";
import { Shop } from "../models/shop.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { formatItemWithdiscount } from "../utils/PriceCalculator.js";

const parseCityDiscounts = (cityDiscounts) => {
    if (cityDiscounts === undefined) {
        return undefined;
    }

    if (typeof cityDiscounts === "string") {
        try {
            cityDiscounts = JSON.parse(cityDiscounts);
        } catch {
            throw new ApiError(400, "Invalid cityDiscounts format");
        }
    }

    if (!Array.isArray(cityDiscounts)) {
        throw new ApiError(400, "cityDiscounts must be an array");
    }

    return cityDiscounts;
};

const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
export const createItem = asyncHandler(async (req, res) => {

    const { name, category, foodtype, price } = req.body;

    let { cityDiscounts } = req.body;

    if (!name || !category || !foodtype || price === undefined) {
        throw new ApiError(400, "All required fields must be provided");
    }

    const parsedPrice = Number(price);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        throw new ApiError(400, "Invalid item price");
    }

    cityDiscounts = parseCityDiscounts(cityDiscounts) || [];

    const shop = await Shop.findOne({ owner: req.userId });

    if (!shop) {
        throw new ApiError(404, "Shop does not exist");
    }

    let image;

    if (req.file) {
        image = await uploadOnCloudinary(req.file.path);
    }

    const item = await Item.create({
        name,
        image,
        shop: shop._id,
        category,
        foodtype,
        price: parsedPrice,
        cityDiscounts
    });

    shop.items.push(item._id);

    await shop.save();

    await shop.populate("owner");

    await shop.populate({
        path: "items",
        options: { sort: { updatedAt: -1 } }
    });

    return res.status(201).json(
        new ApiResponse(201, shop, "Item created successfully")
    );
});

export const updateItem = asyncHandler(async (req, res) => {

    const { itemId } = req.params;

    if (!itemId) {
        throw new ApiError(400, "Item ID is required");
    }

    const shop = await Shop.findOne({ owner: req.userId });

    if (!shop) {
        throw new ApiError(404, "Shop does not exist");
    }

    const updateData = {};

    const { name, category, foodtype, price } = req.body;

    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (foodtype !== undefined) updateData.foodtype = foodtype;

    if (price !== undefined) {
        const parsedPrice = Number(price);

        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            throw new ApiError(400, "Invalid item price");
        }

        updateData.price = parsedPrice;
    }

    if (req.body.cityDiscounts !== undefined) {
        updateData.cityDiscounts = parseCityDiscounts(
            req.body.cityDiscounts
        );
    }

    if (req.file) {
        updateData.image = await uploadOnCloudinary(req.file.path);
    }

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No update data provided");
    }

    const item = await Item.findOneAndUpdate(
        {
            _id: itemId,
            shop: shop._id
        },
        {
            $set: updateData
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!item) {
        throw new ApiError(404, "Item not found");
    }

    await shop.populate({
        path: "items",
        options: { sort: { updatedAt: -1 } }
    });

    return res.status(200).json(
        new ApiResponse(200, shop, "Item updated successfully")
    );
});

export const getItem = asyncHandler(async (req, res) => {

    const { itemId } = req.params;
    const { city } = req.query;

    const item = await Item.findById(itemId);

    if (!item) {
        throw new ApiError(404, "Item not found");
    }

    const itemData = city
        ? formatItemWithdiscount(item, city)
        : item;

    return res.status(200).json(
        new ApiResponse(200, itemData, "Item fetched successfully")
    );
});

export const deleteItem = asyncHandler(async (req, res) => {

    const { itemId } = req.params;

    const shop = await Shop.findOne({ owner: req.userId });

    if (!shop) {
        throw new ApiError(404, "Shop does not exist");
    }

    const item = await Item.findOneAndDelete({
        _id: itemId,
        shop: shop._id
    });

    if (!item) {
        throw new ApiError(404, "Item not found");
    }

    await Shop.findByIdAndUpdate(
        shop._id,
        {
            $pull: { items: itemId }
        }
    );

    return res.status(200).json(
        new ApiResponse(200, {}, "Item deleted successfully")
    );
});

export const getItemByCity = asyncHandler(async (req, res) => {

    const { city } = req.params;

    if (!city || !city.trim()) {
        throw new ApiError(400, "City is required");
    }

    const shops = await Shop.find({
        city: {
            $regex: `^${escapeRegex(city.trim())}$`,
            $options: "i"
        }
    });

    if (shops.length === 0) {
        throw new ApiError(404, "No shops found in this city");
    }

    const shopIds = shops.map(shop => shop._id);

    const items = await Item.find({
        shop: { $in: shopIds }
    });

    const formattedItems = items.map(item =>
        formatItemWithdiscount(item, city)
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            formattedItems,
            "Items fetched by city successfully"
        )
    );
});

export const getItemByShop = asyncHandler(async (req, res) => {

    const { shopId } = req.params;
    const { city } = req.query;

    const shop = await Shop.findById(shopId).populate({
        path: "items",
        options: { sort: { updatedAt: -1 } }
    });

    if (!shop) {
        throw new ApiError(404, "Shop not found");
    }

    const targetCity = city || shop.city;

    const formattedItems = shop.items.map(item =>
        formatItemWithdiscount(item, targetCity)
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                shop,
                items: formattedItems
            },
            "Items fetched successfully"
        )
    );
});

export const searchItems = asyncHandler(async (req, res) => {

    const { query, city } = req.query;

    if (!city || !city.trim()) {
        throw new ApiError(400, "City is required");
    }

    if (!query || !query.trim()) {
        throw new ApiError(400, "Search query is required");
    }

    const shops = await Shop.find({
        city: {
            $regex: `^${escapeRegex(city.trim())}$`,
            $options: "i"
        }
    }).select("_id");

    if (shops.length === 0) {
        throw new ApiError(404, "No shops found in this city");
    }

    const shopIds = shops.map(shop => shop._id);

    const searchRegex = new RegExp(
        escapeRegex(query.trim()),
        "i"
    );

    const items = await Item.find({
        shop: { $in: shopIds },
        $or: [
            { name: searchRegex },
            { category: searchRegex }
        ]
    }).populate("shop", "name image");

    const formattedItems = items.map(item =>
        formatItemWithdiscount(item, city)
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            formattedItems,
            "Items fetched successfully"
        )
    );
});
