import { Link } from 'react-router-dom'
import { Pencil, Trash2, Plus } from 'lucide-react'
import StarRating from './StarRating'
import { addToCart } from '../redux/userSlice'
import { useDispatch } from 'react-redux'

function ItemCard({ item, onDelete, mode = "owner" }) {

    const hasRating = item.rating?.count > 0
    const dispatch = useDispatch()

    const effectivePrice = Number(
        item.effectivePrice ?? item.price
    )

    const originalPrice = Number(
        item.originalPrice ?? item.price
    )

    const hasDiscount = effectivePrice < originalPrice

    const discountPercentage = hasDiscount
        ? Math.round(
            ((originalPrice - effectivePrice) / originalPrice) * 100
        )
        : 0

    const handleAddToCart = (e) => {
        e.preventDefault()

        dispatch(addToCart({
            id: item._id,
            name: item.name,
            price: effectivePrice,
            originalPrice,
            image: item.image,
            foodtype: item.foodtype,
            shop: item.shop,
            quantity: 1
        }))
    }

    if (mode === "customer") {
        return (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden shrink-0 w-40 sm:w-44 hover:shadow-md transition-shadow">

                <div className="relative h-28 bg-gray-100">

                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />

                    <span
                        className={`absolute top-2 left-2 w-4 h-4 border-2 rounded-sm flex items-center justify-center bg-white ${
                            item.foodtype === "veg"
                                ? "border-green-600"
                                : "border-red-600"
                        }`}
                    >
                        <span
                            className={`w-1.5 h-1.5 rounded-full ${
                                item.foodtype === "veg"
                                    ? "bg-green-600"
                                    : "bg-red-600"
                            }`}
                        />
                    </span>

                    {hasDiscount && (
                        <span className="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                            {discountPercentage}% OFF
                        </span>
                    )}

                </div>

                <div className="p-3">

                    <p className="text-[11px] text-orange-500 font-medium mb-0.5">
                        {item.category}
                    </p>

                    <p className="text-sm font-semibold text-gray-800 truncate">
                        {item.name}
                    </p>

                    {hasRating ? (
                        <div className="flex items-center gap-1.5 mt-1">
                            <StarRating
                                rating={item.rating.average}
                                size={12}
                            />
                            <span className="text-[11px] text-gray-400">
                                ({item.rating.count})
                            </span>
                        </div>
                    ) : (
                        <p className="text-[11px] text-gray-400 mt-1">
                            No ratings yet
                        </p>
                    )}

                    <div className="flex items-center justify-between mt-2">

                        <div className="flex flex-col">

                            <p className="text-gray-800 text-sm font-bold">
                                ₹{effectivePrice}
                            </p>

                            {hasDiscount && (
                                <p className="text-[10px] text-gray-400 line-through">
                                    ₹{originalPrice}
                                </p>
                            )}

                        </div>

                        <button
                            onClick={handleAddToCart}
                            className="flex items-center gap-1 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-1 rounded-md transition"
                        >
                            <Plus className="w-3 h-3" />
                            Add
                        </button>

                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group">

            <div className="relative h-28 bg-gray-100">

                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                />

                <span
                    className={`absolute top-2 left-2 w-4 h-4 border-2 rounded-sm flex items-center justify-center bg-white ${
                        item.foodtype === "veg"
                            ? "border-green-600"
                            : "border-red-600"
                    }`}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${
                            item.foodtype === "veg"
                                ? "bg-green-600"
                                : "bg-red-600"
                        }`}
                    />
                </span>

            </div>

            <div className="p-3">

                <p className="text-[11px] text-orange-500 font-medium mb-0.5">
                    {item.category}
                </p>

                <p className="text-sm font-semibold text-gray-800 truncate">
                    {item.name}
                </p>

                {hasRating ? (
                    <div className="flex items-center gap-1.5 mt-1">
                        <StarRating
                            rating={item.rating.average}
                            size={12}
                        />
                        <span className="text-[11px] text-gray-400">
                            ({item.rating.count})
                        </span>
                    </div>
                ) : (
                    <p className="text-[11px] text-gray-400 mt-1">
                        No ratings yet
                    </p>
                )}

                <p className="text-gray-700 text-sm font-semibold mt-1">
                    Base Price: ₹{item.price}
                </p>

                {item.cityDiscounts?.length > 0 && (
                    <p className="text-[10px] text-green-600 mt-1">
                        City discounts: {item.cityDiscounts.length}
                    </p>
                )}

                <div className="flex gap-2 mt-3">

                    <Link
                        to={`/edit-item/${item._id}`}
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg py-1.5 transition"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                    </Link>

                    <button
                        onClick={() => onDelete?.(item._id)}
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 rounded-lg py-1.5 transition"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                    </button>

                </div>
            </div>
        </div>
    )
}

export default ItemCard
