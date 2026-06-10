const mongoose = require("mongoose")

// questionSchema — ek single question ka structure
// ye alag schema hai jo testSchema ke andar embed hoga
// embed isliye kiya kyunki:
// 1. questions sirf ek test ke saath belong karte hain, kisi aur ke saath share nahi hote
// 2. test load karte waqt hamesha questions bhi chahiye hote hain — alag query nahi chahiye
// 3. ek test mein questions ki count bounded hai (100-200 max), unlimited nahi grow karegi
const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
    },

    questionType: {
      type: String,
      enum: ["mcq", "coding", "short_answer"],
      required: true,
    },

    // only MCQ questions ke liye options honge
    // coding aur short_answer ke liye ye empty array rahega
    options: [{ type: String }],

    // select: false — OWASP A01 aur A04
    // test ke dauraan frontend ko correctAnswer kabhi nahi milna chahiye
    // agar select: false nahi hota toh student DevTools mein network tab khol ke
    // saare answers dekh sakta tha — pura assessment system fail ho jaata
    correctAnswer: {
      type: String,
      select: false,
    },

    marks: {
      type: Number,
      default: 1, // har question ka default marks 1 hai
    },

    // optional — test complete hone ke baad explanation show ki jaati hai
    explanation: { type: String },
  },
  {
    // _id: true — har question ka apna unique ID hoga
    // submission mein answers store karte waqt questionId key ki tarah use hoga
    // agar _id: false hota toh submission ke time answer ko question se match karna mushkil hota
    _id: true,
  }
)

// testSchema — ek complete test ka blueprint
const testSchema = new mongoose.Schema(
  {
    // ---- BASIC INFO ----

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: { type: String },

    // ---- WHO CREATED THIS TEST (reference) ----
    // sirf User ka _id store kar rahe hain
    // naam chahiye toh populate() use karenge
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ---- QUESTIONS (embedded) ----
    // questionSchema ke array ke roop mein embed kiya
    // reference nahi kiya kyunki questions is test ke alawa kuch nahi hain
    // aur test open karte hi questions chahiye — extra query waste hogi
    questions: [questionSchema],

    // ---- TIMING ----
    // OWASP A04 — timer backend pe hona chahiye, browser pe nahi
    // agar sirf frontend pe timer hota toh student JS console se time badhaa sakta tha
    // backend startTime aur endTime ko truth maanta hai
    duration: { type: Number, required: true }, // minutes mein
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

    // ---- ACCESS CONTROL ----
    // null ya empty array = saare members le sakte hain test
    // specific IDs dene pe sirf wahi members access kar sakte hain
    allowedMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ---- STATUS LIFECYCLE ----
    // draft → scheduled → active → completed → archived
    // har stage ka matlab:
    // draft     = sirf creator dekh sakta hai, editing mode
    // scheduled = published but abhi start nahi hua
    // active    = test currently chal raha hai, submissions accept ho rahi hain
    // completed = endTime pass ho gaya, no more submissions
    // archived  = hide kar diya, dashboard pe nahi dikhega
    status: {
      type: String,
      enum: ["draft", "scheduled", "active", "completed", "archived"],
      default: "draft",
    },

    // ---- INTEGRITY SETTINGS ----
    // OWASP A04 — assessment integrity server side enforce hoti hai
    // ye settings define karti hain ki monitoring system kya kya check karega
    settings: {
      allowTabSwitch: { type: Boolean, default: false },
      requireFullscreen: { type: Boolean, default: true }, // fixed spelling
      maxViolations: { type: Number, default: 3 },         // itne violations ke baad auto-submit
      shuffleQuestions: { type: Boolean, default: true },  // fixed spelling
      shuffleOptions: { type: Boolean, default: true },    // fixed spelling
    },

    // pre-save hook se automatically calculate hoga
    // manually set karne ki zaroorat nahi
    totalMarks: { type: Number, default: 0 },
  },
  {
    timestamps: true, // createdAt aur updatedAt auto add hoga
  }
)

// ---- PRE-SAVE HOOK ----
// test save hone se pehle totalMarks automatically calculate karta hai
// isse ensure hota hai ki totalMarks hamesha questions ke saath sync mein hai
// manually galat value set nahi ho sakti
testSchema.pre("save", function (next) {
  if (this.questions && this.questions.length > 0) {
    this.totalMarks = this.questions.reduce((sum, q) => sum + q.marks, 0)
  } else {
    // edge case — agar questions empty hain toh 0 set karo, undefined mat rehne do
    this.totalMarks = 0
  }
  next()
})

// ---- INDEXES ----
testSchema.index({ status: 1 })       // active tests fetch karne ke liye
testSchema.index({ startTime: 1 })    // upcoming scheduled tests ke liye
testSchema.index({ createdBy: 1 })    // core member ke banaye tests dekhne ke liye

const Test = mongoose.model("Test", testSchema)

module.exports = Test