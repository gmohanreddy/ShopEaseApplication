package com.shopease.entity.enums;

// Defines what a registered user can do.
// Stored as a STRING in the database ("USER" or "ADMIN").
// Spring Security reads this to make authorization decisions.
public enum Role {
    USER,   // can browse products, place orders, view own orders
    ADMIN   // can create/update/delete products and categories
}