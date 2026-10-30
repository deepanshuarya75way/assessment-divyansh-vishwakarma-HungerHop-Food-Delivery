
import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { serverUrl } from '../App'
import Navbar from '../components/Navbar'
import ItemCard from '../components/ItemCard'
import { Store, PackageSearch, MapPin } from 'lucide-react'

function Shop() {

    const { shopId } = useParams()

    const { userData } = useSelector(state => state.user)

    const city = userData?.city

    const [shop, setShop] = useState(undefined)
    const [items, setItems] = useState([])

    const handleGetShop = useCallback(async () => {

        try {

            const result = await axios.get(
                `${serverUrl}/item/getbyshop/${shopId}`,
                {
                    params: city ? { city } : {},
                    withCredentials: true
                }
            )

            setShop(result.data.data?.shop || null)

            setItems(
                Array.isArray(result.data.data?.items)
                    ? result.data.data.items
                    : []
            )

        } catch (error) {

            console.log(
                "Error fetching shop:",
                error.response?.data || error.message
            )

            setShop(null)
            setItems([])

        }

    }, [shopId, city])

    useEffect(() => {
        handleGetShop()
    }, [handleGetShop])

    return (
        <div className="bg-[#FAF7F2] min-h-screen w-full">

            <Navbar />

            {shop === undefined ? (

                <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

                    <div className="bg-gray-200 rounded-3xl h-48 sm:h-64 animate-pulse mb-14" />

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                        {[0, 1, 2, 3, 4, 5].map(i => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse"
                            />
                        ))}
                    </div>

                </main>

            ) : shop === null ? (

                <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16">

                    <div className="bg-white rounded-3xl border border-dashed border-gray-200 py-16 px-6 flex flex-col items-center text-center">

                        <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                            <Store className="w-7 h-7 text-orange-400" />
                        </div>

                        <p className="text-gray-700 font-semibold">
                            Shop not found
                        </p>

                        <p className="text-gray-400 text-sm mt-1">
                            This shop may no longer exist, or the link is incorrect.
                        </p>

                    </div>

                </main>

            ) : (

                <>

                    <div className="relative w-full h-52 sm:h-64 lg:h-72 overflow-hidden">

                        {shop.image ? (

                            <img
                                src={shop.image}
                                alt={shop.name}
                                className="w-full h-full object-cover"
                            />

                        ) : (

                            <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-400" />

                        )}

                        <div className="absolute inset-0 bg-black/55" />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

                    </div>

                    <main className="max-w-6xl mx-auto px-4 sm:px-6">

                        <div className="relative -mt-16 sm:-mt-20 mb-8 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl shadow-black/10 border border-white/70 px-5 py-5 sm:px-7 sm:py-6 flex items-center gap-4 z-10">

                            <div className="bg-orange-500 p-3 sm:p-3.5 rounded-2xl shadow-md shrink-0">
                                <Store className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>

                            <div className="min-w-0 flex-1">

                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
                                    {shop.name}
                                </h1>

                                <div className="flex items-start gap-1.5 mt-1">

                                    <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />

                                    <p className="text-sm text-gray-800 line-clamp-2">
                                        {shop.address}
                                        {shop.city && `, ${shop.city}`}
                                        {shop.state && `, ${shop.state}`}
                                    </p>

                                </div>

                            </div>

                        </div>

                        {items.length === 0 ? (

                            <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 px-6 flex flex-col items-center text-center mb-10">

                                <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                                    <PackageSearch className="w-7 h-7 text-orange-400" />
                                </div>

                                <p className="text-gray-700 font-semibold">
                                    No items yet
                                </p>

                                <p className="text-gray-400 text-sm mt-1">
                                    This shop hasn't added any items yet — check back soon.
                                </p>

                            </div>

                        ) : (

                            <div className="mt-8">

                                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                                    {items.length} item
                                    {items.length !== 1 ? "s" : ""} on the menu
                                </p>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 pb-10">

                                    {items.map(item => (

                                        <ItemCard
                                            key={item._id}
                                            item={item}
                                            mode="customer"
                                        />

                                    ))}

                                </div>

                            </div>

                        )}

                    </main>

                </>

            )}

        </div>
    )
}

export default Shop
