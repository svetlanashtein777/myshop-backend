const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// 📌 Получить все товары
router.get("/", async (req, res) => {
    try {
        console.log("📢 GET /api/products вызван!");
        const products = await Product.find();
        console.log("📦 Найденные товары:", products);
        res.json(products);
    } catch (error) {
        console.error("❌ Ошибка при получении товаров:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// 📌 Добавить новый товар
router.post("/", async (req, res) => {
    try {
        console.log("📢 POST /api/products вызван!", req.body);
        const { name, price, image, description } = req.body;

        // 🛑 Проверка обязательных полей
        if (!name || !price || !image || !description) {
            return res.status(400).json({ message: "Все поля (name, price, image, description) обязательны" });
        }

        // 🛑 Проверка, что цена - число
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({ message: "Цена должна быть положительным числом" });
        }

        const product = new Product({ name, price, image, description });
        const newProduct = await product.save();

        console.log("✅ Новый товар добавлен:", newProduct);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("❌ Ошибка при добавлении товара:", error);
        res.status(500).json({ message: "Ошибка при создании товара" });
    }
});

module.exports = router;
