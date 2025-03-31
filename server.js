import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({ origin: "https://myfrontend.vercel.app" }));

// ✅ Проверка MONGO_URI перед подключением
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("❌ MONGO_URI не найден. Проверь .env файл!");
    process.exit(1);
}
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Подключено к MongoDB'))
    .catch(err => console.error('❌ Ошибка подключения:', err));

// ✅ Настройка Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ Настройка Multer для Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
        folder: "products",
        format: async () => "jpg",
        public_id: () => Date.now().toString()
    }
});
const upload = multer({ storage });

// ✅ Модель товара
const Product = mongoose.model('Product', new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true }
}));

// 📌 Корневой маршрут (проверка, что сервер работает)
app.get('/', (req, res) => {
    console.log("✅ Корневой маршрут вызван!");
    res.send("✅ Сервер работает!");
});

// 📌 Маршрут: Добавить товар (поддержка JSON и form-data)
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        console.log("📢 POST /api/products вызван!", req.body);
        const { name, price, image } = req.body;
        const uploadedImage = req.file ? req.file.path : image;

        if (!name || !price || !uploadedImage) {
            return res.status(400).json({ error: "Все поля (name, price, image) обязательны!" });
        }

        const newProduct = new Product({ name, price, image: uploadedImage });
        await newProduct.save();

        console.log("✅ Новый товар добавлен:", newProduct);
        res.status(201).json({ message: "Товар добавлен!", product: newProduct });
    } catch (error) {
        console.error("❌ Ошибка сервера:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// 📌 Маршрут: Получить все товары
app.get('/api/products', async (req, res) => {
    try {
        console.log("📢 GET /api/products вызван!");
        const products = await Product.find();
        console.log("📦 Найденные товары:", products);
        res.json(products);
    } catch (error) {
        console.error("❌ Ошибка при получении товаров:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// ✅ Запуск сервера (убрали '0.0.0.0' для Render)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
