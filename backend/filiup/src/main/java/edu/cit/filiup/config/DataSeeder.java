package edu.cit.filiup.config;

import edu.cit.filiup.entity.*;
import edu.cit.filiup.repository.*;
import edu.cit.filiup.service.BadgeService;
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
    private QuizRepository quizRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private StudentBadgeRepository studentBadgeRepository;

    @Autowired
    private BadgeService badgeService;

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
            teacher1.setUserName("guro_maria");
            teacher1.setUserEmail("guro.maria@halimbawa.com");
            teacher1.setUserPassword(passwordEncoder.encode("password"));
            teacher1.setUserRole("TEACHER");
            teacher1.setCreatedAt(LocalDateTime.now());
            teacher1.setIsActive(true);

            UserEntity teacher2 = new UserEntity();
            teacher2.setUserName("guro_jose");
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
            student1.setUserName("mag_aaral_ana");
            student1.setUserEmail("ana.santos@halimbawa.com");
            student1.setUserPassword(passwordEncoder.encode("password"));
            student1.setUserRole("STUDENT");
            student1.setCreatedAt(LocalDateTime.now());
            student1.setIsActive(true);

            UserEntity student2 = new UserEntity();
            student2.setUserName("mag_aaral_juan");
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
            profile1.setSection("Baitang 4-Sampaguita");
            profile1.setBadges("Mabilis na Mambabasa,Dalubhasa sa Kwento");
            profile1.setAverageScore(85.5);
            profile1.setNumberOfQuizTakes(10);
            profile1.setIsAccepted(true);
            profile1.setEmailVerified(true);

            StudentProfileEntity profile2 = new StudentProfileEntity();
            profile2.setUser(student2);
            profile2.setParentsEmail("magulang.juan@halimbawa.com");
            profile2.setSection("Baitang 4-Rosal");
            profile2.setBadges("Matalinong Mag-aaral,Kampeon sa Pagsusulit");
            profile2.setAverageScore(92.0);
            profile2.setNumberOfQuizTakes(15);
            profile2.setIsAccepted(true);
            profile2.setEmailVerified(true);

            // Save student profiles
            studentProfileRepository.save(profile1);
            studentProfileRepository.save(profile2);

            // Create classes
            ClassEntity class1 = new ClassEntity("Panitikan at Kultura ng Pilipinas", teacher1);
            class1.setDescription("Pag-aaral at pagsusuri ng mga akdang pampanitikan ng Pilipinas para sa pagpapayaman ng kaalaman sa sariling kultura");
            
            ClassEntity class2 = new ClassEntity("Mga Kuwentong Alamat at Pantasya", teacher2);
            class2.setDescription("Paggalugad sa mayamang mundo ng mga alamat, kwentong-bayan, at kuwentong pantasya ng Pilipinas");

            // Add students to classes
            class1.addStudent(student1);
            class1.addStudent(student2);
            class2.addStudent(student1);

            // Save classes
            class1 = classRepository.save(class1);
            class2 = classRepository.save(class2);

            // Create stories for class1
            StoryEntity story1 = new StoryEntity(
                "Ang Simula ng Pakikipagsapalaran ni Lapu-Lapu",
                "Noong unang panahon sa Mactan, may isang matapang na mandirigma na nagngangalang Lapu-Lapu. " +
                "Kilala siya sa buong kapuluan dahil sa kanyang tapang at pagmamahal sa kalayaan. " +
                "Isang araw, narinig niya na may mga dayuhang mananakop na papalapit sa kanilang isla. " +
                "\"Hindi tayo papayag na maging alipin ng mga dayuhan,\" sabi ni Lapu-Lapu sa kanyang mga kasamahan. " +
                "\"Kailangan nating protektahan ang aming lupain at ang aming kultura.\" " +
                "Tinanggap ng lahat ang panukala ni Lapu-Lapu. Naghanda sila ng mga sandata - mga sibat, kalasag, " +
                "at mga bolo. Magiging mahirap ang labanan, ngunit determinado si Lapu-Lapu na ipagtanggol " +
                "ang kanilang karapatan sa sariling bayan.",
                "Pakikipagsapalaran"
            );
            story1.setClassEntity(class1);
            story1.setCreatedBy(teacher1);

            StoryEntity story2 = new StoryEntity(
                "Ang Hiwaga ng Lumang Bahay sa Intramuros",
                "Ang lumang bahay na bato sa loob ng Intramuros ay nakatayo pa rin mula noong panahon ng mga Kastila. " +
                "Ang mga matatanda sa lugar ay nagsasalita ng mga kakaibang tunog at mga anino na nakikita sa mga bintana " +
                "tuwing gabi. Si Maria, isang dalaga na mahilig sa kasaysayan at paglutas ng mga hiwaga, ay nagpasyang " +
                "magsaliksik tungkol sa bahay. Nakumbinsi niya ang kanyang mga kaibigan na sina Pedro at Rosa na " +
                "samahan siya sa paggalugad isang Biyernes ng gabi. Habang papalapit sila sa matandang tarangka ng " +
                "bahay, isang malamig na hangin ang humampas mula sa may Pasig. \"Baka hindi maganda ang ginagawa natin,\" " +
                "bulong ni Rosa habang nakatingin sa mga lumang bintana. Ngunit si Maria ay nagtulak na ng mabigat na pintuan.",
                "Hiwaga"
            );
            story2.setClassEntity(class1);
            story2.setCreatedBy(teacher1);

            // Create story for class2
            StoryEntity story3 = new StoryEntity(
                "Ang Alamat ng Nawalang Perlas ng Dagat",
                "Noong unang panahon, may isang masaganang pulo sa gitna ng Karagatang Pasipiko na tinatawag na " +
                "Pulang Corales. Ang mga tao rito ay nabubuhay nang payapa, at ang kanilang yaman ay isang " +
                "napakagandang perlas na may kapangyarihang magbigay ng masaganang ani at kapayapaan sa buong pulo. " +
                "Si Dalisay, isang matalinong dalaga at tagapangalaga ng perlas, ay nakatira sa gitna ng pulo. " +
                "Isang gabi, habang natutulog ang lahat, may mga hindi kilalang nilalang mula sa kailaliman ng dagat " +
                "ang tumungo sa kanilang pulo. \"Kailangan naming makuha ang perlas na iyan,\" sabi ng pinuno nila. " +
                "\"Ito ay magbibigay sa amin ng kapangyarihang kontrolin ang lahat ng karagatan.\" " +
                "Nagising si Dalisay dahil sa kakaibang tunog. Nakita niya na nawala na ang sacred na perlas. " +
                "Kailangan niyang makuha ito pabalik para maibalik ang kapayapaan sa kanilang pulo.",
                "Alamat"
            );
            story3.setClassEntity(class2);
            story3.setCreatedBy(teacher2);

            // Save stories
            story1 = storyRepository.save(story1);
            story2 = storyRepository.save(story2);
            story3 = storyRepository.save(story3);

            // Create questions for story1
            List<QuestionBankEntity> story1Questions = Arrays.asList(
                createQuestion("Pangalan ng Bayani", "Ano ang pangalan ng matapang na mandirigma sa kwento?", 
                    "{\"A\":\"Jose Rizal\",\"B\":\"Lapu-Lapu\",\"C\":\"Andres Bonifacio\",\"D\":\"Apolinario Mabini\"}", 
                    "B", story1.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Layunin ni Lapu-Lapu", "Ano ang pangunahing layunin ni Lapu-Lapu sa kwento?", 
                    "{\"A\":\"Maghanap ng kayamanan\",\"B\":\"Makipag-kaibigan sa mga dayuhan\",\"C\":\"Protektahan ang kanilang lupain\",\"D\":\"Manalo sa paligsahan\"}", 
                    "C", story1.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Katangian ni Lapu-Lapu", "Sa anong mga katangian kilala si Lapu-Lapu?", 
                    "{\"A\":\"Yaman at kapangyarihan\",\"B\":\"Tapang at pagmamahal sa kalayaan\",\"C\":\"Karunungan at pag-ibig\",\"D\":\"Bilis at galing sa sayaw\"}", 
                    "B", story1.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Mga Sandata", "Anong mga sandata ang naghanda ni Lapu-Lapu at ng kanyang mga kasamahan?", 
                    "{\"A\":\"Baril at kanyon\",\"B\":\"Sibat, kalasag, at bolo\",\"C\":\"Espada at armor\",\"D\":\"Pana at palaso\"}", 
                    "B", story1.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Tagpuan ng Kwento", "Saan nangyari ang kwentong ito?", 
                    "{\"A\":\"Sa Luzon\",\"B\":\"Sa Mindanao\",\"C\":\"Sa Mactan\",\"D\":\"Sa Palawan\"}", 
                    "C", story1.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1)
            );

            // Create questions for story2
            List<QuestionBankEntity> story2Questions = Arrays.asList(
                createQuestion("Tagpuan ng Bahay", "Saan matatagpuan ang lumang bahay sa kwento?", 
                    "{\"A\":\"Sa Malacañang\",\"B\":\"Sa Intramuros\",\"C\":\"Sa Rizal Park\",\"D\":\"Sa Binondo\"}", 
                    "B", story2.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Pangunahing Tauhan", "Sino ang pangunahing tauhan ng kwento?", 
                    "{\"A\":\"Maria\",\"B\":\"Pedro\",\"C\":\"Rosa\",\"D\":\"Ang multo\"}", 
                    "A", story2.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Hilig ni Maria", "Ano ang hilig ni Maria ayon sa kwento?", 
                    "{\"A\":\"Siya ay mahilig sa pagluluto\",\"B\":\"Siya ay mahilig sa pagsasayaw\",\"C\":\"Siya ay mahilig sa kasaysayan at paglutas ng mga hiwaga\",\"D\":\"Siya ay mahilig sa pag-awit\"}", 
                    "C", story2.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Reaksyon ni Rosa", "Paano tumugon si Rosa nang papalapit sa bahay?", 
                    "{\"A\":\"Siya ay natuwa\",\"B\":\"Siya ay nag-alala\",\"C\":\"Siya ay nagtampo\",\"D\":\"Siya ay tumakbo pabalik\"}", 
                    "B", story2.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1),
                createQuestion("Panahon ng Paggalugad", "Kailan nagpasyang galugarin ng mga kaibigan ang bahay?", 
                    "{\"A\":\"Lunes ng umaga\",\"B\":\"Biyernes ng gabi\",\"C\":\"Sabado ng hapon\",\"D\":\"Linggo ng tanghali\"}", 
                    "B", story2.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher1)
            );

            // Create questions for story3
            List<QuestionBankEntity> story3Questions = Arrays.asList(
                createQuestion("Pangalan ng Tagapangalaga", "Sino ang tagapangalaga ng mahiwagang perlas?", 
                    "{\"A\":\"Amihan\",\"B\":\"Dalisay\",\"C\":\"Tala\",\"D\":\"Mayari\"}", 
                    "B", story3.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher2),
                createQuestion("Pangalan ng Pulo", "Ano ang pangalan ng masaganang pulo sa kwento?", 
                    "{\"A\":\"Pulang Corales\",\"B\":\"Luntiang Perlas\",\"C\":\"Asul na Tubig\",\"D\":\"Dilaw na Bulaklak\"}", 
                    "A", story3.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher2),
                createQuestion("Kapangyarihan ng Perlas", "Ano ang kapangyarihan ng sacred na perlas?", 
                    "{\"A\":\"Magbigay ng ginhawa sa panahon\",\"B\":\"Magbigay ng masaganang ani at kapayapaan\",\"C\":\"Magbigay ng lakas sa mandirigma\",\"D\":\"Magbigay ng karunungan\"}", 
                    "B", story3.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher2),
                createQuestion("Mga Salarin", "Saan galing ang mga kumuha ng perlas?", 
                    "{\"A\":\"Mula sa bundok\",\"B\":\"Mula sa langit\",\"C\":\"Mula sa kailaliman ng dagat\",\"D\":\"Mula sa kabilang isla\"}", 
                    "C", story3.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher2),
                createQuestion("Dahilan ng Pagkakaalis", "Bakit kinuha ng mga nilalang ang perlas?", 
                    "{\"A\":\"Para ipagbili\",\"B\":\"Para sa kapangyarihang kontrolin ang karagatan\",\"C\":\"Para sa kagandahan\",\"D\":\"Para sa kanilang sariling pulo\"}", 
                    "B", story3.getStoryId(), QuestionBankEntity.StoryType.CLASS, teacher2)
            );

            // Save all questions
            questionBankRepository.saveAll(story1Questions);
            questionBankRepository.saveAll(story2Questions);
            questionBankRepository.saveAll(story3Questions);

            // Initialize badge system
            badgeService.initializeSystemBadges();

            // Create quizzes based on stories
            QuizEntity quiz1 = createQuiz("Pagsusulit: Ang Pakikipagsapalaran ni Lapu-Lapu", 
                "Pagsusulit sa pag-unawa ng kwentong pakikipagsapalaran ng bayaning si Lapu-Lapu", 
                "Madali", 15, story1, teacher1);

            QuizEntity quiz2 = createQuiz("Pagsusulit: Ang Hiwaga ng Lumang Bahay sa Intramuros", 
                "Pagsusulit sa kwentong hiwaga ni Maria at ng kanyang mga kaibigan sa Intramuros", 
                "Katamtaman", 20, story2, teacher1);

            QuizEntity quiz3 = createQuiz("Pagsusulit: Ang Alamat ng Nawalang Perlas ng Dagat", 
                "Pagsusulit sa alamat tungkol kay Dalisay at sa mahiwagang perlas ng Pulang Corales", 
                "Mahirap", 25, story3, teacher2);

            // Save quizzes
            quiz1 = quizRepository.save(quiz1);
            quiz2 = quizRepository.save(quiz2);
            quiz3 = quizRepository.save(quiz3);

            // Create quiz questions for each quiz
            createQuizQuestions(quiz1, story1Questions);
            createQuizQuestions(quiz2, story2Questions);
            createQuizQuestions(quiz3, story3Questions);

            // Create quiz attempts for students with realistic scenarios
            createStudentQuizAttempts(student1, student2, Arrays.asList(quiz1, quiz2, quiz3));

            System.out.println("Matagumpay na natapos ang paglalagay ng mga datos, kasama na ang mga pagsusulit at mga badge!");
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

    private QuizEntity createQuiz(String title, String description, String category, 
                                  int timeLimitMinutes, StoryEntity story, UserEntity createdBy) {
        QuizEntity quiz = new QuizEntity();
        quiz.setTitle(title);
        quiz.setDescription(description);
        quiz.setCategory(category);
        quiz.setTimeLimitMinutes(timeLimitMinutes);
        quiz.setOpensAt(LocalDateTime.now().minusDays(7)); // Available from a week ago
        quiz.setClosesAt(LocalDateTime.now().plusDays(30)); // Available for a month
        quiz.setIsActive(true);
        quiz.setStory(story); // Use setStory instead of setStoryId
        quiz.setQuizType(QuizEntity.QuizType.STORY); // Set quiz type
        quiz.setCreatedBy(createdBy);
        quiz.setCreatedAt(LocalDateTime.now());
        return quiz;
    }

    private void createQuizQuestions(QuizEntity quiz, List<QuestionBankEntity> questionBank) {
        // For simplicity, we'll use the first 5 questions from the question bank
        List<QuestionBankEntity> selectedQuestions = questionBank.subList(0, Math.min(5, questionBank.size()));
        
        for (int i = 0; i < selectedQuestions.size(); i++) {
            QuestionBankEntity bankQuestion = selectedQuestions.get(i);
            QuizQuestionEntity quizQuestion = new QuizQuestionEntity();
            quizQuestion.setQuiz(quiz);
            quizQuestion.setQuestionText(bankQuestion.getQuestionText());
            quizQuestion.setOptions(bankQuestion.getOptions());
            quizQuestion.setCorrectAnswer(bankQuestion.getCorrectAnswer());
            quizQuestion.setPoints(10); // Each question worth 10 points
            
            // Add to quiz's questions list
            if (quiz.getQuestions() == null) {
                quiz.setQuestions(new ArrayList<>());
            }
            quiz.getQuestions().add(quizQuestion);
        }
    }

    private void createStudentQuizAttempts(UserEntity student1, UserEntity student2, List<QuizEntity> quizzes) {
        LocalDateTime baseTime = LocalDateTime.now().minusDays(30); // Start attempts from 30 days ago
        
        // Student 1 (Ana Santos) - Average performer with some excellent moments
        // Quiz 1 attempts (showing improvement)
        createQuizAttempt(student1, quizzes.get(0), 75.0, 12, baseTime.minusDays(25)); // First attempt - Good start
        createQuizAttempt(student1, quizzes.get(0), 85.0, 8, baseTime.minusDays(20));  // Improvement - Good Performance badge
        createQuizAttempt(student1, quizzes.get(0), 95.0, 6, baseTime.minusDays(15));  // Excellent - Quiz Excellence badge
        
        // Quiz 2 attempts
        createQuizAttempt(student1, quizzes.get(1), 90.0, 15, baseTime.minusDays(18)); // High Achiever badge
        createQuizAttempt(student1, quizzes.get(1), 88.0, 4, baseTime.minusDays(12));  // Speed Demon badge (under 5 min)
        
        // Quiz 3 attempts
        createQuizAttempt(student1, quizzes.get(2), 100.0, 20, baseTime.minusDays(10)); // Perfect Quiz badge
        createQuizAttempt(student1, quizzes.get(2), 92.0, 18, baseTime.minusDays(5));   // Consistent high performance
        
        // Additional attempts for streak and volume badges
        createQuizAttempt(student1, quizzes.get(0), 82.0, 9, baseTime.minusDays(8));    // Continuing streak
        createQuizAttempt(student1, quizzes.get(1), 86.0, 11, baseTime.minusDays(3));   // More attempts for veteran status
        createQuizAttempt(student1, quizzes.get(2), 89.0, 14, baseTime.minusDays(1));   // Recent attempt

        // Student 2 (Juan dela Cruz) - High performer, consistent excellence
        // Quiz 1 attempts
        createQuizAttempt(student2, quizzes.get(0), 88.0, 10, baseTime.minusDays(28)); // Good start
        createQuizAttempt(student2, quizzes.get(0), 94.0, 7, baseTime.minusDays(24));  // High performance
        createQuizAttempt(student2, quizzes.get(0), 97.0, 8, baseTime.minusDays(20));  // Quiz Excellence
        
        // Quiz 2 attempts
        createQuizAttempt(student2, quizzes.get(1), 92.0, 12, baseTime.minusDays(22)); // Consistent high achiever
        createQuizAttempt(student2, quizzes.get(1), 96.0, 9, baseTime.minusDays(16));  // Quick Thinker (under 10 min)
        createQuizAttempt(student2, quizzes.get(1), 100.0, 15, baseTime.minusDays(14)); // Perfect Quiz
        
        // Quiz 3 attempts
        createQuizAttempt(student2, quizzes.get(2), 90.0, 22, baseTime.minusDays(18)); // High achiever
        createQuizAttempt(student2, quizzes.get(2), 93.0, 19, baseTime.minusDays(11)); // Consistent
        createQuizAttempt(student2, quizzes.get(2), 95.0, 16, baseTime.minusDays(7));  // Excellence
        
        // More attempts for advanced badges
        createQuizAttempt(student2, quizzes.get(0), 91.0, 6, baseTime.minusDays(9));   // Building streak
        createQuizAttempt(student2, quizzes.get(1), 89.0, 11, baseTime.minusDays(4));  // Consistency
        createQuizAttempt(student2, quizzes.get(2), 94.0, 13, baseTime.minusDays(2));  // Recent high performance
        
        // Additional attempts to trigger volume-based badges (Quiz Veteran, Quiz Master)
        for (int i = 0; i < 8; i++) {
            QuizEntity randomQuiz = quizzes.get(i % quizzes.size());
            double score = 85.0 + (Math.random() * 10); // Random score between 85-95%
            int timeMinutes = 8 + (int)(Math.random() * 10); // Random time 8-18 minutes
            createQuizAttempt(student2, randomQuiz, score, timeMinutes, baseTime.minusDays(i + 1));
        }
    }

    private void createQuizAttempt(UserEntity student, QuizEntity quiz, double score, int timeMinutes, LocalDateTime attemptTime) {
        QuizAttemptEntity attempt = new QuizAttemptEntity();
        attempt.setStudent(student);
        attempt.setQuiz(quiz);
        attempt.setScore(score);
        attempt.setMaxPossibleScore(100);
        attempt.setTimeTakenMinutes(timeMinutes);
        attempt.setCompletedAt(attemptTime);
        attempt.setIsCompleted(true);
        
        // Save the attempt
        attempt = quizAttemptRepository.save(attempt);
        
        // Trigger badge evaluation for this attempt
        try {
            badgeService.evaluateAndAwardBadgesForQuizAttempt(attempt);
        } catch (Exception e) {
            System.err.println("Error awarding badges for attempt: " + e.getMessage());
        }
    }
} 