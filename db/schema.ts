import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
export const entries = sqliteTable("entries", {
 id:text("id").primaryKey(),kind:text("kind").notNull(),title:text("title").notNull(),body:text("body").notNull().default(""),status:integer("status").notNull().default(0),date:text("date").notNull().default(""),url:text("url").notNull().default(""),amount:real("amount").notNull().default(0),priority:text("priority").notNull().default("normal"),created:text("created").notNull(),
});
export const privateNotes=sqliteTable("private_notes",{
 userId:text("user_id").primaryKey(),
 version:integer("version").notNull(),
 salt:text("salt").notNull(),
 iv:text("iv").notNull(),
 ciphertext:text("ciphertext").notNull(),
 revision:integer("revision").notNull().default(1),
 updated:text("updated").notNull(),
});
