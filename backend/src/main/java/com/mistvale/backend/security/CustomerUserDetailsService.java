package com.mistvale.backend.security;

import com.mistvale.backend.entity.CustomerAccount;
import com.mistvale.backend.repository.CustomerAccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class CustomerUserDetailsService implements UserDetailsService {

    private final CustomerAccountRepository customerAccountRepository;
    private final String adminUsername;
    private final String adminPassword;
    private final PasswordEncoder passwordEncoder;

    public CustomerUserDetailsService(CustomerAccountRepository customerAccountRepository, @Value("${mistvale.admin.username}") String adminUsername, @Value("${mistvale.admin.password}") String adminPassword, PasswordEncoder passwordEncoder) {
        this.customerAccountRepository = customerAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminUsername = adminUsername;
        this.adminPassword = passwordEncoder.encode(adminPassword);
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        // Keep the existing admin account working
        if (username.equalsIgnoreCase(adminUsername)) {
            return User.withUsername(adminUsername).password(adminPassword).roles("ADMIN").build();
        }

        // Look for a customer by email
        CustomerAccount customer = customerAccountRepository.findByEmailIgnoreCase(username).orElseThrow(() -> new UsernameNotFoundException("Account not found"));

        return User.withUsername(customer.getEmail()).password(customer.getPassword()).roles(customer.getRole()).build();
    }
}