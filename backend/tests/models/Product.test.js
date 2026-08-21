const Product = require('../../src/models/Product');

// Mock the database pool
jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
}));

const pool = require('../../src/config/database');

describe('Product Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all products when no filters provided', async () => {
      const mockProducts = [
        {
          id: 1,
          title: 'Product 1',
          price: 99.99,
          category: 'individual',
          available: true,
          featured: false,
          images: JSON.stringify(['img1.jpg']),
          features: JSON.stringify(['feature1']),
          previews: JSON.stringify([]),
        },
        {
          id: 2,
          title: 'Product 2',
          price: 199.99,
          category: 'pacote',
          available: true,
          featured: true,
          images: JSON.stringify(['img2.jpg']),
          features: JSON.stringify(['feature2']),
          previews: JSON.stringify([]),
        },
      ];

      pool.query.mockResolvedValue({ rows: mockProducts });

      const result = await Product.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Product 1');
      expect(result[1].title).toBe('Product 2');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM products WHERE 1=1'),
        []
      );
    });

    it('should filter products by category', async () => {
      const mockProducts = [
        {
          id: 1,
          title: 'Individual Product',
          price: 99.99,
          category: 'individual',
          available: true,
          featured: false,
          images: JSON.stringify([]),
          features: JSON.stringify([]),
          previews: JSON.stringify([]),
        },
      ];

      pool.query.mockResolvedValue({ rows: mockProducts });

      const result = await Product.findAll({ category: 'individual' });

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('individual');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND category = $1'),
        ['individual']
      );
    });

    it('should filter products by available status', async () => {
      const mockProducts = [
        {
          id: 1,
          title: 'Available Product',
          price: 99.99,
          available: true,
          featured: false,
          images: JSON.stringify([]),
          features: JSON.stringify([]),
          previews: JSON.stringify([]),
        },
      ];

      pool.query.mockResolvedValue({ rows: mockProducts });

      const result = await Product.findAll({ available: true });

      expect(result).toHaveLength(1);
      expect(result[0].available).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND available = $1'),
        [true]
      );
    });

    it('should filter products by featured status', async () => {
      const mockProducts = [
        {
          id: 2,
          title: 'Featured Product',
          price: 199.99,
          featured: true,
          available: true,
          images: JSON.stringify([]),
          features: JSON.stringify([]),
          previews: JSON.stringify([]),
        },
      ];

      pool.query.mockResolvedValue({ rows: mockProducts });

      const result = await Product.findAll({ featured: true });

      expect(result[0].featured).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND featured = $1'),
        [true]
      );
    });

    it('should search by title or description', async () => {
      const mockProducts = [
        {
          id: 1,
          title: 'Searchable Product',
          price: 99.99,
          description: 'A product to search',
          available: true,
          featured: false,
          images: JSON.stringify([]),
          features: JSON.stringify([]),
          previews: JSON.stringify([]),
        },
      ];

      pool.query.mockResolvedValue({ rows: mockProducts });

      const result = await Product.findAll({ search: 'search' });

      expect(result).toHaveLength(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND (title ILIKE $1 OR description ILIKE $1)'),
        ['%search%']
      );
    });

    it('should apply limit and offset for pagination', async () => {
      const mockProducts = [];

      pool.query.mockResolvedValue({ rows: mockProducts });

      await Product.findAll({ limit: 10, offset: 20 });

      const query = pool.query.mock.calls[0][0];
      const params = pool.query.mock.calls[0][1];

      expect(query).toContain('LIMIT');
      expect(query).toContain('OFFSET');
      expect(params).toContain(10);
      expect(params).toContain(20);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      pool.query.mockRejectedValue(error);

      await expect(Product.findAll()).rejects.toThrow('Database connection failed');
    });
  });

  describe('create', () => {
    it('should create a new product with all fields', async () => {
      const productData = {
        title: 'New Product',
        headerTitle: 'New Header',
        category: 'individual',
        type: 'asset',
        description: 'Product description',
        shortDescription: 'Short desc',
        price: 99.99,
        discount: 10,
        priceOriginal: 111.10,
        featured: true,
        available: true,
        themeColor: '#6366f1',
        thumbnail: 'thumb.jpg',
        images: ['img1.jpg', 'img2.jpg'],
        features: ['feature1', 'feature2'],
        previews: ['preview1.jpg'],
      };

      const mockCreatedProduct = {
        id: 1,
        ...productData,
        images: JSON.stringify(productData.images),
        features: JSON.stringify(productData.features),
        previews: JSON.stringify(productData.previews),
      };

      pool.query.mockResolvedValue({ rows: [mockCreatedProduct] });

      const result = await Product.create(productData);

      expect(result.id).toBe(1);
      expect(result.title).toBe('New Product');
      expect(result.price).toBe(99.99);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO products'),
        expect.any(Array)
      );
    });

    it('should set featured to false by default', async () => {
      const productData = {
        title: 'Product',
        headerTitle: 'Header',
        category: 'individual',
        type: 'asset',
        description: 'Desc',
        shortDescription: 'Short',
        price: 99.99,
        themeColor: '#6366f1',
      };

      const mockCreatedProduct = {
        id: 1,
        ...productData,
        featured: false,
        available: true,
        images: JSON.stringify([]),
        features: JSON.stringify([]),
        previews: JSON.stringify([]),
      };

      pool.query.mockResolvedValue({ rows: [mockCreatedProduct] });

      const result = await Product.create(productData);

      expect(result.featured).toBe(false);
      const callArgs = pool.query.mock.calls[0][1];
      expect(callArgs[9]).toBe(false); // featured parameter
    });

    it('should use price as priceOriginal when not provided', async () => {
      const productData = {
        title: 'Product',
        headerTitle: 'Header',
        category: 'individual',
        type: 'asset',
        description: 'Desc',
        shortDescription: 'Short',
        price: 99.99,
        themeColor: '#6366f1',
      };

      const mockCreatedProduct = {
        id: 1,
        ...productData,
        priceOriginal: 99.99,
        featured: false,
        available: true,
        images: JSON.stringify([]),
        features: JSON.stringify([]),
        previews: JSON.stringify([]),
      };

      pool.query.mockResolvedValue({ rows: [mockCreatedProduct] });

      const result = await Product.create(productData);

      expect(result.priceOriginal).toBe(99.99);
      const callArgs = pool.query.mock.calls[0][1];
      expect(callArgs[8]).toBe(99.99); // priceOriginal parameter
    });

    it('should handle database errors on create', async () => {
      const productData = { title: 'Product', price: 99.99 };
      pool.query.mockRejectedValue(new Error('Insert failed'));

      await expect(Product.create(productData)).rejects.toThrow('Insert failed');
    });
  });

  describe('update', () => {
    it('should update product fields', async () => {
      const updates = {
        title: 'Updated Title',
        price: 149.99,
        featured: true,
      };

      const mockUpdatedProduct = {
        id: 1,
        title: 'Updated Title',
        price: 149.99,
        featured: true,
        images: JSON.stringify([]),
        features: JSON.stringify([]),
        previews: JSON.stringify([]),
      };

      pool.query.mockResolvedValue({ rows: [mockUpdatedProduct] });

      const result = await Product.update(1, updates);

      expect(result.title).toBe('Updated Title');
      expect(result.price).toBe(149.99);
      expect(result.featured).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE products SET'),
        expect.any(Array)
      );
    });

    it('should only update allowed fields', async () => {
      const updates = {
        title: 'New Title',
        price: 199.99,
        invalid_field: 'should be ignored',
      };

      const mockUpdatedProduct = {
        id: 1,
        title: 'New Title',
        price: 199.99,
        images: JSON.stringify([]),
        features: JSON.stringify([]),
        previews: JSON.stringify([]),
      };

      pool.query.mockResolvedValue({ rows: [mockUpdatedProduct] });

      const result = await Product.update(1, updates);

      const callArgs = pool.query.mock.calls[0][1];
      // Should only have title, price, and id - invalid_field should be excluded
      expect(callArgs).not.toContain('should be ignored');
    });

    it('should stringify array fields', async () => {
      const updates = {
        features: ['new feature 1', 'new feature 2'],
      };

      const mockUpdatedProduct = {
        id: 1,
        features: JSON.stringify(['new feature 1', 'new feature 2']),
        images: JSON.stringify([]),
        previews: JSON.stringify([]),
      };

      pool.query.mockResolvedValue({ rows: [mockUpdatedProduct] });

      await Product.update(1, updates);

      const callArgs = pool.query.mock.calls[0][1];
      expect(callArgs[0]).toBe(JSON.stringify(['new feature 1', 'new feature 2']));
    });

    it('should return null when product not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await Product.update(999, { title: 'New' });

      expect(result).toBeNull();
    });

    it('should throw error when no valid fields provided', async () => {
      const updates = {
        invalid_field1: 'value1',
        invalid_field2: 'value2',
      };

      await expect(Product.update(1, updates)).rejects.toThrow(
        'No valid fields to update'
      );
    });

    it('should handle database errors on update', async () => {
      pool.query.mockRejectedValue(new Error('Update failed'));

      await expect(Product.update(1, { title: 'New' })).rejects.toThrow(
        'Update failed'
      );
    });
  });

  describe('delete', () => {
    it('should delete a product by id', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await Product.delete(1);

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM products WHERE id = $1'),
        [1]
      );
    });

    it('should return false when product not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await Product.delete(999);

      expect(result).toBe(false);
    });
  });

  describe('findById', () => {
    it('should find product by id', async () => {
      const mockProduct = {
        id: 1,
        title: 'Product',
        price: 99.99,
        images: JSON.stringify([]),
        features: JSON.stringify([]),
        previews: JSON.stringify([]),
      };

      pool.query.mockResolvedValue({ rows: [mockProduct] });

      const result = await Product.findById(1);

      expect(result.id).toBe(1);
      expect(result.title).toBe('Product');
    });

    it('should return null when product not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await Product.findById(999);

      expect(result).toBeNull();
    });
  });
});
