/**
 * Home page
 * Displays user dashboard or admin statistics.
 * Props:
 * currentUser: object with logged-in user info
 * onLogout: callback to handle user logout
 * Fetches workouts, exercise stats, active membership for users,
 * and admin statistics for admin users.
 */

import React, { useEffect, useState } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import MessageModal from "../components/messagemodal/MessageModal";
import classes from "./home.module.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Home({ onLogout, currentUser }) {
  const [userWorkouts, setUserWorkouts] = useState([]);
  const [exerciseStats, setExerciseStats] = useState([]);
  const [message, setMessage] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [activeMembership, setActiveMembership] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const isAdmin = currentUser?.name?.toLowerCase() === "admin";

  const MONTH_NAMES = [
    "ינואר",
    "פברואר",
    "מרץ",
    "אפריל",
    "מאי",
    "יוני",
    "יולי",
    "אוגוסט",
    "ספטמבר",
    "אוקטובר",
    "נובמבר",
    "דצמבר",
  ];

  // Fetch user or admin data when component mounts or currentUser changes
  useEffect(() => {
    if (!currentUser?.id) return;

    if (isAdmin) {
      // Fetch statistics for admin dashboard
      const fetchAdminStats = async () => {
        try {
          const res = await fetch("http://localhost:3002/api/admin-stats");
          if (!res.ok) throw new Error("Failed to fetch admin stats");
          const data = await res.json();
          setAdminStats(data);
        } catch (err) {
          console.error("Failed to fetch admin stats:", err);
        }
      };
      fetchAdminStats();
    } else {
      // Fetch the workouts for the current user
      const fetchUserWorkouts = async () => {
        try {
          const res = await fetch(
            `http://localhost:3002/api/user-workouts?user_id=${currentUser.id}`
          );
          if (!res.ok) throw new Error("Failed to fetch workouts");
          const data = await res.json();
          setUserWorkouts(data);
        } catch {
          setUserWorkouts([]);
        }
      };

      // Fetch exercise statistics for the current user
      const fetchStats = async () => {
        try {
          const res = await fetch(
            `http://localhost:3002/api/workout-stats/exercise-stats?user_id=${currentUser.id}`
          );
          if (!res.ok) throw new Error("Failed to fetch stats");
          const data = await res.json();
          setExerciseStats(data);
        } catch {
          setExerciseStats([]);
        }
      };

      // Fetch the active membership for the current user
      const fetchMembership = async () => {
        try {
          const res = await fetch(
            `http://localhost:3002/api/purchases/active-membership?user_id=${currentUser.id}`
          );
          if (!res.ok) throw new Error("Failed to fetch membership");
          const data = await res.json();
          setActiveMembership(data);
        } catch {
          setActiveMembership(null);
        }
      };

      fetchMembership();
      fetchUserWorkouts();
      fetchStats();
    }
  }, [currentUser, isAdmin]);

  // Fetch exercise stats when selectedMonth changes
  useEffect(() => {
    if (!currentUser?.id || isAdmin) return;

    const fetchStatsByMonth = async () => {
      try {
        let url = `http://localhost:3002/api/workout-stats/exercise-stats?user_id=${currentUser.id}`;
        if (selectedMonth) {
          url += `&month=${selectedMonth}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setExerciseStats(data);
      } catch (err) {
        console.error(err);
        setExerciseStats([]);
      }
    };

    fetchStatsByMonth();
  }, [selectedMonth, currentUser, isAdmin]);

  // Convert a date string and optional time string into a local Date object
  function makeLocalDate(dateString, timeString = "00:00") {
    const [year, month, day] = dateString.split("-").map(Number);
    const [hours, minutes] = timeString.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  }

  // Format ISO date string to DD-MM-YYYY format
  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  // Check if a workout is in the past
  const isPastWorkout = (workoutDate, workoutTime) => {
    const workoutDateTime = makeLocalDate(workoutDate, workoutTime);
    return workoutDateTime <= new Date();
  };

  // Triggered when user clicks the cancel button for a workout
  const handleCancelClick = (id, workoutDate, workoutTime) => {
    setConfirmCancel({ id, workoutDate, workoutTime });
  };

  // Confirm and cancel the selected workout
  const confirmCancelWorkout = async () => {
    if (!confirmCancel) return;

    const { id, workoutDate, workoutTime } = confirmCancel;
    const workoutDateTime = makeLocalDate(workoutDate, workoutTime);

    if (workoutDateTime <= new Date()) {
      setMessage("לא ניתן לבטל אימון שכבר עבר.");
      setConfirmCancel(null);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3002/api/user-workouts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setUserWorkouts((prev) => prev.filter((w) => w.id !== id));
      setMessage("האימון בוטל בהצלחה.");
    } catch {
      setMessage("שגיאה בביטול האימון.");
    }

    setConfirmCancel(null);
  };

  // Determine maximum workouts allowed for the active membership
  let maxWorkouts = 0;
  if (activeMembership) {
    const membershipName = (
      activeMembership.name ||
      activeMembership.membership_name ||
      ""
    )
      .trim()
      .toLowerCase();

    switch (membershipName) {
      case "basic":
        maxWorkouts = 1;
        break;
      case "standard":
        maxWorkouts = 2;
        break;
      case "premium":
        maxWorkouts = 3;
        break;
      default:
        maxWorkouts = 0;
    }
  }

  // Get start and end dates of the current week
  const getCurrentWeekRange = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
  };

  const { startOfWeek, endOfWeek } = getCurrentWeekRange();

  // Filter workouts for the current week
  const currentWeekWorkouts = userWorkouts.filter((w) => {
    const workoutDateTime = makeLocalDate(w.workout_date, w.workout_time);
    return activeMembership
      ? workoutDateTime >= startOfWeek && workoutDateTime <= endOfWeek
      : false;
  });

  const registeredWorkoutsCount = currentWeekWorkouts.length;

  // Return the Hebrew day name for a given date string
  function getDayName(dateString) {
    const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי"];
    const date = new Date(dateString);
    const dayIndex = date.getDay();
    return dayIndex === 6 ? "" : days[dayIndex];
  }

  // Compute filtered monthly income data and Y-axis ticks (every ₪500)
  const filteredMonthlyIncome = (adminStats?.monthly_income || [])
    .map((m) => {
      const [year, month] = m.month.split("-");
      return {
        ...m,
        label: `${MONTH_NAMES[Number(month) - 1]} ${year}`,
        monthNum: Number(month),
      };
    })
    .filter((m) => !selectedMonth || m.monthNum === selectedMonth);

  const maxMonthlyIncome = Math.max(
    ...filteredMonthlyIncome.map((m) => Number(m.total_income)),
    0
  );
  const yAxisMax = Math.ceil((maxMonthlyIncome * 1.2) / 500) * 500;
  const yAxisTicks = Array.from({ length: yAxisMax / 500 + 1 }, (_, i) => i * 500);

  return (
    <div className={classes.container}>
      <Header />
      <NavBar currentUser={currentUser} />

      <button onClick={onLogout} className={classes.logoutButton}>
        התנתקות
      </button>

      <main className={classes.main}>
        {isAdmin && adminStats && (
          <div className={classes.statsContainer}>
            <h2 className={classes.statsTitle}>סטטיסטיקות</h2>

            <div className={classes.statsCards}>
              <div className={classes.statCard}>
                <span className={classes.statNumber}>{adminStats.total_users}</span>
                <span className={classes.statLabel}>סך כל המשתמשים</span>
              </div>
              <div className={classes.statCard}>
                <span className={classes.statNumber}>{adminStats.total_workouts}</span>
                <span className={classes.statLabel}>סך כל האימונים</span>
              </div>
              <div className={classes.statCard}>
                <span className={classes.statNumber}>
                  {adminStats.most_popular_day
                    ? getDayName(adminStats.most_popular_day) || "אין"
                    : "אין"}
                </span>
                <span className={classes.statLabel}>היום הפופולרי ביותר</span>
              </div>
              <div className={classes.statCard}>
                <span className={classes.statNumber}>
                  {adminStats.most_popular_time
                    ? adminStats.most_popular_time.slice(0, 5)
                    : "אין"}
                </span>
                <span className={classes.statLabel}>השעה הפופולרית ביותר</span>
              </div>
            </div>

            <h3 className={classes.chartTitle}>מנויים פעילים לפי סוג</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={adminStats.memberships}
                  dataKey="active_count"
                  nameKey="membership_name"
                  cx="50%"
                  cy="45%"
                  outerRadius={100}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    if (percent === 0) return null;
                    return (
                      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className={classes.pieLabel}>
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {adminStats.memberships.map((entry, index) => (
                    <Cell key={index} fill={`var(--pie-color-${index % 4})`} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>

            {adminStats.monthly_income?.length > 0 && (
              <>
                <h3 className={classes.chartTitle}>הכנסה חודשית</h3>
                <label className={classes.filterLabel}>
                  סנן לפי חודש:
                  <select
                    className={classes.filterSelect}
                    value={selectedMonth || ""}
                    onChange={(e) =>
                      setSelectedMonth(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  >
                    <option value="">כל החודשים</option>
                    {MONTH_NAMES.map((monthName, index) => (
                      <option key={index} value={index + 1}>
                        {monthName}
                      </option>
                    ))}
                  </select>
                </label>

                <ResponsiveContainer width="100%" height={340}>
                  <BarChart
                    data={filteredMonthlyIncome}
                    margin={{ top: 40, right: 30, left: 60, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="label"
                      interval={0}
                      tick={{ className: classes.axisTick }}
                      height={50}
                    />
                    <YAxis
                      tickFormatter={(v) => Number(v).toLocaleString()}
                      tick={{ className: classes.axisTick, dx: -8 }}
                      width={70}
                      domain={[0, yAxisMax]}
                      ticks={yAxisTicks}
                    />
                    <Bar
                      dataKey="total_income"
                      name="הכנסה"
                      fill="var(--chart-primary)"
                      radius={[6, 6, 0, 0]}
                      label={{
                        position: "top",
                        formatter: (v) => Number(v).toLocaleString(),
                        className: classes.barLabel,
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        )}

        {!isAdmin && (
          <div className={classes.userWorkouts}>
            <div className={classes.membershipInfo}>
              <p className={classes.membershipTitle}>
                <span className={classes.label}>מנוי פעיל: </span>
                <span className={classes.value}>
                  {activeMembership
                    ? activeMembership.name || activeMembership.membership_name
                    : "אין מנוי פעיל כרגע"}
                </span>
              </p>

              {activeMembership && (
                <p className={classes.membershipTitle}>
                  <span className={classes.label}>תאריך סיום: </span>
                  <span className={classes.value}>
                    {formatDate(
                      activeMembership.new_end_date || activeMembership.end_date
                    )}
                  </span>
                </p>
              )}
            </div>

            {activeMembership && maxWorkouts > 0 && (
              <>
                <h3 className={classes.workoutsTitle}>האימונים שלך השבוע:</h3>
                <p>
                  אימונים שנרשמת אליהם: {maxWorkouts} /{" "}
                  {registeredWorkoutsCount}
                </p>
                {registeredWorkoutsCount === maxWorkouts && (
                  <p>מומשו כל ההרשמות לשבוע</p>
                )}

                <ul className={classes.workoutList}>
                  {currentWeekWorkouts.map((w) => {
                    const past = isPastWorkout(w.workout_date, w.workout_time);
                    return (
                      <li
                        key={w.id}
                        className={`${classes.workoutItem} ${past ? classes.workoutItemPast : ""}`}
                      >
                        אימון בתאריך {formatDate(w.workout_date)} בשעה{" "}
                        {w.workout_time}
                        {!past && (
                          <button
                            onClick={() =>
                              handleCancelClick(
                                w.id,
                                w.workout_date,
                                w.workout_time
                              )
                            }
                            className={classes.cancelButton}
                            type="button"
                          >
                            ביטול
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            <div className={classes.statsContainer}>
              <h3 className={classes.chartTitle}>סטטיסטיקות תרגילים</h3>
              <label className={classes.filterLabel}>
                סנן לפי חודש:
                <select
                  className={classes.filterSelect}
                  value={selectedMonth || ""}
                  onChange={(e) =>
                    setSelectedMonth(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                >
                  <option value="">כל החודשים</option>
                  {MONTH_NAMES.map((monthName, index) => (
                    <option key={index} value={index + 1}>
                      {monthName}
                    </option>
                  ))}
                </select>
              </label>

              {exerciseStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={exerciseStats.map((ex) => ({
                      ...ex,
                      avg_repetitions: Math.round(ex.avg_repetitions),
                    }))}
                    margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="exercise"
                      interval={0}
                      tick={{ className: classes.axisTick }}
                      height={50}
                    />
                    <YAxis tick={{ className: classes.axisTick }} width={60} tickMargin={16} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="total_sessions" name='סה"כ אימונים' fill="var(--chart-primary)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avg_repetitions" name="ממוצע חזרות" fill="var(--chart-secondary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>אין נתונים להצגה</p>
              )}
            </div>
          </div>
        )}

        {confirmCancel && (
          <MessageModal
            message={`בטוח שברצונך לבטל את האימון בתאריך ${formatDate(
              confirmCancel.workoutDate
            )} בשעה ${confirmCancel.workoutTime}?`}
            type="warning"
            onClose={() => setConfirmCancel(null)}
            onConfirm={confirmCancelWorkout}
            confirmText="כן"
            cancelText="ביטול"
          />
        )}

        {message && (
          <MessageModal
            message={message}
            type={message.includes("שגיאה") ? "error" : "info"}
            onClose={() => setMessage("")}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
