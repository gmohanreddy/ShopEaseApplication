package com.shopease.entity;

import com.shopease.entity.enums.Role;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

// UserDetails is a Spring Security interface.
// By implementing it, Spring Security knows how to use this class
// for authentication — it asks for getUsername(), getPassword(),
// and getAuthorities() automatically.
@Entity
@Table(name = "security_users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityUser implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // This is the "username" in Spring Security terms — we use email
    @Column(nullable = false, unique = true)
    private String email;

    // NEVER store plain text passwords — always store the BCrypt hash
    // BCryptPasswordEncoder turns "mypassword" into "$2a$10$xyz..."
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // ── UserDetails interface methods ──────────────────────────

    // Tells Spring Security what permissions this user has.
    // "ROLE_USER" or "ROLE_ADMIN" — Spring Security expects the "ROLE_" prefix
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    // Spring Security calls this to get the password hash for comparison
    @Override
    public String getPassword() {
        return password;
    }

    // Spring Security calls this to identify the user — we use email
    @Override
    public String getUsername() {
        return email;
    }

    // These 4 methods control account status.
    // Return true for all — we are not implementing account locking yet.
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}