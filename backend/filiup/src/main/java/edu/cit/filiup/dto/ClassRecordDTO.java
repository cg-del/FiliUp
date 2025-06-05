package edu.cit.filiup.dto;

import java.util.List;
import java.util.Map;

public class ClassRecordDTO {
    private List<StudentRecordDTO> students;
    private List<String> quizTitles;
    private Map<String, String> classInfo; // classId -> className
    private Map<String, QuizMetadataDTO> quizMetadata; // quizTitle -> quiz metadata

    public static class StudentRecordDTO {
        private String studentId;
        private String studentName;
        private Map<String, ScoreDTO> quizScores; // quizTitle -> score info

        public static class ScoreDTO {
            private Integer score;
            private Integer maxScore;
            private Double percentage;
            private String storyTitle;
            private String storyId;
            private String classId;
            private String className;
            
            public ScoreDTO() {}
            
            public ScoreDTO(Double score, Integer maxScore) {
                this.score = score != null ? score.intValue() : null;
                this.maxScore = maxScore;
                this.percentage = (score != null && maxScore != null && maxScore > 0) 
                    ? score / maxScore * 100 : 0.0;
            }

            public ScoreDTO(Double score, Integer maxScore, String storyTitle, String storyId, String classId, String className) {
                this(score, maxScore);
                this.storyTitle = storyTitle;
                this.storyId = storyId;
                this.classId = classId;
                this.className = className;
            }

            // Getters and setters
            public Integer getScore() { return score; }
            public void setScore(Integer score) { this.score = score; }
            public Integer getMaxScore() { return maxScore; }
            public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }
            public Double getPercentage() { return percentage; }
            public void setPercentage(Double percentage) { this.percentage = percentage; }
            public String getStoryTitle() { return storyTitle; }
            public void setStoryTitle(String storyTitle) { this.storyTitle = storyTitle; }
            public String getStoryId() { return storyId; }
            public void setStoryId(String storyId) { this.storyId = storyId; }
            public String getClassId() { return classId; }
            public void setClassId(String classId) { this.classId = classId; }
            public String getClassName() { return className; }
            public void setClassName(String className) { this.className = className; }
        }

        // Getters and setters
        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        public Map<String, ScoreDTO> getQuizScores() { return quizScores; }
        public void setQuizScores(Map<String, ScoreDTO> quizScores) { this.quizScores = quizScores; }
    }

    public static class QuizMetadataDTO {
        private String quizTitle;
        private String storyTitle;
        private String storyId;
        private String classId;
        private String className;

        public QuizMetadataDTO() {}

        public QuizMetadataDTO(String quizTitle, String storyTitle, String storyId, String classId, String className) {
            this.quizTitle = quizTitle;
            this.storyTitle = storyTitle;
            this.storyId = storyId;
            this.classId = classId;
            this.className = className;
        }

        // Getters and setters
        public String getQuizTitle() { return quizTitle; }
        public void setQuizTitle(String quizTitle) { this.quizTitle = quizTitle; }
        public String getStoryTitle() { return storyTitle; }
        public void setStoryTitle(String storyTitle) { this.storyTitle = storyTitle; }
        public String getStoryId() { return storyId; }
        public void setStoryId(String storyId) { this.storyId = storyId; }
        public String getClassId() { return classId; }
        public void setClassId(String classId) { this.classId = classId; }
        public String getClassName() { return className; }
        public void setClassName(String className) { this.className = className; }
    }

    // Getters and setters
    public List<StudentRecordDTO> getStudents() { return students; }
    public void setStudents(List<StudentRecordDTO> students) { this.students = students; }
    public List<String> getQuizTitles() { return quizTitles; }
    public void setQuizTitles(List<String> quizTitles) { this.quizTitles = quizTitles; }
    public Map<String, String> getClassInfo() { return classInfo; }
    public void setClassInfo(Map<String, String> classInfo) { this.classInfo = classInfo; }
    public Map<String, QuizMetadataDTO> getQuizMetadata() { return quizMetadata; }
    public void setQuizMetadata(Map<String, QuizMetadataDTO> quizMetadata) { this.quizMetadata = quizMetadata; }
} 