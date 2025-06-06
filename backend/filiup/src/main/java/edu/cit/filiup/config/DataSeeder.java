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
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedData() {
        return args -> {
            // Check if data already exists
            if (userRepository.count() > 0) {
                System.out.println("Ang data ay naseeded na. Nilalaktawan...");
                return;
            }

            System.out.println("Nagsisimula ang pagseseeding ng data...");

            // Create teachers
            UserEntity teacher1 = new UserEntity();
            teacher1.setUserName("teacher1");
            teacher1.setUserEmail("guro.maria@halimbawa.com");
            teacher1.setUserPassword(passwordEncoder.encode("password"));
            teacher1.setUserRole("TEACHER");
            teacher1.setCreatedAt(LocalDateTime.now());
            teacher1.setIsActive(true);

            UserEntity teacher2 = new UserEntity();
            teacher2.setUserName("teacher2");
            teacher2.setUserEmail("guro.jose@halimbawa.com");
            teacher2.setUserPassword(passwordEncoder.encode("password"));
            teacher2.setUserRole("TEACHER");
            teacher2.setCreatedAt(LocalDateTime.now());
            teacher2.setIsActive(true);

            // Save teachers
            teacher1 = userRepository.save(teacher1);
            teacher2 = userRepository.save(teacher2);

            // Create admin
            UserEntity admin = new UserEntity();
            admin.setUserName("admin");
            admin.setUserEmail("admin@filiup.com");
            admin.setUserPassword(passwordEncoder.encode("admin123"));
            admin.setUserRole("ADMIN");
            admin.setCreatedAt(LocalDateTime.now());
            admin.setIsActive(true);

            // Save admin
            admin = userRepository.save(admin);

            // Create students
            UserEntity student1 = new UserEntity();
            student1.setUserName("student1");
            student1.setUserEmail("ana.santos@halimbawa.com");
            student1.setUserPassword(passwordEncoder.encode("password"));
            student1.setUserRole("STUDENT");
            student1.setCreatedAt(LocalDateTime.now());
            student1.setIsActive(true);

            UserEntity student2 = new UserEntity();
            student2.setUserName("student2");
            student2.setUserEmail("juan.dela.cruz@halimbawa.com");
            student2.setUserPassword(passwordEncoder.encode("password"));
            student2.setUserRole("STUDENT");
            student2.setCreatedAt(LocalDateTime.now());
            student2.setIsActive(true);

            // Save students
            student1 = userRepository.save(student1);
            student2 = userRepository.save(student2);

            // Create student profiles
            StudentProfileEntity profile1 = new StudentProfileEntity();
            profile1.setUser(student1);
            profile1.setParentsEmail("magulang.ana@halimbawa.com");
            profile1.setSection("Baitang 4-A");
            profile1.setBadges("Mabilis na Mambabasa,Dalubhasa sa Kwento");
            profile1.setAverageScore(85.5);
            profile1.setNumberOfQuizTakes(10);
            profile1.setIsAccepted(true);
            profile1.setEmailVerified(true);

            StudentProfileEntity profile2 = new StudentProfileEntity();
            profile2.setUser(student2);
            profile2.setParentsEmail("magulang.juan@halimbawa.com");
            profile2.setSection("Baitang 4-B");
            profile2.setBadges("Matalinong Mag-aaral,Kampeon sa Pagsusulit");
            profile2.setAverageScore(92.0);
            profile2.setNumberOfQuizTakes(15);
            profile2.setIsAccepted(true);
            profile2.setEmailVerified(true);

            // Save student profiles
            studentProfileRepository.save(profile1);
            studentProfileRepository.save(profile2);

            // Create classes
            ClassEntity class1 = new ClassEntity("Panitikan ng Pilipinas", teacher1);
            class1.setDescription("Isang klase na nakatuon sa pagbabasa at pagsusuri ng mga akdang pampanitikan");
            
            ClassEntity class2 = new ClassEntity("Mga Kuwentong Pantasya", teacher2);
            class2.setDescription("Paggalugad sa mundo ng mga kuwentong pantasya at alamat");

            // Add students to classes
            class1.addStudent(student1);
            class1.addStudent(student2);
            class2.addStudent(student1);

            // Save classes
            class1 = classRepository.save(class1);
            class2 = classRepository.save(class2);

            // Create stories for class1
            StoryEntity story1 = new StoryEntity(
                "Ang Simula ng Pakikipagsapalaran",
                "Noong unang panahon sa isang lupain na malayo, nakatira ang isang matapang na kabalyero na " +
                "nagngangalang Sir Roland. Kilala siya sa buong kaharian dahil sa kanyang tapang at dangal. " +
                "Isang araw, tinawag siya ng hari sa palasyo. \"May dragon na nambabagabag sa mga nayon sa hilaga,\" " +
                "sabi ng hari. \"Kailangan mo itong talunin at magdulot ng kapayapaan sa aming mga mamamayan.\" " +
                "Tinanggap ni Sir Roland ang misyon nang walang pag-aalinlangan. Kinuha niya ang kanyang " +
                "baluti, tabak, at mga gamit, pagkatapos ay umalis sakay ng kanyang matalik na kabayo. " +
                "Magiging mahaba at mapanganib ang paglalakbay, ngunit determinado si Sir Roland na magtagumpay.",
                "Pakikipagsapalaran"
            );
            story1.setClassEntity(class1);
            story1.setCreatedBy(teacher1);

            StoryEntity story2 = new StoryEntity(
                "Ang Hiwaga ng Mansyon sa Buwan",
                "Ang lumang mansyon sa tuktok ng burol ay naulila nang maraming dekada. Ang mga alamat sa lugar " +
                "ay nagsasalita ng mga kakaibang tunog at mga multo na nakikita sa mga bintana tuwing gabi. " +
                "Si Sarah, isang dalaga na mahilig sa paglutas ng mga hiwaga, ay nagpasyang imbestigahan. " +
                "Nakumbinsi niya ang kanyang mga kaibigan na sina Alex at Maya na samahan siya sa isang " +
                "paggalugad tuwing Biyernes ng gabi. Habang papalapit sila sa mga bakal na tarangka ng " +
                "Mansyon sa Buwan, isang malamig na hangin ang humampas sa mga puno. \"Baka hindi ito " +
                "magandang ideya,\" bulong ni Maya. Ngunit si Sarah ay nagtulak na ng umiipit na tarangka.",
                "Hiwaga"
            );
            story2.setClassEntity(class1);
            story2.setCreatedBy(teacher1);

            // Create story for class2
            StoryEntity story3 = new StoryEntity(
                "Sa Kabilang Panig ng mga Bituin",
                "Si Kumander Elena Chen ay tumitig sa malawak na kalangitan mula sa tulay ng sasakyang " +
                "pangkalawakan na Horizon. Ang Daigdig ay isang maliit na asul na tuldok na lamang sa kalayuan. " +
                "Nagsimula na ang misyon upang magtatag ng unang kolonya ng tao sa Proxima Centauri b. " +
                "Limang libong kolonista ang natutulog sa mga silid na cryostasis sa ibaba ng barko, " +
                "nanaginip ng bagong mundo na kanilang itatayo. \"Ulat ng kalagayan,\" hiling ni Elena. " +
                "\"Lahat ng sistema ay normal, Kumander,\" tugon ng AI ng barko. \"Tantyang pagdating " +
                "sa loob ng 4.2 taon.\" Tumango si Elena, alam na ang kinabukasan ng sangkatauhan ay " +
                "nakasalalay sa kanilang tagumpay.",
                "Agham Pantasya"
            );
            story3.setClassEntity(class2);
            story3.setCreatedBy(teacher2);

            // Save stories
            story1 = storyRepository.save(story1);
            story2 = storyRepository.save(story2);
            story3 = storyRepository.save(story3);

            // Create questions for story1
            List<QuestionBankEntity> story1Questions = Arrays.asList(
                createQuestion("Pangalan ng Kabalyero", "Ano ang pangalan ng matapang na kabalyero sa kwento?", 
                    "{\"A\":\"Sir Lancelot\",\"B\":\"Sir Roland\",\"C\":\"Sir Galahad\",\"D\":\"Sir Arthur\"}", 
                    "B", story1.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Misyon ng Kabalyero", "Anong misyon ang ibinigay ng hari sa kabalyero?", 
                    "{\"A\":\"Maghanap ng nawalang kayamanan\",\"B\":\"Iligtas ang prinsesa\",\"C\":\"Talunin ang dragon\",\"D\":\"Manalo sa torneo\"}", 
                    "C", story1.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Katangian ng Kabalyero", "Sa anong mga katangian kilala si Sir Roland?", 
                    "{\"A\":\"Yaman at kapangyarihan\",\"B\":\"Tapang at dangal\",\"C\":\"Karunungan at salamangka\",\"D\":\"Bilis at lakas\"}", 
                    "B", story1.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Sasakyang Ginamit", "Paano naglakbay si Sir Roland sa kanyang misyon?", 
                    "{\"A\":\"Naglakad\",\"B\":\"Sumakay ng kabayo\",\"C\":\"Sumakay ng bangka\",\"D\":\"Sumakay ng karwahe\"}", 
                    "B", story1.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Tagpuan ng Kwento", "Saan nangyari ang kwento?", 
                    "{\"A\":\"Sa modernong panahon\",\"B\":\"Sa isang kaharian ng pantasya\",\"C\":\"Sa kalawakan\",\"D\":\"Sa malaking lungsod\"}", 
                    "B", story1.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1)
            );

            // Create questions for story2
            List<QuestionBankEntity> story2Questions = Arrays.asList(
                createQuestion("Pangalan ng Mansyon", "Ano ang pangalan ng naiiwan na mansyon?", 
                    "{\"A\":\"Bahay na Darkwood\",\"B\":\"Mansyon sa Buwan\",\"C\":\"Estate na Malilim\",\"D\":\"Burol na Multo\"}", 
                    "B", story2.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Pangunahing Tauhan", "Sino ang pangunahing tauhan ng kwento?", 
                    "{\"A\":\"Sarah\",\"B\":\"Alex\",\"C\":\"Maya\",\"D\":\"Ang multo\"}", 
                    "A", story2.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Katangian ng Tauhan", "Ano ang kapansin-pansing katangian ni Sarah?", 
                    "{\"A\":\"Siya ay natatakot sa lahat\",\"B\":\"Siya ay napakalakas\",\"C\":\"Siya ay mapagkuriyoso\",\"D\":\"Siya ay nakakakita ng multo\"}", 
                    "C", story2.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Reaksyon ng Kaibigan", "Paano tumugon si Maya nang papalapit sa mansyon?", 
                    "{\"A\":\"Siya ay natuwa\",\"B\":\"Siya ay nagalit\",\"C\":\"Siya ay nag-atubili\",\"D\":\"Siya ay tumakbo\"}", 
                    "C", story2.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Oras ng Pagganap", "Kailan nagpasyang galugarin ng mga kaibigan ang mansyon?", 
                    "{\"A\":\"Lunes ng umaga\",\"B\":\"Biyernes ng gabi\",\"C\":\"Sabado ng hapon\",\"D\":\"Linggo ng gabi\"}", 
                    "B", story2.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1)
            );

            // Create questions for story3
            List<QuestionBankEntity> story3Questions = Arrays.asList(
                createQuestion("Pangalan ng Kumander", "Ano ang pangalan ng kumander ng sasakyang pangkalawakan?", 
                    "{\"A\":\"Elena Chen\",\"B\":\"Maria Rodriguez\",\"C\":\"John Smith\",\"D\":\"David Kim\"}", 
                    "A", story3.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher2),
                createQuestion("Pangalan ng Sasakyan", "Ano ang pangalan ng sasakyang pangkalawakan?", 
                    "{\"A\":\"Enterprise\",\"B\":\"Discovery\",\"C\":\"Horizon\",\"D\":\"Voyager\"}", 
                    "C", story3.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher2),
                createQuestion("Layunin ng Misyon", "Ano ang layunin ng misyon?", 
                    "{\"A\":\"Tuklasin ang mga bagong planeta\",\"B\":\"Magtatag ng kolonya ng tao\",\"C\":\"Makipag-ugnayan sa mga dayuhan\",\"D\":\"Magmina ng mga likas na yaman\"}", 
                    "B", story3.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher2),
                createQuestion("Kalagayan ng mga Kolonista", "Ano ang kalagayan ng mga kolonista sa paglalakbay?", 
                    "{\"A\":\"Nagtatrabaho sa barko\",\"B\":\"Nagsasanay para sa misyon\",\"C\":\"Nasa cryostasis\",\"D\":\"Nakatira sa mga huwad na kapaligiran\"}", 
                    "C", story3.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher2),
                createQuestion("Tagal ng Paglalakbay", "Gaano katagal bago makarating sa patutunguhan?", 
                    "{\"A\":\"6 na buwan\",\"B\":\"1.5 taon\",\"C\":\"4.2 taon\",\"D\":\"10 taon\"}", 
                    "C", story3.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher2)
            );

            // Save all questions
            questionBankRepository.saveAll(story1Questions);
            questionBankRepository.saveAll(story2Questions);
            questionBankRepository.saveAll(story3Questions);

            System.out.println("Matagumpay na natapos ang pagseseeding ng data!");
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