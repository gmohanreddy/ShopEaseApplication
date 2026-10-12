package com.shopease.service;

import com.shopease.dto.CategoryRequest;
import com.shopease.dto.CategoryResponse;
import com.shopease.entity.Category;
import com.shopease.exception.DuplicateResourceException;
import com.shopease.exception.ResourceNotFoundException;
import com.shopease.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        log.info("Creating category: {}", request.getCategoryName());

        if (categoryRepository.existsByCategoryName(request.getCategoryName())) {
            log.warn("Duplicate category: {}", request.getCategoryName());
            throw new DuplicateResourceException(
                    "Category already exists: " + request.getCategoryName());
        }

        Category category = Category.builder()
                .categoryName(request.getCategoryName())
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Category created with id: {}", saved.getCategoryId());
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        log.debug("Fetching all categories");
        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        log.debug("Fetching category id: {}", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Category not found with id: {}", id);
                    return new ResourceNotFoundException(
                            "Category not found with id: " + id);
                });
        return mapToResponse(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .build();
    }
}