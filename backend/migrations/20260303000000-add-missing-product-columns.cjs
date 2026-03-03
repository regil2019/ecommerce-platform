'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableDescription = await queryInterface.describeTable('products');

        // Helper to add a column only if it doesn't exist
        const addColumnIfMissing = async (columnName, columnDef) => {
            if (!tableDescription[columnName]) {
                await queryInterface.addColumn('products', columnName, columnDef);
                console.log(`Added column: ${columnName}`);
            } else {
                console.log(`Column already exists, skipping: ${columnName}`);
            }
        };

        await addColumnIfMissing('is_active', {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        });

        await addColumnIfMissing('slug', {
            type: Sequelize.STRING(255),
            allowNull: true,
            // Note: UNIQUE added as a separate index below (TiDB doesn't support inline UNIQUE via addColumn)
        });

        // Add unique index for slug separately (TiDB Cloud restriction)
        try {
            const [indexes] = await queryInterface.sequelize.query(
                "SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'products_slug_unique'"
            );
            if (indexes.length === 0) {
                await queryInterface.addIndex('products', ['slug'], {
                    unique: true,
                    name: 'products_slug_unique',
                });
                console.log('Added unique index on slug');
            } else {
                console.log('Slug unique index already exists, skipping');
            }
        } catch (e) {
            console.warn('Could not add slug index:', e.message);
        }

        await addColumnIfMissing('short_description', {
            type: Sequelize.TEXT,
            allowNull: true,
        });

        await addColumnIfMissing('original_price', {
            type: Sequelize.FLOAT,
            allowNull: true,
        });

        await addColumnIfMissing('discount_percentage', {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        });

        await addColumnIfMissing('main_image', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });

        await addColumnIfMissing('sku', {
            type: Sequelize.STRING(50),
            allowNull: true,
        });

        await addColumnIfMissing('is_featured', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        });

        await addColumnIfMissing('dimensions', {
            type: Sequelize.STRING(100),
            allowNull: true,
        });

        await addColumnIfMissing('tags', {
            type: Sequelize.JSON,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        const columnsToRemove = [
            'is_active',
            'slug',
            'short_description',
            'original_price',
            'discount_percentage',
            'main_image',
            'sku',
            'is_featured',
            'dimensions',
            'tags',
        ];

        for (const col of columnsToRemove) {
            try {
                await queryInterface.removeColumn('products', col);
            } catch (e) {
                console.warn(`Could not remove column ${col}:`, e.message);
            }
        }
    },
};
