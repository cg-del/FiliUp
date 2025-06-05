package edu.cit.filiup;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@ComponentScan(basePackages = {"edu.cit.filiup"})
@EnableAsync
public class FiliupApplication {

	public static void main(String[] args) {
		SpringApplication.run(FiliupApplication.class, args);
	}
}
