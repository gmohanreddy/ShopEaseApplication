package com.shopease.repository;

import com.shopease.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Derived query - reads category.categoryId through the relationship
    List<Product> findByCategoryCategoryId(Long categoryId);

    // Page<T> wraps results with totalPages, totalElements for pagination UI
    Page<Product> findAll(Pageable pageable);

    // JPQL uses class/field names, NOT table/column names
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Product> searchByName(@Param("name") String name, Pageable pageable);
}