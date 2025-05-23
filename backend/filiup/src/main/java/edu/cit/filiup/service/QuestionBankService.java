package edu.cit.filiup.service;

import edu.cit.filiup.entity.QuestionBankEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.entity.StoryEntity;
import edu.cit.filiup.repository.QuestionBankRepository;
import edu.cit.filiup.repository.UserRepository;
import edu.cit.filiup.repository.StoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class QuestionBankService {

    @Autowired
    private QuestionBankRepository questionBankRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Transactional
    public QuestionBankEntity createQuestion(QuestionBankEntity question, Integer userId, Long storyId) {
        UserEntity teacher = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Teacher not found"));

        StoryEntity story = storyRepository.findById(storyId)
                .orElseThrow(() -> new EntityNotFoundException("Story not found"));

        question.setCreatedBy(teacher);
        question.setStory(story);
        return questionBankRepository.save(question);
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
        return questionBankRepository.findByStoryStoryIdAndIsActiveTrue(storyId);
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