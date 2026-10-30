import React, { useState } from 'react'
import Navbar from './Navbar'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import ShopCard from './ShopCard'
import { useSelector } from 'react-redux'
import ItemCard from './ItemCard'
import { SearchX } from 'lucide-react'

function UserDashBoard() {
    const [selectedCategory, setSelectedCategory] = useState(null)
    const { currCity, shops, items, searchItems } = useSelector(state => state.user)

    const handleSelectCategory = (categoryName) => {
        setSelectedCategory(prev => prev === categoryName ? null : categoryName)
    }

    const filteredItems = selectedCategory
        ? items?.filter(item => item.category === selectedCategory)
        : items

    const isSearching = searchItems !== null && searchItems !== undefined

    return (
        <div className='bg-orange-50/60 min-h-screen w-full'>
            <Navbar />

            {isSearching ? (

                /* Search results — takes over the whole browse view while active */
                <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10">
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight mb-1">
                        Search Results
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        {searchItems.length > 0
                            ? `${searchItems.length} item${searchItems.length !== 1 ? "s" : ""} found`
                            : "No matches for your search"}
                    </p>

                    {searchItems.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 px-6 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                                <SearchX className="w-7 h-7 text-orange-400" />
                            </div>
                            <p className="text-gray-700 font-semibold">No items found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                Try a different search term, or clear the search to browse everything.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                            {searchItems.map((item) => (
                                <ItemCard key={item._id} item={item} mode="customer" />
                            ))}
                        </div>
                    )}
                </section>

            ) : (

                <>
                    {/* Categories */}
                    <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-2">
                        <h2 className="text-xl font-bold text-gray-800 mb-5 tracking-tight">
                            What's on your mind?
                        </h2>
                        <div className="relative">
                            <div className="flex gap-6 sm:gap-8 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide">
                                {categories.map((cat) => (
                                    <CategoryCard
                                        key={cat.name}
                                        category={cat}
                                        isSelected={selectedCategory === cat.name}
                                        onClick={handleSelectCategory}
                                    />
                                ))}
                            </div>
                            <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-orange-50/60 to-transparent" />
                        </div>
                    </section>

                    {/* Divider */}
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="h-px bg-orange-200/60 my-4" />
                    </div>

                    {/* Nearby shops — only shown when browsing all categories, since shops aren't item-specific */}
                    {!selectedCategory && (
                        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-10">
                            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                                Best Shops in <span className="text-orange-500">{currCity || "your area"}</span>
                            </h2>
                            <p className="text-sm text-gray-500 mt-1 mb-6">
                                Top-rated restaurants and shops people are ordering from right now
                            </p>

                            {(!shops || shops.length === 0) ? (
                                <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 px-6 flex flex-col items-center text-center">
                                    <p className="text-gray-600 font-medium">No shops found near {currCity || "you"} yet</p>
                                    <p className="text-gray-400 text-sm mt-1">Check back soon as more restaurants join HungerHop.</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide">
                                        {shops.map((shop) => (
                                            <div key={shop._id} className="snap-start shrink-0 w-56 sm:w-64">
                                                <ShopCard shop={shop} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-orange-50/60 to-transparent" />
                                </div>
                            )}
                        </section>
                    )}

                    {/* Items — filtered by selected category, or "Suggested" when browsing all */}
                    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight mb-5">
                            {selectedCategory ? selectedCategory : "Suggested Food Items"}
                        </h2>

                        {(!filteredItems || filteredItems.length === 0) ? (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 px-6 flex flex-col items-center text-center">
                                <p className="text-gray-600 font-medium">
                                    {selectedCategory
                                        ? `No items found in "${selectedCategory}" yet`
                                        : "No items to show yet"}
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {selectedCategory
                                        ? "Try a different category, or check back soon."
                                        : "Check back soon as more restaurants join HungerHop."}
                                </p>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide">
                                    {filteredItems.map((item) => (
                                        <div key={item._id} className="snap-start">
                                            <ItemCard item={item} mode="customer" />
                                        </div>
                                    ))}
                                </div>
                                <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-orange-50/60 to-transparent" />
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    )
}

export default UserDashBoard