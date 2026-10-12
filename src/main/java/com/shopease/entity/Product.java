package com.shopease.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long productId;
	
	@Column(nullable = false,length = 200)
	private String name;
	
//	 BigDecimal is the correct type for money — never use double (floating point errors!)
//     precision = total digits, scale = digits after decimal point → up to 99999.99
	@Column(nullable = false,precision = 10,scale=2)
	private BigDecimal price;
	
	@Column(nullable = false)
	private Integer stock;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name ="category_id",nullable = false)
	private Category category;

}
