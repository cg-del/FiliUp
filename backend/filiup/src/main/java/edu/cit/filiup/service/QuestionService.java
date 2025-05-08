package edu.cit.filiup.service;

import edu.cit.filiup.entity.QuestionEntity;
import edu.cit.filiup.entity.AnswerEntity;
import edu.cit.filiup.entity.QuizEntity;
import edu.cit.filiup.repository.QuestionRepository;
import edu.cit.filiup.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {
    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;

    @Autowired
    public QuestionService(QuestionRepository questionRepository, QuizRepository quizRepository) {
        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
    }

    @Transactional
    public QuestionEntity createQuestion(QuestionEntity questionEntity, Long quizId) {
        QuizEntity quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        questionEntity.setQuiz(quiz);
        return questionRepository.save(questionEntity);
    }

    public List<QuestionEntity> getQuestionsByQuiz(Long quizId) {
        return questionRepository.findByQuizQuizId(quizId);
    }

    public Optional<QuestionEntity> getQuestionById(Long questionId) {
        return questionRepository.findById(questionId);
    }

    public List<QuestionEntity> getQuestionsByType(QuestionEntity.QuestionType questionType) {
        return questionRepository.findByQuestionType(questionType);
    }

    public List<QuestionEntity> getQuestionsByQuizAndType(Long quizId, QuestionEntity.QuestionType questionType) {
        return questionRepository.findByQuizQuizIdAndQuestionType(quizId, questionType);
    }

    public List<QuestionEntity> getQuestionsByPoints(Integer points) {
        return questionRepository.findByPointsGreaterThanEqual(points);
    }

    @Transactional
    public QuestionEntity updateQuestion(Long questionId, QuestionEntity updatedQuestion) {
        return questionRepository.findById(questionId)
                .map(existingQuestion -> {
                    existingQuestion.setQuestionText(updatedQuestion.getQuestionText());
                    existingQuestion.setPoints(updatedQuestion.getPoints());
                    existingQuestion.setQuestionType(updatedQuestion.getQuestionType());
                    existingQuestion.setExplanation(updatedQuestion.getExplanation());
                    return questionRepository.save(existingQuestion);
                })
                .orElseThrow(() -> new RuntimeException("Question not found"));
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        questionRepository.deleteById(questionId);
    }

    @Transactional
    public QuestionEntity addAnswerToQuestion(Long questionId, AnswerEntity answer) {
        QuestionEntity question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        question.addAnswer(answer);
        return questionRepository.save(question);
    }

    @Transactional
    public QuestionEntity removeAnswerFromQuestion(Long questionId, Long answerId) {
        QuestionEntity question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        question.getAnswers().stream()
                .filter(a -> a.getAnswerId().equals(answerId))
                .findFirst()
                .ifPresent(question::removeAnswer);

        return questionRepository.save(question);
    }

    @Transactional
    public QuestionEntity updateAnswer(Long questionId, Long answerId, AnswerEntity updatedAnswer) {
        QuestionEntity question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        question.getAnswers().stream()
                .filter(a -> a.getAnswerId().equals(answerId))
                .findFirst()
                .ifPresent(answer -> {
                    answer.setAnswerText(updatedAnswer.getAnswerText());
                    answer.setIsCorrect(updatedAnswer.getIsCorrect());
                    answer.setExplanation(updatedAnswer.getExplanation());
                });

        return questionRepository.save(question);
    }
} 