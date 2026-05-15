const express = require("express");
const router = express.Router();
const db = require("./db");
const { requireLogin } = require("./middleware/requireLogin");

const createTableSql = `
  CREATE TABLE IF NOT EXISTS training_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    week_start DATE NOT NULL,
    plan_json JSON NOT NULL,
    repeat_future TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_week (user_id, week_start),
    INDEX idx_training_plans_user_week (user_id, week_start)
  )
`;

db.query(createTableSql, (err) => {
  if (err) {
    console.error("training_plans init error:", err);
  }
});

db.query("ALTER TABLE training_plans ADD COLUMN repeat_future TINYINT(1) NOT NULL DEFAULT 0", (err) => {
  if (err && err.code !== "ER_DUP_FIELDNAME") {
    console.error("training_plans repeat_future alter error:", err);
  }
});

function getDefaultPlan(weekStart) {
  return {
    weekStart,
    customBlocks: [],
    days: [
      { key: "monday", label: "Montag", status: "planned", blocks: [] },
      { key: "tuesday", label: "Dienstag", status: "planned", blocks: [] },
      { key: "wednesday", label: "Mittwoch", status: "planned", blocks: [] },
      { key: "thursday", label: "Donnerstag", status: "planned", blocks: [] },
      { key: "friday", label: "Freitag", status: "planned", blocks: [] },
      { key: "saturday", label: "Samstag", status: "planned", blocks: [] },
      { key: "sunday", label: "Sonntag", status: "planned", blocks: [] }
    ]
  };
}

function normalizePlan(rawPlan, weekStart) {
  const fallback = getDefaultPlan(weekStart);
  const plan = rawPlan && typeof rawPlan === "object" ? rawPlan : {};
  const days = Array.isArray(plan.days) ? plan.days : [];

  return {
    weekStart,
    customBlocks: Array.isArray(plan.customBlocks) ? plan.customBlocks.map((block) => ({
      id: String(block.id || `custom-${Date.now()}`),
      type: String(block.type || "custom"),
      title: String(block.title || "Training"),
      color: typeof block.color === "string" ? block.color : null
    })) : [],
    days: fallback.days.map((fallbackDay) => {
      const savedDay = days.find((day) => day.key === fallbackDay.key) || {};
      const seenBlocks = new Set();
      const blocks = Array.isArray(savedDay.blocks) ? savedDay.blocks.map((block) => ({
        id: String(block.id || `${fallbackDay.key}-${Date.now()}`),
        type: String(block.type || "custom"),
        title: String(block.title || "Training"),
        color: typeof block.color === "string" ? block.color : null
      })).filter((block) => {
        const key = `${block.type}:${block.title.trim().toLowerCase()}`;
        if (seenBlocks.has(key)) return false;
        seenBlocks.add(key);
        return true;
      }) : [];

      return {
        ...fallbackDay,
        status: savedDay.status === "skipped" ? "skipped" : "planned",
        blocks
      };
    })
  };
}

function isValidWeekStart(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

router.get("/", requireLogin, (req, res) => {
  const weekStart = req.query.weekStart;

  if (!isValidWeekStart(weekStart)) {
    return res.status(400).json({
      success: false,
      message: "Ungueltige Woche"
    });
  }

  db.query(
    "SELECT plan_json FROM training_plans WHERE user_id = ? AND week_start = ? LIMIT 1",
    [req.session.userId, weekStart],
    (err, results) => {
      if (err) {
        console.error("training_plans get error:", err);
        return res.status(500).json({
          success: false,
          message: "Serverfehler"
        });
      }

      if (results.length === 0) {
        return db.query(
          "SELECT plan_json FROM training_plans WHERE user_id = ? AND week_start < ? AND repeat_future = 1 ORDER BY week_start DESC LIMIT 1",
          [req.session.userId, weekStart],
          (templateErr, templateRows) => {
            if (templateErr) {
              console.error("training_plans template get error:", templateErr);
              return res.status(500).json({ success: false, message: "Serverfehler" });
            }

            if (templateRows.length === 0) {
              return res.json({ success: true, plan: getDefaultPlan(weekStart) });
            }

            const templatePlan = typeof templateRows[0].plan_json === "string"
              ? JSON.parse(templateRows[0].plan_json)
              : templateRows[0].plan_json;
            const normalizedTemplate = normalizePlan(templatePlan, weekStart);

            return db.query(
              `
                INSERT INTO training_plans (user_id, week_start, plan_json, repeat_future)
                VALUES (?, ?, ?, 0)
                ON DUPLICATE KEY UPDATE plan_json = VALUES(plan_json)
              `,
              [req.session.userId, weekStart, JSON.stringify(normalizedTemplate)],
              (insertErr) => {
                if (insertErr) {
                  console.error("training_plans template insert error:", insertErr);
                  return res.status(500).json({ success: false, message: "Serverfehler" });
                }

                return res.json({
                  success: true,
                  plan: normalizedTemplate
                });
              }
            );
          }
        );
      }

      const savedPlan = typeof results[0].plan_json === "string"
        ? JSON.parse(results[0].plan_json)
        : results[0].plan_json;

      return res.json({
        success: true,
        plan: normalizePlan(savedPlan, weekStart)
      });
    }
  );
});

router.put("/", requireLogin, (req, res) => {
  const { weekStart, plan, repeatFuture } = req.body;

  if (!isValidWeekStart(weekStart) || !plan || typeof plan !== "object") {
    return res.status(400).json({
      success: false,
      message: "Ungueltige Trainingsplandaten"
    });
  }

  const normalizedPlan = normalizePlan(plan, weekStart);

  db.query(
    `
      INSERT INTO training_plans (user_id, week_start, plan_json, repeat_future)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE plan_json = VALUES(plan_json), repeat_future = VALUES(repeat_future)
    `,
    [req.session.userId, weekStart, JSON.stringify(normalizedPlan), repeatFuture ? 1 : 0],
    (err) => {
      if (err) {
        console.error("training_plans save error:", err);
        return res.status(500).json({
          success: false,
          message: "Serverfehler"
        });
      }

      return res.json({
        success: true,
        plan: normalizedPlan
      });
    }
  );
});

module.exports = router;
