package com.shopease.controller;

import com.shopease.dto.ProductResponse;
import com.shopease.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

// @Controller NOT @RestController
// @RestController returns JSON — @Controller returns a VIEW NAME
// Thymeleaf resolves the view name to:
// src/main/resources/templates/<viewName>.html
@Controller
@RequiredArgsConstructor
public class ProductViewController {

    private final ProductService productService;

    // GET /products?page=0&size=8
    @GetMapping("/products")
    public String listProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            Model model) {

        Page<ProductResponse> productPage =
                productService.getAllProducts(page, size, "productId");

        // Model carries data from Java → Thymeleaf HTML template
        // th:each="product : ${products}" in HTML iterates over this list
        model.addAttribute("products", productPage.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", productPage.getTotalPages());
        model.addAttribute("totalElements", productPage.getTotalElements());

        // Returns "products" → Thymeleaf looks for templates/products.html
        return "products";
    }
}