package com.filiup.Filiup.service;

import com.filiup.Filiup.dto.activity.*;
import com.filiup.Filiup.entity.*;
import com.filiup.Filiup.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ActivityContentService {

    private final ActivityRepository activityRepository;
    private final QuestionRepository questionRepository;
    private final DragDropItemRepository dragDropItemRepository;
    private final DragDropCategoryRepository dragDropCategoryRepository;
    private final MatchingPairRepository matchingPairRepository;

    public ActivityContentResponse getActivityContent(UUID activityId) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        ActivityContentResponse.ActivityContentResponseBuilder builder = ActivityContentResponse.builder()
                .id(activity.getId())
                .activityType(activity.getActivityType())
                .title(activity.getTitle())
                .instructions(activity.getInstructions())
                .storyText(activity.getStoryText())
                .orderIndex(activity.getOrderIndex())
                .passingPercentage(activity.getPassingPercentage());

        // Load activity-specific content based on type
        switch (activity.getActivityType()) {
            case MULTIPLE_CHOICE:
            case STORY_COMPREHENSION:
                List<Question> questions = questionRepository.findByActivityIdOrderByOrderIndexAsc(activityId);
                builder.questions(questions.stream()
                        .map(this::mapToQuestionResponse)
                        .collect(Collectors.toList()));
                break;

            case DRAG_DROP:
                List<DragDropItem> items = dragDropItemRepository.findByActivityIdOrderByOrderIndexAsc(activityId);
                List<DragDropCategory> categories = dragDropCategoryRepository.findByActivityIdOrderByOrderIndexAsc(activityId);
                builder.dragDropItems(items.stream()
                        .map(this::mapToDragDropItemResponse)
                        .collect(Collectors.toList()))
                        .dragDropCategories(categories.stream()
                                .map(this::mapToDragDropCategoryResponse)
                                .collect(Collectors.toList()));
                break;

            case MATCHING_PAIRS:
                List<MatchingPair> pairs = matchingPairRepository.findByActivityIdOrderByOrderIndexAsc(activityId);
                builder.matchingPairs(pairs.stream()
                        .map(this::mapToMatchingPairResponse)
                        .collect(Collectors.toList()));
                break;
        }

        return builder.build();
    }

    private QuestionResponse mapToQuestionResponse(Question question) {
        return QuestionResponse.builder()
                .id(question.getId())
                .questionText(question.getQuestionText())
                .options(question.getOptions())
                .correctAnswerIndex(question.getCorrectAnswerIndex())
                .explanation(question.getExplanation())
                .orderIndex(question.getOrderIndex())
                .build();
    }

    private DragDropItemResponse mapToDragDropItemResponse(DragDropItem item) {
        return DragDropItemResponse.builder()
                .id(item.getId())
                .text(item.getText())
                .correctCategory(item.getCorrectCategory())
                .orderIndex(item.getOrderIndex())
                .build();
    }

    private DragDropCategoryResponse mapToDragDropCategoryResponse(DragDropCategory category) {
        return DragDropCategoryResponse.builder()
                .id(category.getId())
                .categoryId(category.getCategoryId())
                .name(category.getName())
                .colorClass(category.getColorClass())
                .orderIndex(category.getOrderIndex())
                .build();
    }

    private MatchingPairResponse mapToMatchingPairResponse(MatchingPair pair) {
        return MatchingPairResponse.builder()
                .id(pair.getId())
                .leftText(pair.getLeftText())
                .rightText(pair.getRightText())
                .orderIndex(pair.getOrderIndex())
                .build();
    }
}
