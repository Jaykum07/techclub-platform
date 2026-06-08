const mongoose = require("mongoose")

// Event schema — ek event ka blueprint hai yeh
// jab bhi koi event create hoga, uska data is structure mein store hoga MongoDB mein
const eventSchema = new mongoose.Schema(
  {
    // ---- BASIC INFO ----

    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,              // accidental spaces hatata hai start aur end se
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    eventType: {
      type: String,
      // sirf yahi 5 values allowed hain — kuch aur doge toh MongoDB reject karega
      enum: ["workshop", "hackathon", "seminar", "meetup", "competition"],
      required: true,
    },

    // ---- WHO CREATED THIS EVENT (reference) ----
    // yahan hum User ka poora data embed nahi kar rahe
    // sirf uska _id store kar rahe hain
    // kyun? kyunki agar user ka naam badle, toh humein sirf User collection update karna hoga
    // agar embed kiya hota toh har jagah update karna padta — data duplication ka problem
    // jab naam chahiye hoga toh populate() use karenge — woh automatically User se data laata hai

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,  // User ka unique _id store hoga yahan
      ref: "User",                           // Mongoose ko batata hai ki yeh User model se connected hai
      required: true,
    },

    // ---- EVENT DATES AND LOCATION ----

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    venue: { type: String, required: true },

    // ---- REGISTRATION ----
    // yeh ek array hai jismein registered members ke ObjectIds hain
    // embed kyun nahi kiya poora user? kyunki ek event mein 500 log aa sakte hain
    // itna data User document ke andar dalna document ko bahut bada kar dega
    // isliye sirf unka _id store karte hain, baaki details populate() se laate hain
    // NOTE: agar events bahut bade ho jaayein (10,000+ registrations)
    //       toh future mein isko ek alag Registrations collection mein move karenge

    registeredMembers: [
      {
        type: mongoose.Schema.Types.ObjectId, // fixed — ObjectId, not ObjectID
        ref: "User",
      },
    ],

    maxCapacity: {
      type: Number,
      default: null, // null matlab unlimited — koi limit nahi
    },

    // ---- EVENT STATUS ----
    // event ka lifecycle track karta hai
    // draft → published → ongoing → completed
    //                   ↘ cancelled (kabhi bhi ho sakta hai)

    status: {
      type: String,
      enum: ["draft", "published", "ongoing", "completed", "cancelled"],
      default: "draft", // naya event hamesha draft se start hota hai
    },

    // ---- MEDIA AND FILES ----
    // cloudinary URLs store karte hain yahan
    // actual file MongoDB mein nahi hoti — sirf uska link hota hai

    thumbnail: { type: String, default: "" },  // event ka cover image URL
    attachments: [{ type: String }],           // PDFs, slides etc ke URLs ka array

    // ---- TAGS ----
    // filtering ke liye use hoti hain — jaise "javascript", "web", "AI"
    // member filter kar sakta hai apni interest ke hisaab se

    tags: [{ type: String }],

    // ---- VISIBILITY ----
    // true  = public website pe dikhega (bina login ke)
    // false = sirf members ko dikhega dashboard mein

    isPublic: { type: Boolean, default: true },
  },

  {
    // timestamps: true — Mongoose automatically createdAt aur updatedAt add karta hai
    // yeh hamesha lagao — kabhi na kabhi kaam aata hai
    timestamps: true,
  }
)

// ---- INDEXES ----
// index lagane se query fast hoti hai
// bina index ke MongoDB poora collection scan karta hai — slow aur expensive
// index ke saath seedha wahi document milta hai — fast

eventSchema.index({ status: 1, startDate: -1 })
// status + startDate compound index — upcoming events list ke liye
// jab koi puchhe "sab published events dikhao, naye pehle" — yeh index use hoga

eventSchema.index({ tags: 1 })
// tag se filter karne ke liye — "React wale events dikhao"

eventSchema.index({ createdBy: 1 })
// ek core member ke banaye saare events dhundhne ke liye

const Event = mongoose.model("Event", eventSchema)

module.exports = Event