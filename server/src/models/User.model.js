const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// User schema defines the shape of every user document in MongoDB
// think of this like a blueprint — every user follows this structure
const userSchema = new mongoose.Schema(
  {
    // ---- IDENTITY ----

    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,           // removes accidental spaces at start and end
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,         // MongoDB creates an index on this automatically
      lowercase: true,      // always store as lowercase so "USER@gmail.com" and "user@gmail.com" are treated as same
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,        // never return password in any query response by default
                            // this is a security rule — you have to explicitly ask for it
    },

    // ---- ROLE AND STATUS ----

    role: {
      type: String,
      enum: ['public', 'member', 'core', 'admin'], // only these 4 values allowed
      default: 'member',   // every new user starts as member
    },

    isApproved: {
      type: Boolean,
      default: false,      // new users wait for core team approval before accessing member portal
    },

    isActive: {
      type: Boolean,
      default: true,       // soft delete flag — we never delete users from database
                           // if isActive is false, user is treated as deleted
    },

    // ---- PROFILE (embedded) ----
    // profile is embedded because:
    // 1. it is small — only a few fields
    // 2. it is always needed when we load a user
    // 3. it belongs to only this user, not shared
    // 4. it will never grow into hundreds of items

    profile: {
      bio: { type: String, maxlength: 200, default: '' },
      avatar: { type: String, default: '' },          // stores cloudinary image URL
      phone: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      codingPlatforms: [{ type: String }],            // e.g. ['leetcode', 'codeforces']
      skills: [{ type: String }],                     // e.g. ['React', 'Node.js']
      batch: { type: String, default: '' },           // e.g. '2023-2027'
      enrollmentNumber: { type: String, default: '' },// e.g. '0805CS231048'
      department: { type: String, default: '' },      // e.g. 'Computer Science'
    },

    // ---- INTEGRITY SCORE ----
    // single number, not a list — safe to embed directly on user
    // starts at 100, decreases when user violates test rules
    // used in assessment system to flag suspicious behaviour

    integrityScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },

    // ---- SECURITY FIELDS ----
    // these fields support JWT invalidation and password reset flow

    lastLogin: {
      type: Date,           // updated every time user logs in successfully
    },

    passwordChangedAt: {
      type: Date,           // when password was last changed
                            // used to check if a JWT was issued before this date
                            // if yes — that token is invalid even if not expired
    },

    passwordResetToken: {
      type: String,
      select: false,        // hidden from all queries — only used internally
    },

    passwordResetExpires: {
      type: Date,
      select: false,        // reset link expires after some time (e.g. 10 mins)
    },
  },

  {
    timestamps: true,       // auto adds createdAt and updatedAt to every document
    toJSON: { virtuals: true },   // include virtual fields when sending JSON response
    toObject: { virtuals: true }, // include virtual fields when converting to object
  }
)

// ---- INDEXES ----
// indexes make queries faster — without them MongoDB reads every single document
// think of it like a book index — you jump directly to the page instead of reading whole book

userSchema.index({ role: 1 })         // used when admin filters users by role
userSchema.index({ isApproved: 1 })   // used when core team views pending join requests
userSchema.index({ createdAt: -1 })   // used when sorting users by newest first

// ---- PRE-SAVE HOOK ----
// this runs automatically before every .save() call
// we use it to hash the password before it touches the database

userSchema.pre('save', async function (next) {
  // if password field was not changed, skip hashing
  // this matters when you update name or bio — you don't want to re-hash the existing password
  if (!this.isModified('password')) return next()

  // hash the password with cost factor 12
  // higher number = more secure but slower — 12 is the industry standard balance
  this.password = await bcrypt.hash(this.password, 12)

  next()
})

// ---- INSTANCE METHODS ----
// these are functions available on every user document
// we put business logic here instead of in controllers — keeps code clean

// check if the password entered during login matches the stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  // note: this.password is not available by default because select:false
  // the auth service must explicitly select it using .select('+password')
  return await bcrypt.compare(candidatePassword, this.password)
}

// check if password was changed after a JWT token was issued
// if yes — that token should be rejected even if it hasn't expired yet
userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    // convert passwordChangedAt to seconds to match JWT timestamp format
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000)

    // if token was issued before password change — token is no longer valid
    return jwtTimestamp < changedTimestamp
  }

  // password was never changed — token is fine
  return false
}

const User = mongoose.model('User', userSchema)

module.exports = User