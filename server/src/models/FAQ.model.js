const mongoose = require('mongoose')

// FAQ schema — club ke baare mein common questions aur answers
// public page pe "Frequently Asked Questions" section mein dikhenge
// admin panel se manage hoga — add, edit, reorder, publish/unpublish
//
// Design decision — har document = ek FAQ pair
// alag alag arrays mein questions aur answers nahi rakhe
// kyunki agar ek delete ho toh dusra orphan ho jaata
// pair saath mein rakha toh koi mismatch nahi hoga
const faqSchema = new mongoose.Schema(
    {
        // ---- CONTENT ----

        question: {
            type: String,
            required: [true, 'Question is required'],
            trim: true,
            maxlength: 300,
        },

        answer: {
            type: String,
            required: [true, 'Answer is required'],
            trim: true,
            maxlength: 1000,
        },

        // ---- CATEGORY ----
        // public page pe category wise filter kar sakte hain
        // e.g. "Membership ke saare questions dikhao"
        category: {
            type: String,
            enum: ['general', 'membership', 'events', 'technical'],
            default: 'general',
        },

        // ---- ORDER ----
        // public page pe FAQs is number ke hisaab se sort honge
        // admin drag and drop se reorder karega — woh order yahan save hoga
        // e.g. order: 1 sabse pehle dikhega, order: 2 uske baad
        order: {
            type: Number,
            default: 0,
        },

        // ---- VISIBILITY ----
        // false = admin ne save kiya, public page pe nahi dikhega
        // true = public page pe visible hai
        isPublished: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

// ---- INDEXES ----

// isPublished pe index — public page sirf published FAQs fetch karega
faqSchema.index({ isPublished: 1 })

// order pe index — FAQs sorted order mein fetch honge
faqSchema.index({ order: 1 })

// category + isPublished compound index
// "general category ke published FAQs dikhao" jaisi query ke liye
faqSchema.index({ category: 1, isPublished: 1 })

const FAQ = mongoose.model('FAQ', faqSchema)

module.exports = FAQ