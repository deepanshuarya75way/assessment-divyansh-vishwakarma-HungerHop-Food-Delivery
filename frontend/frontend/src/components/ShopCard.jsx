
import React from 'react'
import { Link } from 'react-router-dom'
import { Star, Clock } from 'lucide-react'

function ShopCard({ shop }) {

    const rating = typeof shop.rating === "object"
        ? shop.rating?.average
        : shop.rating

    return (
        <Link
            to={`/shop/${shop._id}`}
            className="block bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
        >

            <div className="relative h-32 sm:h-36 w-full bg-gray-100 overflow-hidden">

                <img
                    src={shop.image || "/default-shop.png"}
                    alt={shop.name || "Shop"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <span className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/95 backdrop-blur-sm text-green-700 text-[11px] font-bold px-2 py-1 rounded-full shadow-sm">

                    <Star className="w-3 h-3 fill-green-600 text-green-600" />

                    {rating > 0 ? Number(rating).toFixed(1) : "New"}

                </span>

            </div>

            <div className="p-3.5">

                <h3 className="font-bold text-gray-800 truncate">
                    {shop.name}
                </h3>

                <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {[shop.city, shop.state]
                        .filter(Boolean)
                        .join(", ") || "Location unavailable"}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">

                    <Clock className="w-3.5 h-3.5" />

                    <span>25–35 mins (estimated)</span>

                </div>

            </div>

        </Link>
    )
}

export default ShopCard
