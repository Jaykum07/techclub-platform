const mongoose = require('mongoose')

// Leader schema — yearly rotating club leaders
// history preserve hoti hai — past leaders delete nahi hote
// isCurrent flag se current aur past leaders alag ho jaate hain
const leaderSchema = new mongoose.Schema(
    {
        // ---- BASIC INFO ----

        name: {
            type: String,
            required: [true, 'Leader name is required'],
            trim: true,
        },

        // cloudinary image URL store hoga yahan
        // default nahi rakha kyunki photo required hai public page ke liye
        imageUrl: {
            type: String,
            required: [true, 'Leader photo is required'],
        },

        // leader ka club mein role
        // enum se ensure hota hai ki sirf valid roles hi store hon
        role: {
            type: String,
            enum: [
                'president',
                'vicePresident',   // camelCase — consistency ke liye
                'secretary',
                'treasurer',
                'publicRelationsOfficer',
                'techLead',
                'lead',
            ],
            required: [true, 'Role is required'],
        },

        // college batch — e.g. "2022-2026"
        batch: {
            type: String,
            required: [true, 'Batch is required'], // boolean true, string nahi
        },

        // ---- SOCIAL LINKS ----
        socialLinks: {
            linkedin: { type: String, default: '' },
            github: { type: String, default: '' },
        },

        // ---- TENURE ----
        // kab se kab tak leader tha
        // endDate optional hai — current leaders ka tenure abhi chal raha hai
        tenure: {
            startDate: {
                type: Date,
                required: [true, 'Tenure start date is required'],
            },
            endDate: {
                type: Date,
                // required nahi — isCurrent: true wale leaders ka endDate nahi hoga
                // jab unka tenure khatam ho tab endDate set karenge aur isCurrent: false
            },
        },

        // ---- CURRENT OR PAST ----
        // true  = abhi leader hai — public page ke "Current Team" section mein dikhega
        // false = past leader — "Past Leaders" section mein dikhega
        // default: false rakha — explicitly true set karna padega current leaders ke liye
        isCurrent: {
            type: Boolean,
            required: [true, 'isCurrent field is required'],
            default: false,
        },

        // ---- PUBLIC PAGE CONTENT ----

        // leader ka ek short message ya quote
        // public page pe unke card pe dikhega
        message: {
            type: String,
            default: '',
            maxlength: 200,
        },

        // unke tenure mein kya kya achieve kiya
        // array of strings — multiple achievements ho sakti hain
        // e.g. ["Organized first hackathon", "Grew membership to 200+"]
        achievements: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true, // createdAt aur updatedAt auto add hoga
    }
)

// ---- INDEXES ----

// isCurrent pe index — public page load pe sabse common query hai
// "saare current leaders dikhao" — ye query har page visit pe chalegi
leaderSchema.index({ isCurrent: 1 })

// role + isCurrent compound index
// "current president kaun hai" jaisi specific queries ke liye
leaderSchema.index({ role: 1, isCurrent: 1 })

// tenure startDate pe index — past leaders ko year ke hisaab se sort karne ke liye
leaderSchema.index({ 'tenure.startDate': -1 })

const Leader = mongoose.model('Leader', leaderSchema)

module.exports = Leader