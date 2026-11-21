package com.bloodbridge;

import com.bloodbridge.model.Donor;
import com.bloodbridge.repository.DonorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BloodBridgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(BloodBridgeApplication.class, args);
    }

    @Bean
    public CommandLineRunner loadDummyData(DonorRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Donor("Aarav Sharma", "+919876543210", "O_POS", 76.6598, 30.5160));
                repository.save(new Donor("Rohan Verma", "+919123456789", "O_NEG", 76.6600, 30.5170));
            }
        };
    }
}