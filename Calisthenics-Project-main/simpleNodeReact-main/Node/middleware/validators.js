/**
 * Validation middleware using express-validator
 * Returns 400 with first error message in Hebrew
 */

const { body, param, validationResult } = require("express-validator");

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
const USERNAME_REGEX = /^[A-Za-z0-9]{2,}$/;

/** Middleware: return 400 with first validation error */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const first = errors.array()[0];
  return res.status(400).json({ error: first.msg });
}

// --- Users ---
const loginValidation = [
  body("username")
    .trim()
    .matches(USERNAME_REGEX)
    .withMessage("שם משתמש חייב להכיל לפחות 2 תווים (אותיות/ספרות)"),
  body("password")
    .matches(PASSWORD_REGEX)
    .withMessage("סיסמה: 8-16 תווים, לפחות אות אחת וספרה אחת"),
];

const registerValidation = [
  body("username")
    .trim()
    .matches(USERNAME_REGEX)
    .withMessage("שם משתמש חייב להכיל לפחות 2 תווים (אותיות/ספרות)"),
  body("password")
    .matches(PASSWORD_REGEX)
    .withMessage("סיסמה: 8-16 תווים, לפחות אות אחת וספרה אחת"),
];

const forgotPasswordValidation = [
  body("email").isEmail().withMessage("אימייל לא תקין"),
];

const resetPasswordValidation = [
  body("token").notEmpty().withMessage("חסר טוקן איפוס"),
  body("newPassword")
    .matches(PASSWORD_REGEX)
    .withMessage("סיסמה חדשה: 8-16 תווים, לפחות אות וספרה"),
];

const forgotUsernameValidation = [
  body("email").isEmail().withMessage("אימייל לא תקין"),
];

const profileValidation = [
  body("firstName").trim().notEmpty().withMessage("שם פרטי חובה"),
  body("lastName").trim().notEmpty().withMessage("שם משפחה חובה"),
  body("phone")
    .trim()
    .matches(/^\d{10}$/)
    .withMessage("טלפון חייב להכיל 10 ספרות בדיוק"),
  body("email").isEmail().withMessage("אימייל לא תקין"),
  body("birthDate").optional().isDate().withMessage("תאריך לידה לא תקין"),
  body("gender").notEmpty().withMessage("מין חובה"),
];

const passwordValidation = [
  body("currentPassword").notEmpty().withMessage("סיסמה נוכחית חובה"),
  body("newPassword")
    .matches(PASSWORD_REGEX)
    .withMessage("סיסמה חדשה: 8-16 תווים, לפחות אות וספרה"),
];

// --- Workouts (admin) ---
const workoutPostValidation = [
  body("workout_date")
    .isDate()
    .withMessage("תאריך לא תקין"),
  body("workout_time")
    .matches(/^\d{1,2}:\d{2}$/)
    .withMessage("שעה לא תקינה (פורמט: HH:mm)"),
];

const workoutPutValidation = [
  param("id").isInt({ min: 1 }).withMessage("מזהה אימון לא תקין"),
  body("workout_time")
    .matches(/^\d{1,2}:\d{2}$/)
    .withMessage("שעה לא תקינה (פורמט: HH:mm)"),
];

// --- Membership ---
const membershipPostValidation = [
  body("name").trim().notEmpty().withMessage("שם מנוי חובה"),
  body("price").isFloat({ min: 0.01 }).withMessage("מחיר חייב להיות חיובי"),
  body("duration_days")
    .isInt({ min: 1 })
    .withMessage("מספר ימים חייב להיות מספר חיובי"),
  body("entry_count").optional().isInt({ min: 0 }).withMessage("מספר כניסות לא תקין"),
];

const membershipPutValidation = [
  param("id").isInt({ min: 1 }).withMessage("מזהה מנוי לא תקין"),
  body("name").trim().notEmpty().withMessage("שם מנוי חובה"),
  body("price").isFloat({ min: 0.01 }).withMessage("מחיר חייב להיות חיובי"),
  body("duration_days")
    .isInt({ min: 1 })
    .withMessage("מספר ימים חייב להיות מספר חיובי"),
  body("entry_count").optional().isInt({ min: 0 }).withMessage("מספר כניסות לא תקין"),
];

// --- User Workouts ---
const userWorkoutPostValidation = [
  body("workout_date")
    .isDate()
    .withMessage("תאריך לא תקין"),
  body("workout_time")
    .matches(/^\d{1,2}:\d{2}$/)
    .withMessage("שעה לא תקינה (פורמט: HH:mm)"),
  body("membership_name").trim().notEmpty().withMessage("סוג מנוי חובה"),
];

// --- Workout Exercises ---
const workoutExercisePostValidation = [
  body("exercise").trim().notEmpty().withMessage("שם תרגיל חובה"),
  body("repetitions")
    .isInt({ min: 0 })
    .withMessage("מספר חזרות חייב להיות מספר לא שלילי"),
  body("workout_date")
    .isDate()
    .withMessage("תאריך לא תקין"),
];

const workoutExercisePutValidation = [
  param("id").isInt({ min: 1 }).withMessage("מזהה תרגיל לא תקין"),
  body("exercise").trim().notEmpty().withMessage("שם תרגיל חובה"),
  body("repetitions")
    .isInt({ min: 0 })
    .withMessage("מספר חזרות חייב להיות מספר לא שלילי"),
  body("workout_date")
    .isDate()
    .withMessage("תאריך לא תקין"),
];

const idParamValidation = [
  param("id").isInt({ min: 1 }).withMessage("מזהה לא תקין"),
];

module.exports = {
  handleValidation,
  loginValidation,
  registerValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  forgotUsernameValidation,
  profileValidation,
  passwordValidation,
  workoutPostValidation,
  workoutPutValidation,
  membershipPostValidation,
  membershipPutValidation,
  userWorkoutPostValidation,
  workoutExercisePostValidation,
  workoutExercisePutValidation,
  idParamValidation,
};
