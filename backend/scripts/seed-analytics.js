
import { User, Product, Order, OrderItem, Category } from '../src/models/index.js';
import db from '../src/config/database.js';

const getRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const seedAnalytics = async () => {
    try {
        console.log('Seeding analytics data...');

        // 1. Ensure Categories
        let category = await Category.findOne();
        if (!category) {
            category = await Category.create({ name: 'Electronics', slug: 'electronics' });
        }

        // 2. Ensure Products
        let products = await Product.findAll();
        if (products.length < 5) {
            for (let i = 0; i < 5; i++) {
                await Product.create({
                    name: `Analytics Product ${i}`,
                    description: 'Test product for analytics',
                    price: Math.floor(Math.random() * 1000) + 50,
                    stock: 100,
                    categoryId: category.id,
                    images: ['https://placehold.co/400'],
                    weight: 0.5
                });
            }
            products = await Product.findAll();
        }

        // 3. Ensure User
        let user = await User.findOne();
        if (!user) {
            user = await User.create({
                email: 'admin@example.com',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                clerkId: 'user_analytics_test' // Fake clerk ID if needed
            });
        }

        // 4. Create 50 Orders in the last 30 days
        const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        const paymentStatuses = ['pending', 'paid', 'failed'];

        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        for (let i = 0; i < 50; i++) {
            const orderDate = getRandomDate(thirtyDaysAgo, today);
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const paymentStatus = status === 'cancelled' ? 'pending' : 'paid';

            // Select random products for this order
            const orderProducts = [];
            const numItems = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
            let orderTotal = 0;

            for (let j = 0; j < numItems; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 2) + 1;
                orderProducts.push({ product, quantity });
                orderTotal += product.price * quantity;
            }

            const order = await Order.create({
                userId: user.id,
                status: status,
                paymentStatus: paymentStatus,
                total: orderTotal,
                createdAt: orderDate,
                updatedAt: orderDate
            });

            // Create Order Items
            for (const item of orderProducts) {
                await OrderItem.create({
                    orderId: order.id,
                    productId: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price,
                    createdAt: orderDate,
                    updatedAt: orderDate
                });
            }
        }

        console.log('Analytics data seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding analytics:', error);
        process.exit(1);
    }
};

seedAnalytics();
