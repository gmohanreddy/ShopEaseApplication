package com.shopease.service;

import com.shopease.dto.ProductRequest;
import com.shopease.dto.ProductResponse;
import com.shopease.entity.Category;
import com.shopease.entity.Product;
import com.shopease.exception.ResourceNotFoundException;
import com.shopease.repository.CategoryRepository;
import com.shopease.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        log.info("Creating product: {}", request.getName());

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> {
                    log.error("Category not found with id: {}", request.getCategoryId());
                    return new ResourceNotFoundException(
                            "Category not found with id: " + request.getCategoryId());
                });

        Product product = Product.builder()
                .name(request.getName())
                .price(request.getPrice())
                .stock(request.getStock())
                .category(category)
                .build();

        Product saved = productRepository.save(product);
        log.info("Product created with id: {}", saved.getProductId());
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(int page, int size, String sortBy) {
        log.debug("Fetching products page:{} size:{} sortBy:{}", page, size, sortBy);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).ascending());
        return productRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        log.debug("Fetching product id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Product not found with id: {}", id);
                    return new ResourceNotFoundException(
                            "Product not found with id: " + id);
                });
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        log.info("Updating product id: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Product not found with id: {}", id);
                    return new ResourceNotFoundException(
                            "Product not found with id: " + id);
                });

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> {
                    log.error("Category not found with id: {}", request.getCategoryId());
                    return new ResourceNotFoundException(
                            "Category not found with id: " + request.getCategoryId());
                });

        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(category);

        Product updated = productRepository.save(product);
        log.info("Product id: {} updated successfully", id);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        log.info("Deleting product id: {}", id);
        if (!productRepository.existsById(id)) {
            log.error("Product not found with id: {}", id);
            throw new ResourceNotFoundException(
                    "Product not found with id: " + id);
        }
        productRepository.deleteById(id);
        log.info("Product id: {} deleted", id);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String name, int page, int size) {
        log.debug("Searching products by name: {}", name);
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.searchByName(name, pageable)
                .map(this::mapToResponse);
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .productId(product.getProductId())
                .name(product.getName())
                .price(product.getPrice())
                .stock(product.getStock())
                .categoryName(product.getCategory().getCategoryName())
                .build();
    }
}