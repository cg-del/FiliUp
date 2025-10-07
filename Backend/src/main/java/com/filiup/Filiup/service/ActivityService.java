package com.filiup.Filiup.service;

import com.filiup.Filiup.dto.ActivityCreateRequest;
import com.filiup.Filiup.dto.ActivityResponse;
import com.filiup.Filiup.entity.*;
import com.filiup.Filiup.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final LessonRepository lessonRepository;
    private final QuestionRepository questionRepository;
    private final DragDropCategoryRepository dragDropCategoryRepository;
    private final DragDropItemRepository dragDropItemRepository;
    private final MatchingPairRepository matchingPairRepository;

    public List<ActivityResponse> getAllActivities() {
        List<Activity> activities = activityRepository.findAllByOrderByOrderIndexAsc();
        return activities.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ActivityResponse> getActivitiesByLesson(UUID lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + lessonId));
        
        return lesson.getActivities().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public ActivityResponse getActivityById(UUID id) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + id));
        return convertToResponse(activity);
    }

    public ActivityResponse createActivity(ActivityCreateRequest request) {
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + request.getLessonId()));

        // Create activity
        Activity activity = Activity.builder()
                .lesson(lesson)
                .activityType(request.getActivityType())
                .title(request.getTitle())
                .instructions(request.getInstructions())
                .storyText(request.getStoryText())
                .orderIndex(request.getOrderIndex())
                .passingPercentage(request.getPassingPercentage() != null ? request.getPassingPercentage() : 75)
                .build();

        // Ensure order index is set correctly
        if (activity.getOrderIndex() == null) {
            Integer maxOrder = activityRepository.findMaxOrderIndexByLesson(lesson.getId());
            activity.setOrderIndex(maxOrder != null ? maxOrder + 1 : 1);
        }

        activity = activityRepository.save(activity);

        // Create activity-specific content
        if (request.getContent() != null) {
            createActivityContent(activity, request.getContent());
        }

        log.info("Created new activity: {} of type: {}", activity.getTitle(), activity.getActivityType());
        return convertToResponse(activity);
    }

    public ActivityResponse updateActivity(UUID id, ActivityCreateRequest request) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + id));

        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + request.getLessonId()));

        activity.setLesson(lesson);
        activity.setActivityType(request.getActivityType());
        activity.setTitle(request.getTitle());
        activity.setInstructions(request.getInstructions());
        activity.setStoryText(request.getStoryText());
        activity.setOrderIndex(request.getOrderIndex());
        activity.setPassingPercentage(request.getPassingPercentage() != null ? request.getPassingPercentage() : 75);

        // Clear existing content using entity relationships (this will trigger orphanRemoval)
        activity.getQuestions().clear();
        activity.getDragDropCategories().clear();
        activity.getDragDropItems().clear();
        activity.getMatchingPairs().clear();

        // Add new content to the entity collections
        if (request.getContent() != null) {
            createActivityContentUsingEntity(activity, request.getContent());
        }

        // Save the activity (this will cascade to save new content and delete orphaned ones)
        activity = activityRepository.save(activity);

        log.info("Updated activity: {}", activity.getTitle());
        return convertToResponse(activity);
    }

    public void deleteActivity(UUID id) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + id));

        activityRepository.delete(activity);
        log.info("Deleted activity: {}", activity.getTitle());
    }

    public void reorderActivity(UUID id, Integer newOrderIndex) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + id));

        activity.setOrderIndex(newOrderIndex);
        activityRepository.save(activity);
        log.info("Reordered activity: {} to position {}", activity.getTitle(), newOrderIndex);
    }

    private void createActivityContent(Activity activity, ActivityCreateRequest.ActivityContentDto content) {
        // Create questions for Multiple Choice and Story Comprehension
        if (content.getQuestions() != null && !content.getQuestions().isEmpty()) {
            for (ActivityCreateRequest.QuestionDto questionDto : content.getQuestions()) {
                Question question = Question.builder()
                        .activity(activity)
                        .questionText(questionDto.getQuestionText())
                        .options(questionDto.getOptions())
                        .correctAnswerIndex(questionDto.getCorrectAnswerIndex())
                        .explanation(questionDto.getExplanation())
                        .orderIndex(questionDto.getOrderIndex())
                        .build();
                questionRepository.save(question);
            }
        }

        // Create drag drop categories and items
        if (content.getCategories() != null && !content.getCategories().isEmpty()) {
            for (ActivityCreateRequest.DragDropCategoryDto categoryDto : content.getCategories()) {
                DragDropCategory category = DragDropCategory.builder()
                        .activity(activity)
                        .categoryId(categoryDto.getCategoryId())
                        .name(categoryDto.getName())
                        .colorClass(categoryDto.getColorClass())
                        .orderIndex(categoryDto.getOrderIndex())
                        .build();
                dragDropCategoryRepository.save(category);
            }
        }

        if (content.getItems() != null && !content.getItems().isEmpty()) {
            for (ActivityCreateRequest.DragDropItemDto itemDto : content.getItems()) {
                DragDropItem item = DragDropItem.builder()
                        .activity(activity)
                        .text(itemDto.getText())
                        .correctCategory(itemDto.getCorrectCategory())
                        .orderIndex(itemDto.getOrderIndex())
                        .build();
                dragDropItemRepository.save(item);
            }
        }

        // Create matching pairs
        if (content.getPairs() != null && !content.getPairs().isEmpty()) {
            for (ActivityCreateRequest.MatchingPairDto pairDto : content.getPairs()) {
                MatchingPair pair = MatchingPair.builder()
                        .activity(activity)
                        .leftText(pairDto.getLeftText())
                        .rightText(pairDto.getRightText())
                        .orderIndex(pairDto.getOrderIndex())
                        .build();
                matchingPairRepository.save(pair);
            }
        }
    }

    private void createActivityContentUsingEntity(Activity activity, ActivityCreateRequest.ActivityContentDto content) {
        // Create questions for Multiple Choice and Story Comprehension
        if (content.getQuestions() != null && !content.getQuestions().isEmpty()) {
            for (ActivityCreateRequest.QuestionDto questionDto : content.getQuestions()) {
                Question question = Question.builder()
                        .activity(activity)
                        .questionText(questionDto.getQuestionText())
                        .options(questionDto.getOptions())
                        .correctAnswerIndex(questionDto.getCorrectAnswerIndex())
                        .explanation(questionDto.getExplanation())
                        .orderIndex(questionDto.getOrderIndex())
                        .build();
                activity.getQuestions().add(question);
            }
        }

        // Create drag drop categories and items
        if (content.getCategories() != null && !content.getCategories().isEmpty()) {
            for (ActivityCreateRequest.DragDropCategoryDto categoryDto : content.getCategories()) {
                DragDropCategory category = DragDropCategory.builder()
                        .activity(activity)
                        .categoryId(categoryDto.getCategoryId())
                        .name(categoryDto.getName())
                        .colorClass(categoryDto.getColorClass())
                        .orderIndex(categoryDto.getOrderIndex())
                        .build();
                activity.getDragDropCategories().add(category);
            }
        }

        if (content.getItems() != null && !content.getItems().isEmpty()) {
            for (ActivityCreateRequest.DragDropItemDto itemDto : content.getItems()) {
                DragDropItem item = DragDropItem.builder()
                        .activity(activity)
                        .text(itemDto.getText())
                        .correctCategory(itemDto.getCorrectCategory())
                        .orderIndex(itemDto.getOrderIndex())
                        .build();
                activity.getDragDropItems().add(item);
            }
        }

        // Create matching pairs
        if (content.getPairs() != null && !content.getPairs().isEmpty()) {
            for (ActivityCreateRequest.MatchingPairDto pairDto : content.getPairs()) {
                MatchingPair pair = MatchingPair.builder()
                        .activity(activity)
                        .leftText(pairDto.getLeftText())
                        .rightText(pairDto.getRightText())
                        .orderIndex(pairDto.getOrderIndex())
                        .build();
                activity.getMatchingPairs().add(pair);
            }
        }
    }

    private void deleteActivityContent(Activity activity) {
        questionRepository.deleteByActivity(activity);
        dragDropCategoryRepository.deleteByActivity(activity);
        dragDropItemRepository.deleteByActivity(activity);
        matchingPairRepository.deleteByActivity(activity);
    }

    private ActivityResponse convertToResponse(Activity activity) {
        // Convert questions
        List<ActivityResponse.QuestionDto> questionDtos = activity.getQuestions().stream()
                .map(question -> ActivityResponse.QuestionDto.builder()
                        .id(question.getId())
                        .questionText(question.getQuestionText())
                        .options(question.getOptions())
                        .correctAnswerIndex(question.getCorrectAnswerIndex())
                        .explanation(question.getExplanation())
                        .orderIndex(question.getOrderIndex())
                        .build())
                .collect(Collectors.toList());

        // Convert drag drop categories
        List<ActivityResponse.DragDropCategoryDto> categoryDtos = activity.getDragDropCategories().stream()
                .map(category -> ActivityResponse.DragDropCategoryDto.builder()
                        .id(category.getId())
                        .categoryId(category.getCategoryId())
                        .name(category.getName())
                        .colorClass(category.getColorClass())
                        .orderIndex(category.getOrderIndex())
                        .build())
                .collect(Collectors.toList());

        // Convert drag drop items
        List<ActivityResponse.DragDropItemDto> itemDtos = activity.getDragDropItems().stream()
                .map(item -> ActivityResponse.DragDropItemDto.builder()
                        .id(item.getId())
                        .text(item.getText())
                        .correctCategory(item.getCorrectCategory())
                        .orderIndex(item.getOrderIndex())
                        .build())
                .collect(Collectors.toList());

        // Convert matching pairs
        List<ActivityResponse.MatchingPairDto> pairDtos = activity.getMatchingPairs().stream()
                .map(pair -> ActivityResponse.MatchingPairDto.builder()
                        .id(pair.getId())
                        .leftText(pair.getLeftText())
                        .rightText(pair.getRightText())
                        .orderIndex(pair.getOrderIndex())
                        .build())
                .collect(Collectors.toList());

        ActivityResponse.ActivityContentDto contentDto = ActivityResponse.ActivityContentDto.builder()
                .questions(questionDtos)
                .categories(categoryDtos)
                .items(itemDtos)
                .pairs(pairDtos)
                .build();

        return ActivityResponse.builder()
                .id(activity.getId())
                .lessonId(activity.getLesson().getId())
                .activityType(activity.getActivityType())
                .title(activity.getTitle())
                .instructions(activity.getInstructions())
                .storyText(activity.getStoryText())
                .orderIndex(activity.getOrderIndex())
                .passingPercentage(activity.getPassingPercentage())
                .createdAt(activity.getCreatedAt())
                .content(contentDto)
                .build();
    }
}
