const mongoose = require('mongoose')

// permanentMemberSchema — founder, cofounder, patron ka structure
// ye alag schema isliye banaya taaki clean rahe aur reuse ho sake
// embed kiya hai ClubProfile mein kyunki:
// 1. permanent members ki count bounded hai (5-10 max, kabhi 1000 nahi honge)
// 2. club profile load karte waqt hamesha chahiye hote hain
// 3. sirf is club ke hain, kisi aur ke saath share nahi hote
const permanentMemberSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        // role batata hai kaun hai — founder, cofounder, ya patron
        // enum use kiya taaki koi galat value store na ho
        role: {
            type: String,
            enum: ['founder', 'cofounder', 'patron'],
            required: true,
        },

        photo: {
            type: String,
            default: '', // cloudinary image URL yahan store hoga
        },

        linkedin: {
            type: String,
            default: '',
        },

        email: {
            type: String,
            default: '',
        },

        // founder ka short message ya quote — public page pe dikhega
        message: {
            type: String,
            default: '',
            maxlength: 300,
        },
    },
    {
        _id: true, // har permanent member ka apna ID hoga
    }
)

// ClubProfile schema — club ki saari public information yahan hogi
// SINGLETON PATTERN — poore database mein sirf EK hi document hoga
// admin is document ko update karta rahega, naya nahi banata
const clubProfileSchema = new mongoose.Schema(
    {
        // ---- SINGLETON ENFORCEMENT ----
        // isSingleton field hamesha true rahega
        // unique: true ensure karta hai ki sirf ek hi document ban sake
        // agar koi galti se dusra document banane ki koshish kare
        // toh MongoDB duplicate key error throw karega
        isSingleton: {
            type: Boolean,
            default: true,
            unique: true, // ye line sabse important hai singleton ke liye
        },

        // ---- BASIC CLUB INFO ----

        clubName: {
            type: String,
            required: [true, 'Club name is required'],
            trim: true,
        },

        tagline: {
            type: String,
            default: '',
            maxlength: 150, // short and punchy — public page pe hero section mein dikhega
        },

        description: {
            type: String,
            required: [true, 'Club description is required'],
            maxlength: 1000,
        },

        foundingYear: {
            type: Number,
            required: [true, 'Founding year is required'],
        },

        // club ka logo — cloudinary URL store hoga
        logoUrl: {
            type: String,
            default: '',
        },

        // ---- STATS ----
        // ye numbers admin manually update karega ya
        // baad mein aggregation se auto-calculate karenge
        stats: {
            totalMembers: {
                type: Number,
                default: 0,
            },
            totalEvents: {
                type: Number,
                default: 0,
            },
            totalAchievements: {
                type: Number,
                default: 0, // Achievement model se count aayega baad mein
            },
            yearsActive: {
                type: Number,
                default: 0,
            },
        },

        // ---- SOCIAL LINKS ----
        // sab optional hain — default empty string
        // public page ke footer mein dikhenge
        socialLinks: {
            instagram: { type: String, default: '' },
            linkedin: { type: String, default: '' },
            github: { type: String, default: '' },
            youtube: { type: String, default: '' }, // future ke liye
            twitter: { type: String, default: '' }, // future ke liye
        },

        // ---- CONTACT INFO ----
        contact: {
            email: {
                type: String,
                default: '',
                // club ka official email — individual leaders ka nahi
            },
            phone: {
                type: String,
                default: '',
            },
        },

        // ---- PERMANENT MEMBERS ----
        // founder, cofounder, patron — kabhi nahi badlte
        // array isliye rakha taaki kal 2 cofounders bhi ho sakein
        // DRY principle — ek structure, multiple entries
        permanentMembers: [permanentMemberSchema],
    },
    {
        timestamps: true, // createdAt aur updatedAt auto add hoga
    }
)

// ---- INDEX ----
// isSingleton pe index — fast lookup ke liye jab public page load ho
// vaise unique: true already ek index banata hai, ye explicit hai
clubProfileSchema.index({ isSingleton: 1 })

const ClubProfile = mongoose.model('ClubProfile', clubProfileSchema)

module.exports = ClubProfile