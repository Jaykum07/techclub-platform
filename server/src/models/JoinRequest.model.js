const mongoose = require('mongoose')

// JoinRequest schema — club join karne ke liye form submission
// public page se koi bhi submit kar sakta hai — login required nahi
// lifecycle: pending → reviewing → shortlisted → tested → approved/rejected
const joinRequestSchema = new mongoose.Schema(
    {
        // ---- PERSONAL INFO ----

        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },

        // ---- EDUCATION ----
        // tumne khud socha — good product thinking
        // college ke context mein ye details zaroori hain screening ke liye
        education: {
            enrollmentNumber: {
                type: String,
                default: '',
            },
            degree: {
                type: String,
                enum: ['BTech', 'BCA', 'MCA', 'Diploma'],
                default: 'BTech',
            },
            year: {
                type: Number,
                enum: [1, 2, 3, 4],
                default: 1,
            },
            branch: {
                type: String,
                enum: [
                    'CSE', 'AIML', 'DS', 'CyberSecurity',
                    'IT', 'EC', 'EX', 'ME', 'Civil', 'other'
                ],
                default: 'CSE',
            },
        },

        // ---- CONTACT ----
        contact: {
            email: {
                type: String,
                required: [true, 'Email is required'],
                lowercase: true,
                trim: true,
            },
            contactNumber: {
                type: String,
                required: [true, 'Contact number is required'],
            },
        },

        // ---- SOCIAL LINKS ----
        // linkedin required hai — core team yahan profile verify karega
        // OWASP A04 — screening process backend se hogi
        socialLinks: {
            linkedin: {
                type: String,
                required: [true, 'LinkedIn profile is required'],
            },
            github: {
                type: String,
                default: '',
            },
        },

        // why join karna chahte ho — interest aur skills
        interest: {
            type: String,
            required: [true, 'Interest is required'],
            maxlength: 500,
        },

        // ---- LIFECYCLE STATUS ----
        // pending     → form submit hua, kisi ne review nahi kiya
        // reviewing   → core team profile dekh raha hai
        // shortlisted → test ke liye select hua
        // tested      → test de diya, evaluation pending
        // approved    → member ban gaya — User model mein account banega
        // rejected    → is baar nahi liya
        status: {
            type: String,
            enum: [
                'pending',
                'reviewing',
                'shortlisted',
                'tested',
                'approved',
                'rejected',
            ],
            default: 'pending',
        },

        // ---- TEST REFERENCE ----
        // shortlist hone ke baad kaun sa test dena hai
        // ObjectId hai String nahi — populate() se test details aa sakti hain
        testId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Test',
            default: null, // shortlist se pehle null rahega
        },

        // ---- INTERNAL REVIEW NOTES ----
        // core team ka private note — applicant ko nahi dikhega kabhi
        // OWASP A01 — ye field sirf core/admin role dekhega
        reviewNotes: {
            type: String,
            default: '',
            maxlength: 500,
        },

        // kaun se core member ne review kiya — accountability ke liye
        // OWASP A09 — actions tracked honi chahiye
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null, // review hone se pehle null
        },

        // kab review hua
        reviewedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true, // createdAt = kab form submit hua
    }
)

// ---- INDEXES ----

// status pe index — "saari pending requests dikhao" sabse common query hai
joinRequestSchema.index({ status: 1 })

// email pe unique index — ek email se ek hi request ho sakti hai
// duplicate applications database level pe block hongi
// OWASP A01 — integrity at database level
joinRequestSchema.index({ 'contact.email': 1 }, { unique: true })

// createdAt pe index — newest requests pehle dikhane ke liye
joinRequestSchema.index({ createdAt: -1 })

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema)

module.exports = JoinRequest