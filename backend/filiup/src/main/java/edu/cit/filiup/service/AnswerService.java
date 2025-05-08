package edu.cit.filiup.service;

import edu.cit.filiup.entity.AnswerEntity;
import edu.cit.filiup.entity.QuestionEntity;
import edu.cit.filiup.repository.AnswerRepository;
import edu.cit.filiup.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AnswerService {
    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;

    @Autowired
    public AnswerService(AnswerRepository answerRepository, QuestionRepository questionRepository) {
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
    }

    @Transactional
    public AnswerEntity createAnswer(AnswerEntity answerEntity, Long questionId) {
        QuestionEntity question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        answerEntity.setQuestion(question);
        return answerRepository.save(answerEntity);
    }

    public List<AnswerEntity> getAnswersByQuestion(Long questionId) {
        return answerRepository.findByQuestionQuestionId(questionId);
    }

    public Optional<AnswerEntity> getAnswerById(Long answerId) {
        return answerRepository.findById(answerId);
    }

    public List<AnswerEntity> getCorrectAnswers() {
        return answerRepository.findByIsCorrectTrue();
    }

    public List<AnswerEntity> getCorrectAnswersByQuestion(Long questionId) {
        return answerRepository.findByQuestionQuestionIdAndIsCorrectTrue(questionId);
    }

    public List<AnswerEntity> searchAnswersByText(String text) {
        return answerRepository.findByAnswerTextContainingIgnoreCase(text);
    }

    @Transactional
    public AnswerEntity updateAnswer(Long answerId, AnswerEntity updatedAnswer) {
        return answerRepository.findById(answerId)
                .map(existingAnswer -> {
                    existingAnswer.setAnswerText(updatedAnswer.getAnswerText());
                    existingAnswer.setIsCorrect(updatedAnswer.getIsCorrect());
                    existingAnswer.setExplanation(updatedAnswer.getExplanation());
                    return answerRepository.save(existingAnswer);
                })
                .orElseThrow(() -> new RuntimeException("Answer not found"));
    }

    @Transactional
    public void deleteAnswer(Long answerId) {
        answerRepository.deleteById(answerId);
    }

    @Transactional
    public AnswerEntity toggleAnswerCorrectness(Long answerId) {
        return answerRepository.findById(answerId)
                .map(answer -> {
                    answer.setIsCorrect(!answer.getIsCorrect());
                    return answerRepository.save(answer);
                })
                .orElseThrow(() -> new RuntimeException("Answer not found"));
    }

    @Transactional
    public void validateSingleCorrectAnswer(Long questionId) {
        List<AnswerEntity> correctAnswers = answerRepository.findByQuestionQuestionIdAndIsCorrectTrue(questionId);
        if (correctAnswers.size() > 1) {
            throw new RuntimeException("Multiple correct answers found for question. Only one correct answer is allowed.");
        }
    }
} 