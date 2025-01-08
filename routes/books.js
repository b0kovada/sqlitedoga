import express from "express";
import { dbQuery, dbRun } from "../database.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const books = await dbQuery("SELECT * FROM books;");
        res.status(200).json(books);
    } catch (err) {
        next(err);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const [book] = await dbQuery("SELECT * FROM books WHERE id = ?;", [req.params.id]);
        if (!book) return res.status(404).json({ message: "book not found" });
        res.status(200).json(book);
    } catch (err) {
        next(err);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const result = await dbRun("INSERT INTO books (title, author, description, year) VALUES (?, ?, ?, ?);", [req.body.title, req.body.author, req.body.description, req.body.year]);
        res.status(201).json({ id: result.lastID, ...req.body });
    } catch (err) {
        next(err);
    }
});

router.put("/:id", async (req, res, next) => {
    try {
        const [book] = await dbQuery("SELECT * FROM books WHERE id = ?;", [req.params.id]);
        if (!book) return res.status(404).json({ message: "book not found" });

        await dbRun("UPDATE books SET title=?, author=?, description = ?, year=? WHERE id = ?;", 
            [   req.body.title || book.title,
                req.body.author || book.author,
                req.body.description || book.description,
                req.body.year || book.year,
                req.params.id]);
        res.status(200).json({  id: req.params.id,
                                title: req.body.title ||book.title,
                                author: req.body.author || book.author, 
                                description: req.body.description || book.description,
                                price: req.body.year || book.year});
    } catch (err) {
        next(err);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const [book] = await dbQuery("SELECT * FROM books WHERE id = ?;", [req.params.id]);
        if (!book) return res.status(404).json({ message: "book not found" });

        await dbRun("DELETE FROM books WHERE id = ?;", [req.params.id]);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
});

export default router;
