package edu.cit.filiup;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"edu.cit.filiup"})
public class FiliupApplication {

	public static void main(String[] args) {
		SpringApplication.run(FiliupApplication.class, args);
	}
}
