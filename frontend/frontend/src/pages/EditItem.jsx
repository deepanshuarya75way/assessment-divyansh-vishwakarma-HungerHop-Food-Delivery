
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { UtensilsCrossed } from 'lucide-react'

const categories = [
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
]

function EditItem() {

    const navigate = useNavigate()
    const { itemId } = useParams()

    const [name, setName] = useState("")
    const [category, setCategory] = useState(categories[0])
    const [price, setPrice] = useState("")
    const [foodtype, setFoodtype] = useState("veg")

    const [image, setImage] = useState(null)
    const [preview, setPreview] = useState(null)

    const [cityDiscounts, setCityDiscounts] = useState([])

    const [fetching, setFetching] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {

        const fetchItem = async () => {

            try {

                const result = await axios.get(
                    `${serverUrl}/item/get/${itemId}`,
                    { withCredentials: true }
                )

                const item = result.data.data

                setName(item.name || "")
                setCategory(item.category || categories[0])
                setPrice(String(item.price ?? ""))
                setFoodtype(item.foodtype || "veg")
                setPreview(item.image || null)

                setCityDiscounts(
                    Array.isArray(item.cityDiscounts)
                        ? item.cityDiscounts
                        : []
                )

            } catch (err) {

                setError(
                    err?.response?.data?.message ||
                    "Failed to load item"
                )

            } finally {
                setFetching(false)
            }
        }

        if (itemId) {
            fetchItem()
        }

    }, [itemId])

    useEffect(() => {

        if (!image) return

        const objectUrl = URL.createObjectURL(image)

        setPreview(objectUrl)

        return () => {
            URL.revokeObjectURL(objectUrl)
        }

    }, [image])

    const handleImage = (e) => {

        const file = e.target.files?.[0]

        if (file) {
            setImage(file)
        }

    }

    const handleDiscountChange = (index, field, value) => {

        setCityDiscounts(prev =>
            prev.map((discount, i) =>
                i === index
                    ? { ...discount, [field]: value }
                    : discount
            )
        )

    }

    const addCityDiscount = () => {

        setCityDiscounts(prev => [
            ...prev,
            {
                city: "",
                discount: 0
            }
        ])

    }

    const removeCityDiscount = (index) => {

        setCityDiscounts(prev =>
            prev.filter((_, i) => i !== index)
        )

    }

    const handleSubmit = async (e) => {

        e.preventDefault()
        setError("")

        if (!name.trim() || !category || !foodtype) {
            setError("Please fill all required fields")
            return
        }

        const parsedPrice = Number(price)

        if (
            price.trim() === "" ||
            !Number.isFinite(parsedPrice) ||
            parsedPrice < 0
        ) {
            setError("Please enter a valid price")
            return
        }

        for (const discount of cityDiscounts) {

            if (!discount.city?.trim()) {
                setError("Please enter a city for every discount")
                return
            }

            const discountValue = Number(discount.discount)

            if (
                !Number.isFinite(discountValue) ||
                discountValue < 0 ||
                discountValue > 100
            ) {
                setError("Discount must be between 0 and 100")
                return
            }

        }

        const formData = new FormData()

        formData.append("name", name.trim())
        formData.append("category", category)
        formData.append("price", parsedPrice)
        formData.append("foodtype", foodtype)

        formData.append(
            "cityDiscounts",
            JSON.stringify(cityDiscounts.map(discount => ({
                ...discount,
                city: discount.city.trim(),
                discount: Number(discount.discount)
            })))
        )

        if (image) {
            formData.append("image", image)
        }

        try {

            setLoading(true)

            await axios.put(
                `${serverUrl}/item/update/${itemId}`,
                formData,
                {
                    withCredentials: true
                }
            )

            navigate("/owner-dashboard")

        } catch (err) {

            setError(
                err?.response?.data?.message ||
                "Something went wrong. Please try again."
            )

        } finally {

            setLoading(false)

        }

    }

    if (fetching) {

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">
                    Loading item...
                </p>
            </div>
        )

    }

    return (

        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

                {/* Header */}

                <div className="flex items-center gap-3 mb-6">

                    <div className="bg-orange-500 p-2.5 rounded-xl">
                        <UtensilsCrossed className="w-5 h-5 text-white" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Edit Item
                        </h2>

                        <p className="text-gray-500 text-sm">
                            Update this dish's details.
                        </p>
                    </div>

                </div>

                {/* Error */}

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Image */}

                    <div className="flex flex-col items-center">

                        <label htmlFor="item-image" className="cursor-pointer">

                            <div className="w-28 h-28 rounded-xl bg-orange-50 border-2 border-dashed border-orange-300 flex items-center justify-center overflow-hidden">

                                {preview ? (

                                    <img
                                        src={preview}
                                        alt="Item preview"
                                        className="w-full h-full object-cover"
                                    />

                                ) : (

                                    <span className="text-orange-400 text-sm text-center px-2">
                                        Upload Item Image
                                    </span>

                                )}

                            </div>

                        </label>

                        <input
                            id="item-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImage}
                        />

                    </div>

                    {/* Name */}

                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Item Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="e.g. Paneer Tikka Pizza"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />

                    </div>

                    {/* Category and Price */}

                    <div className="grid grid-cols-2 gap-4">

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>

                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                            >

                                {!categories.includes(category) && (
                                    <option value={category}>
                                        {category}
                                    </option>
                                )}

                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}

                            </select>

                        </div>

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (₹)
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                placeholder="e.g. 249"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />

                        </div>

                    </div>

                    {/* Food Type */}

                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Food Type
                        </label>

                        <div className="flex gap-3">

                            <button
                                type="button"
                                onClick={() => setFoodtype("veg")}
                                className={`flex-1 border rounded-lg py-2.5 text-sm font-medium ${
                                    foodtype === "veg"
                                        ? "border-green-500 bg-green-50 text-green-700"
                                        : "border-gray-300 text-gray-600"
                                }`}
                            >
                                🟢 Veg
                            </button>

                            <button
                                type="button"
                                onClick={() => setFoodtype("non veg")}
                                className={`flex-1 border rounded-lg py-2.5 text-sm font-medium ${
                                    foodtype === "non veg"
                                        ? "border-red-500 bg-red-50 text-red-700"
                                        : "border-gray-300 text-gray-600"
                                }`}
                            >
                                🔴 Non-Veg
                            </button>

                        </div>

                    </div>

                    {/* City Discounts */}

                    <div>

                        <div className="flex justify-between items-center mb-3">

                            <label className="text-sm font-medium text-gray-700">
                                City Discounts (%)
                            </label>

                            <button
                                type="button"
                                onClick={addCityDiscount}
                                className="text-sm text-orange-600 font-medium"
                            >
                                + Add City
                            </button>

                        </div>

                        {cityDiscounts.map((discount, index) => (

                            <div
                                key={index}
                                className="flex gap-2 mb-3"
                            >

                                <input
                                    type="text"
                                    placeholder="City name"
                                    value={discount.city || ""}
                                    onChange={(e) =>
                                        handleDiscountChange(
                                            index,
                                            "city",
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />

                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    placeholder="%"
                                    value={discount.discount ?? ""}
                                    onChange={(e) =>
                                        handleDiscountChange(
                                            index,
                                            "discount",
                                            e.target.value
                                        )
                                    }
                                    className="w-24 border border-gray-300 rounded-lg px-3 py-2"
                                />

                                <button
                                    type="button"
                                    onClick={() => removeCityDiscount(index)}
                                    className="text-red-500 px-2"
                                >
                                    ✕
                                </button>

                            </div>

                        ))}

                        {cityDiscounts.length === 0 && (
                            <p className="text-gray-400 text-xs">
                                No city-specific discounts added.
                            </p>
                        )}

                    </div>

                    {/* Submit */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >

                        {loading ? "Saving..." : "Save Changes"}

                    </button>

                </form>

            </div>

        </div>

    )

}

export default EditItem
