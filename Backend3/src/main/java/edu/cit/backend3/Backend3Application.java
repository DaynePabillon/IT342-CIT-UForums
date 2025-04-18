package edu.cit.backend3;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "edu.cit.backend3.repository")
public class Backend3Application {

    public static void main(String[] args) {
        SpringApplication.run(Backend3Application.class, args);
    }

}
