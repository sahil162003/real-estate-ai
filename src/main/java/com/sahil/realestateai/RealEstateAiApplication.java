package com.sahil.realestateai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class RealEstateAiApplication {

	public static void main(String[] args) {
		SpringApplication.run(RealEstateAiApplication.class, args);
	}

}
