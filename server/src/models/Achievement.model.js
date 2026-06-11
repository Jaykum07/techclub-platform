const mongoose = require('mongoose')

// Achievement schema — club ke saare achievements yahan store honge
// public page pe "Our Achievements" section mein dikhenge
// admin panel se add/edit/delete hoga
const achievementSchema = new mongoose.Schema(
    {
        // ---- BASIC INFO ----

        title: {
            type: String,
            required: [true, 'Achievement title is required'],
            trim: true,
            maxlength: 100,
        },

        description: {
            type: String,
            required: [true, 'Description is required'],
            maxlength: 500,
        },

        // ---- ACHIEVEMENT TYPE ----
        // kis category ka achievement hai
        achievementType: {
            type: String,
            enum: [
                'hackathon',
                'techFest',
                'placement',
                'internship',
                'competition',
                'recognition',  // award ya recognition jo competition nahi tha
                'other',        // future ke liye
            ],
            required: [true, 'Achievement type is required'],
        },

        // ---- POSITION / RESULT ----
        // 1st place, winner, runner-up — public page pe dikhega
        position: {
            type: String,
            enum: ['winner', 'runnerUp', 'secondRunnerUp', 'finalist', 'participant', 'special'],
            required: [true, 'Position is required'],
        },

        // ---- EVENT DETAILS ----
        // kahan se mila ye achievement
        eventName: {
            type: String,
            required: [true, 'Event/Competition name is required'],
            trim: true,
            maxlength: 150,
        },

        // organizer ka naam — e.g. "IIT Bombay", "Google"
        organizedBy: {
            type: String,
            default: '',
            maxlength: 100,
        },

        // ---- YEAR ----
        // kis saal mila — public page pe year wise filter ke liye
        year: {
            type: Number,
            required: [true, 'Year is required'],
        },

        // exact date optional hai — year toh hamesha hoga
        achievedAt: {
            type: Date,
        },

        // ---- MEDIA ----
        // trophy photo, certificate, ya event photo
        achievementImage: {
            type: String,
            default: '', // cloudinary URL
        },

        // ---- TEAM MEMBERS ----
        // kaun kaun tha is achievement mein
        // User ke ObjectIds store karenge
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],

        // ---- VISIBILITY ----
        // false = admin ne save kiya but public page pe nahi dikhega abhi
        // true = public page pe visible hai
        // admin draft mein rakh sakta hai pehle, baad mein publish karega
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

// year pe index — public page pe "2024 achievements" filter karega
achievementSchema.index({ year: -1 })

// achievementType pe index — "saare hackathon wins dikhao" filter ke liye
achievementSchema.index({ achievementType: 1 })

// isPublished pe index — public page sirf published achievements fetch karega
achievementSchema.index({ isPublished: 1 })

const Achievement = mongoose.model('Achievement', achievementSchema)

module.exports = Achievement