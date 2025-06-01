package edu.cit.filiup.config;

import edu.cit.filiup.entity.*;
import edu.cit.filiup.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Configuration
public class DataSeeder {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private QuestionBankRepository questionBankRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedData() {
        return args -> {
            // Check if data already exists
            if (userRepository.count() > 0) {
                System.out.println("Data already seeded. Skipping...");
                return;
            }

            System.out.println("Seeding data...");

            // Create teachers
            UserEntity teacher1 = new UserEntity();
            teacher1.setUserName("teacher1");
            teacher1.setUserEmail("teacher1@example.com");
            teacher1.setUserPassword(passwordEncoder.encode("password"));
            teacher1.setUserRole("TEACHER");
            teacher1.setCreatedAt(LocalDateTime.now());
            teacher1.setIsActive(true);

            UserEntity teacher2 = new UserEntity();
            teacher2.setUserName("teacher2");
            teacher2.setUserEmail("teacher2@example.com");
            teacher2.setUserPassword(passwordEncoder.encode("password"));
            teacher2.setUserRole("TEACHER");
            teacher2.setCreatedAt(LocalDateTime.now());
            teacher2.setIsActive(true);

            // Save teachers
            teacher1 = userRepository.save(teacher1);
            teacher2 = userRepository.save(teacher2);

            // Create students
            UserEntity student1 = new UserEntity();
            student1.setUserName("student1");
            student1.setUserEmail("student1@example.com");
            student1.setUserPassword(passwordEncoder.encode("password"));
            student1.setUserRole("STUDENT");
            student1.setCreatedAt(LocalDateTime.now());
            student1.setIsActive(true);

            UserEntity student2 = new UserEntity();
            student2.setUserName("student2");
            student2.setUserEmail("student2@example.com");
            student2.setUserPassword(passwordEncoder.encode("password"));
            student2.setUserRole("STUDENT");
            student2.setCreatedAt(LocalDateTime.now());
            student2.setIsActive(true);

            // Save students
            student1 = userRepository.save(student1);
            student2 = userRepository.save(student2);

            // Create classes
            ClassEntity class1 = new ClassEntity("English Literature", teacher1);
            class1.setDescription("A class focused on reading and analyzing literature");
            
            ClassEntity class2 = new ClassEntity("Science Fiction", teacher2);
            class2.setDescription("Exploring the world of science fiction literature");

            // Add students to classes
            class1.addStudent(student1);
            class1.addStudent(student2);
            class2.addStudent(student1);

            // Save classes
            class1 = classRepository.save(class1);
            class2 = classRepository.save(class2);

            // Create stories for class1
            StoryEntity story1 = new StoryEntity(
                "The Adventure Begins",
                "Once upon a time in a land far away, there lived a brave knight named Sir Roland. " +
                "He was known throughout the kingdom for his courage and honor. One day, the king summoned " +
                "Sir Roland to the castle. \"A dragon has been terrorizing the northern villages,\" the king said. " +
                "\"I need you to defeat it and bring peace to my people.\" Sir Roland accepted the mission without " +
                "hesitation. He gathered his armor, sword, and supplies, then set off on his trusty horse. " +
                "The journey would be long and dangerous, but Sir Roland was determined to succeed.",
                "Adventure"
            );
            story1.setClassEntity(class1);
            story1.setCreatedBy(teacher1);

            StoryEntity story2 = new StoryEntity(
                "The Mystery of Moonlight Manor",
                "The old mansion on the hill had been abandoned for decades. Local legends spoke of strange " +
                "noises and ghostly apparitions seen through the windows at night. Sarah, a curious teenager " +
                "with a passion for solving mysteries, decided to investigate. She convinced her friends Alex " +
                "and Maya to join her on a Friday evening exploration. As they approached the iron gates of " +
                "Moonlight Manor, a cold wind blew through the trees. \"Maybe this isn't such a good idea,\" " +
                "whispered Maya. But Sarah was already pushing open the creaking gate.",
                "Mystery"
            );
            story2.setClassEntity(class1);
            story2.setCreatedBy(teacher1);

            // Create story for class2
            StoryEntity story3 = new StoryEntity(
                "Beyond the Stars",
                "Commander Elena Chen stared out at the vast expanse of space from the bridge of the starship " +
                "Horizon. Earth was now just a tiny blue dot in the distance. The mission to establish the first " +
                "human colony on Proxima Centauri b had begun. Five thousand colonists slept in cryostasis chambers " +
                "below deck, dreaming of the new world they would build. \"Status report,\" Elena requested. " +
                "\"All systems nominal, Commander,\" replied the ship's AI. \"Estimated arrival in 4.2 years.\" " +
                "Elena nodded, knowing that the fate of humanity's future rested on their success.",
                "Science Fiction"
            );
            story3.setClassEntity(class2);
            story3.setCreatedBy(teacher2);

            // Save stories
            story1 = storyRepository.save(story1);
            story2 = storyRepository.save(story2);
            story3 = storyRepository.save(story3);

            // Create questions for story1
            List<QuestionBankEntity> story1Questions = Arrays.asList(
                createQuestion("Knight's Name", "What is the name of the brave knight in the story?", 
                    "{\"A\":\"Sir Lancelot\",\"B\":\"Sir Roland\",\"C\":\"Sir Galahad\",\"D\":\"Sir Arthur\"}", 
                    "B", story1.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Knight's Mission", "What mission did the king give to the knight?", 
                    "{\"A\":\"Find a lost treasure\",\"B\":\"Rescue a princess\",\"C\":\"Defeat a dragon\",\"D\":\"Win a tournament\"}", 
                    "C", story1.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Knight's Qualities", "What qualities was Sir Roland known for?", 
                    "{\"A\":\"Wealth and power\",\"B\":\"Courage and honor\",\"C\":\"Wisdom and magic\",\"D\":\"Speed and strength\"}", 
                    "B", story1.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Knight's Transportation", "How did Sir Roland travel on his mission?", 
                    "{\"A\":\"By foot\",\"B\":\"By horse\",\"C\":\"By boat\",\"D\":\"By carriage\"}", 
                    "B", story1.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Story Setting", "Where does the story take place?", 
                    "{\"A\":\"In modern times\",\"B\":\"In a fantasy kingdom\",\"C\":\"In outer space\",\"D\":\"In a big city\"}", 
                    "B", story1.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1)
            );

            // Create questions for story2
            List<QuestionBankEntity> story2Questions = Arrays.asList(
                createQuestion("Mansion Name", "What is the name of the abandoned mansion?", 
                    "{\"A\":\"Darkwood House\",\"B\":\"Moonlight Manor\",\"C\":\"Shadowy Estate\",\"D\":\"Haunted Hill\"}", 
                    "B", story2.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Main Character", "Who is the main character of the story?", 
                    "{\"A\":\"Sarah\",\"B\":\"Alex\",\"C\":\"Maya\",\"D\":\"The ghost\"}", 
                    "A", story2.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Character Trait", "What is Sarah's notable characteristic?", 
                    "{\"A\":\"She is afraid of everything\",\"B\":\"She is very strong\",\"C\":\"She is curious\",\"D\":\"She can see ghosts\"}", 
                    "C", story2.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Friend's Reaction", "How did Maya react when approaching the mansion?", 
                    "{\"A\":\"She was excited\",\"B\":\"She was angry\",\"C\":\"She was hesitant\",\"D\":\"She ran away\"}", 
                    "C", story2.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Time Setting", "When did the friends decide to explore the mansion?", 
                    "{\"A\":\"Monday morning\",\"B\":\"Friday evening\",\"C\":\"Saturday afternoon\",\"D\":\"Sunday night\"}", 
                    "B", story2.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1)
            );

            // Create questions for story3
            List<QuestionBankEntity> story3Questions = Arrays.asList(
                createQuestion("Commander's Name", "What is the name of the starship commander?", 
                    "{\"A\":\"Elena Chen\",\"B\":\"Maria Rodriguez\",\"C\":\"John Smith\",\"D\":\"David Kim\"}", 
                    "A", story3.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher2),
                createQuestion("Starship Name", "What is the name of the starship?", 
                    "{\"A\":\"Enterprise\",\"B\":\"Discovery\",\"C\":\"Horizon\",\"D\":\"Voyager\"}", 
                    "C", story3.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher2),
                createQuestion("Mission Purpose", "What is the purpose of the mission?", 
                    "{\"A\":\"Explore new planets\",\"B\":\"Establish a human colony\",\"C\":\"Make contact with aliens\",\"D\":\"Mine resources\"}", 
                    "B", story3.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher2),
                createQuestion("Colonist Status", "What is the status of the colonists during the journey?", 
                    "{\"A\":\"Working on the ship\",\"B\":\"Training for the mission\",\"C\":\"In cryostasis\",\"D\":\"Living in simulated environments\"}", 
                    "C", story3.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher2),
                createQuestion("Journey Duration", "How long will it take to reach the destination?", 
                    "{\"A\":\"6 months\",\"B\":\"1.5 years\",\"C\":\"4.2 years\",\"D\":\"10 years\"}", 
                    "C", story3.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher2)
            );

            // Save all questions
            questionBankRepository.saveAll(story1Questions);
            questionBankRepository.saveAll(story2Questions);
            questionBankRepository.saveAll(story3Questions);

            System.out.println("Data seeding completed successfully!");
        };
    }

    private QuestionBankEntity createQuestion(String title, String questionText, String options, 
                                             String correctAnswer, UUID storyId, 
                                             QuestionBankEntity.StoryType storyType, UserEntity createdBy) {
        QuestionBankEntity question = new QuestionBankEntity(title, questionText, options, correctAnswer);
        question.setStoryId(storyId);
        question.setStoryType(storyType);
        question.setCreatedBy(createdBy);
        return question;
    }
} 