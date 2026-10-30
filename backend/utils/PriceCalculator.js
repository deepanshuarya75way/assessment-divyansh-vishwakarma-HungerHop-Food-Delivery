
export const getEffectivePrice = (item, city) => {

    if (!item) return 0;

    const originalPrice = Number(item.price);

    if (!Number.isFinite(originalPrice) || originalPrice < 0) {
        return 0;
    }

    if (
        !city ||
        !Array.isArray(item.cityDiscounts) ||
        item.cityDiscounts.length === 0
    ) {
        return originalPrice;
    }

    const normalizedCity = city.trim().toLowerCase();

    const rule = item.cityDiscounts.find(
        (d) =>
            d.city &&
            d.city.trim().toLowerCase() === normalizedCity
    );

    if (!rule) {
        return originalPrice;
    }

    if (
        rule.discountedPrice !== undefined &&
        rule.discountedPrice !== null
    ) {
        const discountedPrice = Number(rule.discountedPrice);

        if (
            Number.isFinite(discountedPrice) &&
            discountedPrice >= 0 &&
            discountedPrice <= originalPrice
        ) {
            return Math.round(discountedPrice * 100) / 100;
        }
    }

    const discountPercentage = Number(rule.discountPercentage);

    if (
        Number.isFinite(discountPercentage) &&
        discountPercentage > 0 &&
        discountPercentage <= 100
    ) {
        const discountedPrice =
            originalPrice * (1 - discountPercentage / 100);

        return Math.round(discountedPrice * 100) / 100;
    }

    return originalPrice;
};

export const formatItemWithdiscount = (item, city) => {

    const plainItem = item.toObject
        ? item.toObject()
        : { ...item };

    const effectivePrice = getEffectivePrice(plainItem, city);

    return {
        ...plainItem,
        effectivePrice,
        originalPrice: plainItem.price,
        hasDiscount: effectivePrice < plainItem.price
    };
};
