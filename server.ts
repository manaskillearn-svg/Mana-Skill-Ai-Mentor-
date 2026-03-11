import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("mana_skill.db");

async function startServer() {
  // Initialize database
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      profile TEXT,
      roadmap TEXT,
      role TEXT DEFAULT 'user'
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Migration: Add role column if it doesn't exist
  try {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
    const hasRole = tableInfo.some(col => col.name === 'role');
    if (!hasRole) {
      db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
      console.log("Migration: Added 'role' column to users table");
    }
  } catch (err) {
    console.error("Migration error:", err);
  }

  // Create default admin if not exists
  const adminEmail = "admin@manaskill.com";
  const adminPassword = "adminpassword123";
  const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)").run(adminEmail, hashedPassword, "admin");
    console.log("Default admin created: admin@manaskill.com / adminpassword123");
  }

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

  // Middleware to verify admin
  const isAdmin = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(decoded.userId) as any;
      if (user && user.role === "admin") {
        req.user = user;
        next();
      } else {
        res.status(403).json({ error: "Forbidden: Admin access required" });
      }
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)");
      const result = stmt.run(email, hashedPassword);
      
      const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET);
      res.json({ token, user: { id: result.lastInsertRowid, email, role: 'user' } });
    } catch (error: any) {
      if (error.code === "SQLITE_CONSTRAINT") {
        return res.status(400).json({ error: "Email already exists" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email,
          role: user.role,
          profile: user.profile ? JSON.parse(user.profile) : null,
          roadmap: user.roadmap ? JSON.parse(user.roadmap) : null
        } 
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin Routes
  app.get("/api/admin/users", isAdmin, (req, res) => {
    const users = db.prepare("SELECT id, email, role, profile, roadmap FROM users").all();
    res.json(users.map((u: any) => ({
      ...u,
      profile: u.profile ? JSON.parse(u.profile) : null,
      roadmap: u.roadmap ? JSON.parse(u.roadmap) : null
    })));
  });

  app.put("/api/admin/users/:id", isAdmin, (req, res) => {
    const { id } = req.params;
    const { profile, roadmap, role } = req.body;
    try {
      db.prepare("UPDATE users SET profile = ?, roadmap = ?, role = ? WHERE id = ?")
        .run(JSON.stringify(profile), JSON.stringify(roadmap), role, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.delete("/api/admin/users/:id", isAdmin, (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // User Routes
  app.get("/api/user/me", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const user = db.prepare("SELECT id, email, role, profile, roadmap FROM users WHERE id = ?").get(decoded.userId) as any;
      
      if (!user) return res.status(404).json({ error: "User not found" });

      res.json({ 
        user: { 
          id: user.id, 
          email: user.email,
          role: user.role,
          profile: user.profile ? JSON.parse(user.profile) : null,
          roadmap: user.roadmap ? JSON.parse(user.roadmap) : null
        } 
      });
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // Global Roadmap Routes
  app.get("/api/global-roadmap", (req, res) => {
    const setting = db.prepare("SELECT value FROM settings WHERE key = 'global_roadmap'").get() as any;
    res.json({ roadmap: setting ? JSON.parse(setting.value) : null });
  });

  app.post("/api/global-roadmap", isAdmin, (req, res) => {
    const { roadmap } = req.body;
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('global_roadmap', ?)")
      .run(JSON.stringify(roadmap));
    res.json({ success: true });
  });

  app.post("/api/admin/users/apply-roadmap", isAdmin, (req, res) => {
    const { roadmap } = req.body;
    try {
      db.prepare("UPDATE users SET roadmap = ? WHERE role != 'admin'")
        .run(JSON.stringify(roadmap));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Apply failed" });
    }
  });

  // Sync Routes
  app.post("/api/user/sync", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const { profile, roadmap } = req.body;
      
      db.prepare("UPDATE users SET profile = ?, roadmap = ? WHERE id = ?")
        .run(JSON.stringify(profile), JSON.stringify(roadmap), decoded.userId);
      
      res.json({ success: true });
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Vite in middleware mode...");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        watch: {
          usePolling: true,
          interval: 100,
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware attached.");
  } else {
    console.log("Serving static files from dist...");
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

console.log("Initializing server...");
startServer().catch(err => {
  console.error("Failed to start server:", err);
});
