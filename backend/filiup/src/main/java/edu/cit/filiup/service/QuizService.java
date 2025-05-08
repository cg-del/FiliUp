package edu.cit.filiup.service;

import edu.cit.filiup.entity.QuizEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.entity.QuestionEntity;
import edu.cit.filiup.repository.QuizRepository;
import edu.cit.filiup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class QuizService {
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;

    @Autowired
    public QuizService(QuizRepository quizRepository, UserRepository userRepository) {
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public QuizEntity createQuiz(QuizEntity quizEntity, int userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!"TEACHER".equals(user.getUserRole())) {
            throw new RuntimeException("Only teachers can create quizzes");
        }

        quizEntity.setCreatedBy(user);
        quizEntity.setIsActive(true);
        
        // Calculate total points from questions
        if (quizEntity.getQuestions() != null) {
            int totalPoints = quizEntity.getQuestions().stream()
                    .mapToInt(question -> question.getPoints())
                    .sum();
            quizEntity.setTotalPoints(totalPoints);
        }

        return quizRepository.save(quizEntity);
    }

    public List<QuizEntity> getAllQuizzes() {
        return quizRepository.findByIsActiveTrue();
    }

    public Optional<QuizEntity> getQuizById(Long quizId) {
        return quizRepository.findById(quizId)
                .filter(QuizEntity::getIsActive);
    }

    public List<QuizEntity> getQuizzesByTeacher(int userId) {
        return quizRepository.findByCreatedByUserIdAndIsActiveTrue(userId);
    }

    public List<QuizEntity> getQuizzesByDifficulty(QuizEntity.DifficultyLevel difficultyLevel) {
        return quizRepository.findByDifficultyLevelAndIsActiveTrue(difficultyLevel);
    }

    public List<QuizEntity> getQuizzesByCategory(QuizEntity.QuizCategory category) {
        return quizRepository.findByCategoryAndIsActiveTrue(category);
    }

    @Transactional
    public QuizEntity updateQuiz(Long quizId, QuizEntity updatedQuiz) {
        return quizRepository.findById(quizId)
                .filter(QuizEntity::getIsActive)
                .map(existingQuiz -> {
                    existingQuiz.setTitle(updatedQuiz.getTitle());
                    existingQuiz.setDescription(updatedQuiz.getDescription());
                    existingQuiz.setDifficultyLevel(updatedQuiz.getDifficultyLevel());
                    existingQuiz.setCategory(updatedQuiz.getCategory());
                    existingQuiz.setTimeLimitMinutes(updatedQuiz.getTimeLimitMinutes());
                    
                    // Update questions if provided
                    if (updatedQuiz.getQuestions() != null) {
                        existingQuiz.getQuestions().clear();
                        updatedQuiz.getQuestions().forEach(existingQuiz::addQuestion);
                        
                        // Recalculate total points
                        int totalPoints = existingQuiz.getQuestions().stream()
                                .mapToInt(question -> question.getPoints())
                                .sum();
                        existingQuiz.setTotalPoints(totalPoints);
                    }
                    
                    return quizRepository.save(existingQuiz);
                })
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
    }

    @Transactional
    public void deleteQuiz(Long quizId) {
        quizRepository.findById(quizId)
                .filter(QuizEntity::getIsActive)
                .ifPresent(quiz -> {
                    quiz.setIsActive(false);
                    quizRepository.save(quiz);
                });
    }

    @Transactional
    public QuizEntity addQuestionToQuiz(Long quizId, QuestionEntity question) {
        QuizEntity quiz = quizRepository.findById(quizId)
                .filter(QuizEntity::getIsActive)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        
        quiz.addQuestion(question);
        
        // Update total points
        int totalPoints = quiz.getQuestions().stream()
                .mapToInt(QuestionEntity::getPoints)
                .sum();
        quiz.setTotalPoints(totalPoints);
        
        return quizRepository.save(quiz);
    }

    @Transactional
    public QuizEntity removeQuestionFromQuiz(Long quizId, Long questionId) {
        QuizEntity quiz = quizRepository.findById(quizId)
                .filter(QuizEntity::getIsActive)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        
        quiz.getQuestions().stream()
                .filter(q -> q.getQuestionId().equals(questionId))
                .findFirst()
                .ifPresent(quiz::removeQuestion);
        
        // Update total points
        int totalPoints = quiz.getQuestions().stream()
                .mapToInt(QuestionEntity::getPoints)
                .sum();
        quiz.setTotalPoints(totalPoints);
        
        return quizRepository.save(quiz);
    }
}
