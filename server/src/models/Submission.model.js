const mongoose = require("mongoose")

// violationSchema — ek single integrity violation ka structure
// embed kiya hai kyunki:
// 1. violations sirf iss submission ke hain, kisi aur ke saath share nahi hote
// 2. submission load karte waqt violations bhi chahiye hote hain
// 3. max violations bounded hai (maxViolations setting se — default 3)
const violationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["tab_switch", "fullscreen_exit", "copy_paste", "right_click"],
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now, // exactly kab violation hua — evidence ke liye
    },

    count: { type: Number, default: 1 },
  },
  {
    _id: false, // violations ko apna ID nahi chahiye — parent submission ka ID kaafi hai
  }
)

// submissionSchema — ek student ka ek test attempt
// WHY alag collection: ek user ke 50+ submissions ho sakte hain time ke saath
// agar User document ke andar embed karte toh document unlimited grow karta
// alag collection mein rakha — User document chota rehta hai
const submissionSchema = new mongoose.Schema(
  {
    // ---- REFERENCES ----
    // dono foreign keys — kis user ne kis test ka attempt kiya
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },

    // ---- ANSWERS (Map) ----
    // { questionId: selectedAnswer } format mein store hoga
    // Map isliye use kiya array ki jagah:
    // Array approach: answer dhundhne ke liye poora array loop karna padta — O(n)
    // Map approach: answers.get(questionId) — seedha mil jaata — O(1)
    // evaluation ke waqt 50 questions ke liye 50 lookups hote hain
    // Map ke saath ye 50x faster hai array se
    // OWASP A04 — evaluation backend pe hogi, frontend pe nahi
    answers: {
      type: Map,
      of: String, // MCQ ka option bhi string, coding snippet bhi string
    },

    // ---- RESULT ----
    // ye fields tab fill honge jab backend evaluation karega submission ke baad
    score: { type: Number, default: 0 },
    totalMarks: { type: Number },    // Test se copy kiya jaata hai submission time pe
    percentage: { type: Number },
    isPassed: { type: Boolean },

    // ---- INTEGRITY DATA ----
    // OWASP A09 — violations log karna zaroori hai monitoring ke liye
    violations: [violationSchema],

    // pre-save hook mein violations.length se sync hoga automatically
    violationCount: { type: Number, default: 0 },

    // 100 se start, har violation pe kam hoga
    // User.integrityScore bhi update hoga jab submission evaluate ho
    integrityScore: { type: Number, default: 100 }, // fixed spelling

    // ---- TIMING ----
    startedAt: { type: Date },       // jab student ne test start kiya
    submittedAt: { type: Date },     // jab submit hua — manually ya auto
    timeTaken: { type: Number },     // seconds mein — submittedAt - startedAt

    // ---- STATUS LIFECYCLE ----
    // in_progress  = test chal raha hai, student answers de raha hai
    // submitted    = student ne khud submit kiya
    // auto_submitted = violations ya time expire hone pe backend ne submit kiya
    // evaluated    = score calculate ho gaya, result ready hai
    status: {
      type: String,
      enum: ["in_progress", "submitted", "auto_submitted", "evaluated"],
      default: "in_progress",
    },

    // agar true hai toh admin ko flag dikhega review ke liye
    isAutoSubmitted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

// ---- PRE-SAVE HOOK ----
// violations array aur violationCount ko sync rakhta hai
// agar directly array mein push karo aur count bhool jao — mismatch nahi hoga
submissionSchema.pre("save", function (next) {
  if (this.violations) {
    this.violationCount = this.violations.length
  }
  next()
})

// ---- INDEXES ----

// MOST IMPORTANT index — compound + unique
// userId + testId dono saath filter hote hain aksar
// unique: true — ek user ek test sirf ek baar de sakta hai
// database level pe enforce ho raha hai — application code bypass nahi kar sakta
// OWASP A01 — data integrity at database level
submissionSchema.index({ userId: 1, testId: 1 }, { unique: true })

// leaderboard ke liye — ek test ke saare submissions score ke order mein
submissionSchema.index({ testId: 1, score: -1 })

const Submission = mongoose.model("Submission", submissionSchema)

module.exports = Submission