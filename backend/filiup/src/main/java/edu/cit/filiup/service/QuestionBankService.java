package edu.cit.filiup.service;

import edu.cit.filiup.entity.QuestionBankEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.entity.StoryEntity;
import edu.cit.filiup.entity.CommonStoryEntity;
import edu.cit.filiup.repository.QuestionBankRepository;
import edu.cit.filiup.repository.UserRepository;
import edu.cit.filiup.repository.StoryRepository;
import edu.cit.filiup.repository.CommonStoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class QuestionBankService {

    @Autowired
    private QuestionBankRepository questionBankRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private CommonStoryRepository commonStoryRepository;

    @Transactional
    public QuestionBankEntity createQuestion(QuestionBankEntity question) {
        try {
            // Validate story existence based on type
            if (question.getStoryType() == QuestionBankEntity.StoryType.COMMON) {
                CommonStoryEntity commonStory = commonStoryRepository.findById(question.getStoryId())
                    .orElseThrow(() -> new EntityNotFoundException(
                        String.format("Common story not found with ID: %d", question.getStoryId())
                    ));
            } else if (question.getStoryType() == QuestionBankEntity.StoryType.CLASS) {
                StoryEntity story = storyRepository.findById(question.getStoryId())
                    .orElseThrow(() -> new EntityNotFoundException(
                        String.format("Class story not found with ID: %d", question.getStoryId())
                    ));
            } else {
                throw new IllegalArgumentException("Invalid story type");
            }

            // Get the default admin user (ID 1) or handle null case
            UserEntity defaultUser = userRepository.findById(1)
                    .orElseThrow(() -> new RuntimeException("Default admin user not found"));

            question.setCreatedBy(defaultUser);
            question.setIsActive(true);
            question.setCreatedAt(LocalDateTime.now());
            
            return questionBankRepository.save(question);
        } catch (EntityNotFoundException e) {
            throw new EntityNotFoundException(
                String.format("Failed to create question: %s", e.getMessage())
            );
        } catch (Exception e) {
            throw new RuntimeException(
                String.format("Failed to create question: %s", e.getMessage())
            );
        }
    }

    @Transactional(readOnly = true)
    public List<QuestionBankEntity> getAllQuestions() {
        return questionBankRepository.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<QuestionBankEntity> getQuestionsByTeacher(Integer teacherId) {
        return questionBankRepository.findByCreatedByUserIdAndIsActiveTrue(teacherId);
    }

    @Transactional(readOnly = true)
    public List<QuestionBankEntity> getQuestionsByStory(Long storyId) {
        // First try to find questions for common stories
        List<QuestionBankEntity> commonQuestions = questionBankRepository.findByStoryIdAndStoryTypeAndIsActiveTrue(
            storyId, 
            QuestionBankEntity.StoryType.COMMON
        );
        if (!commonQuestions.isEmpty()) {
            return commonQuestions;
        }
        
        // If no common story questions found, try class story questions
        return questionBankRepository.findByStoryIdAndStoryTypeAndIsActiveTrue(
            storyId, 
            QuestionBankEntity.StoryType.CLASS
        );
    }

    @Transactional(readOnly = true)
    public QuestionBankEntity getQuestionById(Long questionId) {
        return questionBankRepository.findById(questionId)
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));
    }

    @Transactional
    public QuestionBankEntity updateQuestion(Long questionId, QuestionBankEntity updatedQuestion) {
        QuestionBankEntity existingQuestion = getQuestionById(questionId);
        
        existingQuestion.setTitle(updatedQuestion.getTitle());
        existingQuestion.setQuestionText(updatedQuestion.getQuestionText());
        existingQuestion.setOptions(updatedQuestion.getOptions());
        existingQuestion.setCorrectAnswer(updatedQuestion.getCorrectAnswer());
        
        return questionBankRepository.save(existingQuestion);
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        QuestionBankEntity question = getQuestionById(questionId);
        question.setIsActive(false);
        questionBankRepository.save(question);
    }
} 