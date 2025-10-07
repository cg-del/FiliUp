package com.filiup.Filiup.service;

import com.filiup.Filiup.entity.*;
import com.filiup.Filiup.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataSeedingService implements CommandLineRunner {

    private final PhaseRepository phaseRepository;
    private final LessonRepository lessonRepository;
    private final ActivityRepository activityRepository;
    private final LessonSlideRepository lessonSlideRepository;
    private final QuestionRepository questionRepository;
    private final DragDropItemRepository dragDropItemRepository;
    private final DragDropCategoryRepository dragDropCategoryRepository;
    private final MatchingPairRepository matchingPairRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (phaseRepository.count() == 0) {
            log.info("Seeding database with initial FiliUp content...");
            seedDatabase();
            log.info("Database seeding completed!");
        } else {
            log.info("Database already seeded. Skipping data seeding.");
        }
    }

    private void seedDatabase() {
        // Create Phase 1: Bahagi ng Pananalita
        Phase phase1 = Phase.builder()
                .title("📚 Phase 1: Bahagi ng Pananalita")
                .description("Pangunahing bahagi ng pananalita sa Filipino")
                .orderIndex(1)
                .build();
        phaseRepository.save(phase1);

        // Create Phase 2: Kasingkahulugan at Kasalungat
        Phase phase2 = Phase.builder()
                .title("📘 Phase 2: Kasingkahulugan at Kasalungat")
                .description("Pag-aralan ang mga salitang magkapareho at magkaiba ang kahulugan")
                .orderIndex(2)
                .build();
        phaseRepository.save(phase2);

        // Create Lessons for Phase 1
        createPangngalanLesson(phase1);
        createPandiwaLesson(phase1);
        createPanguriLesson(phase1);

        // Create Lesson for Phase 2
        createKasingkahuluganKasalungatLesson(phase2);
    }

    private void createPangngalanLesson(Phase phase) {
        Lesson lesson = Lesson.builder()
                .phase(phase)
                .title("Pangngalan (Nouns)")
                .description("Pag-aralan ang mga ngalan ng tao, bagay, hayop, lugar, at pangyayari")
                .orderIndex(1)
                .build();
        lessonRepository.save(lesson);

        // Create lesson slides
        createPangngalanSlides(lesson);
        
        // Create activities
        createPangngalanActivities(lesson);
    }

    private void createPangngalanSlides(Lesson lesson) {
        LessonSlide slide1 = LessonSlide.builder()
                .lesson(lesson)
                .title("Ano ang Pangngalan?")
                .content(Arrays.asList(
                    "Ang pangngalan ay mga salitang nagtutukoy sa ngalan ng tao, bagay, hayop, lugar, at pangyayari.",
                    "",
                    "• 👤 Tao: Ana, Maria, guro, bata",
                    "• 📦 Bagay: libro, mesa, sapatos, bola",
                    "• 🐕 Hayop: aso, pusa, ibon, kabayo",
                    "• 🏢 Lugar: bahay, paaralan, palengke, Maynila",
                    "• 🎉 Pangyayari: kasal, party, graduation, contest"
                ))
                .orderIndex(1)
                .build();
        lessonSlideRepository.save(slide1);

        LessonSlide slide2 = LessonSlide.builder()
                .lesson(lesson)
                .title("Mga Halimbawa")
                .content(Arrays.asList(
                    "Tingnan natin ang mga pangngalan sa mga pangungusap:",
                    "",
                    "• Si Ana ay kumakain ng mansanas.",
                    "  - Ana (tao), mansanas (bagay)",
                    "",
                    "• Ang aso ay tumatahol sa bakuran.",
                    "  - aso (hayop), bakuran (lugar)",
                    "",
                    "• May graduation sa paaralan.",
                    "  - graduation (pangyayari), paaralan (lugar)"
                ))
                .orderIndex(2)
                .build();
        lessonSlideRepository.save(slide2);
    }

    private void createPangngalanActivities(Lesson lesson) {
        // Multiple Choice Activity
        Activity mcActivity = Activity.builder()
                .lesson(lesson)
                .activityType(ActivityType.MULTIPLE_CHOICE)
                .title("Multiple Choice - Pangngalan")
                .instructions("Piliin ang tamang pangngalan sa bawat pangungusap.")
                .orderIndex(1)
                .passingPercentage(75)
                .build();
        activityRepository.save(mcActivity);

        // Add questions for Multiple Choice
        createPangngalanMCQuestions(mcActivity);

        // Drag Drop Activity
        Activity ddActivity = Activity.builder()
                .lesson(lesson)
                .activityType(ActivityType.DRAG_DROP)
                .title("Drag & Drop - Pangngalan")
                .instructions("Ilagay ang mga salita sa tamang kahon: Tao, Bagay, Hayop, Lugar")
                .orderIndex(2)
                .passingPercentage(75)
                .build();
        activityRepository.save(ddActivity);

        // Add drag drop items and categories
        createPangngalanDragDrop(ddActivity);

        // Matching Pairs Activity
        Activity mpActivity = Activity.builder()
                .lesson(lesson)
                .activityType(ActivityType.MATCHING_PAIRS)
                .title("Matching Pairs - Pangngalan")
                .instructions("Ipares ang mga salita sa kanilang tamang uri ng pangngalan")
                .orderIndex(3)
                .passingPercentage(75)
                .build();
        activityRepository.save(mpActivity);

        // Add matching pairs
        createPangngalanMatchingPairs(mpActivity);

        // Story Comprehension Activity
        Activity scActivity = Activity.builder()
                .lesson(lesson)
                .activityType(ActivityType.STORY_COMPREHENSION)
                .title("Story Reading - Pangngalan")
                .instructions("Basahin ang kwento at sagutin ang mga tanong.")
                .storyText("Si Lito ay pumunta sa palengke kasama ang kanyang kapatid. Bumili siya ng mansanas at tinapay. Pagkatapos ay naglaro sila ng bola sa parke.")
                .orderIndex(4)
                .passingPercentage(75)
                .build();
        activityRepository.save(scActivity);

        // Add story comprehension questions
        createPangngalanStoryQuestions(scActivity);
    }

    private void createPangngalanMCQuestions(Activity activity) {
        Question q1 = Question.builder()
                .activity(activity)
                .questionText("Si _______ ay nagbabasa ng aklat.")
                .options(Arrays.asList("Kumakain", "Ana", "Malaki"))
                .correctAnswerIndex(1)
                .explanation("Ang \"Ana\" ay pangngalan na tumutukoy sa tao.")
                .orderIndex(1)
                .build();
        questionRepository.save(q1);

        Question q2 = Question.builder()
                .activity(activity)
                .questionText("Ang _______ ay tumatahol sa bakuran.")
                .options(Arrays.asList("Aso", "Tumakbo", "Mabait"))
                .correctAnswerIndex(0)
                .explanation("Ang \"Aso\" ay pangngalan na tumutukoy sa hayop.")
                .orderIndex(2)
                .build();
        questionRepository.save(q2);
    }

    private void createPangngalanDragDrop(Activity activity) {
        // Create categories
        List<DragDropCategory> categories = Arrays.asList(
            DragDropCategory.builder().activity(activity).categoryId("tao").name("Tao").colorClass("bg-primary").orderIndex(1).build(),
            DragDropCategory.builder().activity(activity).categoryId("bagay").name("Bagay").colorClass("bg-secondary").orderIndex(2).build(),
            DragDropCategory.builder().activity(activity).categoryId("hayop").name("Hayop").colorClass("bg-accent").orderIndex(3).build(),
            DragDropCategory.builder().activity(activity).categoryId("lugar").name("Lugar").colorClass("bg-success").orderIndex(4).build()
        );
        dragDropCategoryRepository.saveAll(categories);

        // Create items
        List<DragDropItem> items = Arrays.asList(
            DragDropItem.builder().activity(activity).text("pusa").correctCategory("hayop").orderIndex(1).build(),
            DragDropItem.builder().activity(activity).text("Juan").correctCategory("tao").orderIndex(2).build(),
            DragDropItem.builder().activity(activity).text("mesa").correctCategory("bagay").orderIndex(3).build(),
            DragDropItem.builder().activity(activity).text("simbahan").correctCategory("lugar").orderIndex(4).build(),
            DragDropItem.builder().activity(activity).text("guro").correctCategory("tao").orderIndex(5).build(),
            DragDropItem.builder().activity(activity).text("aklat").correctCategory("bagay").orderIndex(6).build(),
            DragDropItem.builder().activity(activity).text("parke").correctCategory("lugar").orderIndex(7).build()
        );
        dragDropItemRepository.saveAll(items);
    }

    private void createPangngalanMatchingPairs(Activity activity) {
        List<MatchingPair> pairs = Arrays.asList(
            MatchingPair.builder().activity(activity).leftText("Lamesa").rightText("Bagay").orderIndex(1).build(),
            MatchingPair.builder().activity(activity).leftText("Aso").rightText("Hayop").orderIndex(2).build(),
            MatchingPair.builder().activity(activity).leftText("Ana").rightText("Tao").orderIndex(3).build(),
            MatchingPair.builder().activity(activity).leftText("Palengke").rightText("Lugar").orderIndex(4).build()
        );
        matchingPairRepository.saveAll(pairs);
    }

    private void createPangngalanStoryQuestions(Activity activity) {
        Question q1 = Question.builder()
                .activity(activity)
                .questionText("Saan pumunta si Lito?")
                .options(Arrays.asList("Simbahan", "Palengke", "Paaralan"))
                .correctAnswerIndex(1)
                .explanation("Sa kwento, nabanggit na pumunta si Lito sa palengke.")
                .orderIndex(1)
                .build();
        questionRepository.save(q1);

        Question q2 = Question.builder()
                .activity(activity)
                .questionText("Ano ang dala nila sa parke?")
                .options(Arrays.asList("Aklat", "Bola", "Sapatos"))
                .correctAnswerIndex(1)
                .explanation("Sa kwento, naglaro sila ng bola sa parke.")
                .orderIndex(2)
                .build();
        questionRepository.save(q2);
    }

    // Placeholder methods for other lessons
    private void createPandiwaLesson(Phase phase) {
        Lesson lesson = Lesson.builder()
                .phase(phase)
                .title("Pandiwa (Verbs)")
                .description("Mga salitang nagsasaad ng kilos, galaw, o pangyayari")
                .orderIndex(2)
                .build();
        lessonRepository.save(lesson);
        // TODO: Implement slides and activities
    }

    private void createPanguriLesson(Phase phase) {
        Lesson lesson = Lesson.builder()
                .phase(phase)
                .title("Pang-uri (Adjectives)")
                .description("Mga salitang naglalarawan sa pangngalan o panghalip")
                .orderIndex(3)
                .build();
        lessonRepository.save(lesson);
        // TODO: Implement slides and activities
    }

    private void createKasingkahuluganKasalungatLesson(Phase phase) {
        Lesson lesson = Lesson.builder()
                .phase(phase)
                .title("Kasingkahulugan at Kasalungat")
                .description("Mga salitang magkapareho o magkaiba ang kahulugan")
                .orderIndex(1)
                .build();
        lessonRepository.save(lesson);
        // TODO: Implement slides and activities
    }
}
