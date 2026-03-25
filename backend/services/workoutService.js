const pool = require("../db").promise();
const {
  sendEmail,
  isEmailConfigured,
} = require("../utils/sendEmail");
const logger = require("../utils/logger");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

function isSaturday(dateStr) {
  return new Date(dateStr).getDay() === 6;
}

/** DB / API time -> "HH:MM" */
function toHHMM(t) {
  if (t == null) return "";
  const s = String(t);
  const m = s.match(/(\d{1,2}):(\d{2})/);
  if (!m) return s.slice(0, 5);
  return `${m[1].padStart(2, "0")}:${m[2].padStart(2, "0")}`;
}

/** -> MySQL TIME 'HH:MM:SS' */
function normalizeMysqlTime(t) {
  const hm = toHHMM(t);
  const [h, m] = hm.split(":");
  return `${(h || "0").padStart(2, "0")}:${(m || "0").padStart(2, "0")}:00`;
}

/** workout_date from MySQL driver -> 'YYYY-MM-DD' */
function toMysqlDateString(d) {
  if (d == null) return "";
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}/.test(d)) {
    return d.match(/^\d{4}-\d{2}-\d{2}/)[0];
  }
  if (d instanceof Date && !Number.isNaN(d.getTime())) {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${day}`;
  }
  const s = String(d);
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : s;
}

class WorkoutService {
  constructor(workoutRepository, userWorkoutRepository) {
    this.repository = workoutRepository;
    this.userWorkoutRepository = userWorkoutRepository;
  }

  async getAll() {
    const workouts = await this.repository.getAll();
    return workouts.filter((w) => !isSaturday(w.workout_date));
  }

  async create(workout_date, workout_time) {
    if (isSaturday(workout_date)) {
      throw new AppError("לא ניתן ליצור אימון בשבת", 400);
    }

    const duplicate = await this.repository.existsAtSlot(workout_date, workout_time);
    if (duplicate) {
      throw new AppError("כבר קיים אימון בתאריך ושעה אלה", 409);
    }

    await this.repository.create(workout_date, workout_time);
    return { type: "success", text: "האימון נוסף בהצלחה" };
  }

  async updateTime(id, workout_time) {
    const workout = await this.repository.findById(id);
    if (!workout) {
      throw new AppError("האימון לא נמצא", 404);
    }

    if (isSaturday(workout.workout_date)) {
      throw new AppError("לא ניתן לעדכן אימון לשבת", 400);
    }

    const dateStr = toMysqlDateString(workout.workout_date);
    const newMysqlTime = normalizeMysqlTime(workout_time);
    const oldHHMM = toHHMM(workout.workout_time);
    const newHHMM = toHHMM(workout_time);

    if (oldHHMM === newHHMM) {
      return { type: "success", text: "האימון עודכן בהצלחה" };
    }

    const duplicate = await this.repository.existsAtSlot(
      dateStr,
      newMysqlTime,
      id
    );
    if (duplicate) {
      throw new AppError("כבר קיים אימון בשעה הזאת", 409);
    }

    const bookedUsers =
      await this.userWorkoutRepository.findUsersBookedAtSlot(dateStr, oldHHMM);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [wr] = await conn.query(
        "UPDATE workouts SET workout_time = ? WHERE workout_id = ?",
        [newMysqlTime, id]
      );
      if (wr.affectedRows === 0) {
        throw new AppError("האימון לא נמצא", 404);
      }
      await conn.query(
        `UPDATE user_workouts
         SET workout_time = ?
         WHERE workout_date = ?
           AND TIME_FORMAT(workout_time, '%H:%i') = ?`,
        [newMysqlTime, dateStr, oldHHMM]
      );
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      if (err instanceof AppError) throw err;
      logger.error("updateTime transaction failed", { err: err.message });
      throw new AppError("עדכון האימון נכשל", 500);
    } finally {
      conn.release();
    }

    this._notifyWorkoutTimeChange(bookedUsers, {
      dateStr,
      oldHHMM,
      newHHMM,
    }).catch((e) =>
      logger.error("Workout time-change emails failed", { err: e.message })
    );

    return { type: "success", text: "האימון עודכן בהצלחה" };
  }

  async _notifyWorkoutTimeChange(recipients, { dateStr, oldHHMM, newHHMM }) {
    if (!recipients?.length || !isEmailConfigured()) return;

    const formattedDate = new Date(`${dateStr}T12:00:00`).toLocaleDateString(
      "he-IL",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

    for (const row of recipients) {
      const email = row.email?.trim();
      if (!email) continue;
      const name = row.first_name?.trim() || "שלום";
      const html = `
      <div dir="rtl" style="text-align:right;font-family:Arial,sans-serif;color:#333;max-width:520px;">
        <h2 style="margin-top:0;">שינוי שעת אימון</h2>
        <p>${name},</p>
        <p>שעת האימון שאליו נרשמת עודכנה.</p>
        <p><b>תאריך:</b> ${formattedDate}</p>
        <p><b>שעה קודמת:</b> ${oldHHMM}</p>
        <p><b>שעה חדשה:</b> ${newHHMM}</p>
        <p style="color:#666;font-size:14px;">Calisthenics</p>
      </div>`;
      try {
        await sendEmail(
          email,
          "שינוי שעת אימון — Calisthenics",
          html
        );
      } catch (err) {
        logger.error("Workout time-change email skipped", {
          email,
          err: err.message,
        });
      }
    }
  }

  async deleteById(id) {
    const result = await this.repository.deleteById(id);
    if (result.affectedRows === 0) {
      throw new AppError("האימון לא נמצא", 404);
    }
    return { type: "success", text: "האימון נמחק בהצלחה" };
  }
}

module.exports = { WorkoutService, AppError };
