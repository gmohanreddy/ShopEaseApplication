package com.shopease.repository;

import com.shopease.entity.SecurityUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SecurityUserRepository extends JpaRepository<SecurityUser, Long> {

    // Spring Security calls this during login to load the user by email
    // SELECT * FROM security_users WHERE email = ?
    Optional<SecurityUser> findByEmail(String email);

    boolean existsByEmail(String email);
}