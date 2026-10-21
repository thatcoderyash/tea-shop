package com.mistvale.backend.service;

import com.mistvale.backend.dto.RegisterRequest;
import com.mistvale.backend.entity.CustomerAccount;
import com.mistvale.backend.repository.CustomerAccountRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerAccountService {

    private final CustomerAccountRepository customerAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomerAccountService(
            CustomerAccountRepository customerAccountRepository,
            PasswordEncoder passwordEncoder) {

        this.customerAccountRepository = customerAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public CustomerAccount register(RegisterRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        if (customerAccountRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists");
        }

        CustomerAccount account = new CustomerAccount();

        account.setName(request.getName().trim());
        account.setEmail(email);

        // Never store the plain-text password
        account.setPassword(
                passwordEncoder.encode(request.getPassword()));

        // Registration must always create a customer
        // The client cannot choose the role
        // Our entity defaults this to CUSTOMER

        return customerAccountRepository.save(account);
    }
}