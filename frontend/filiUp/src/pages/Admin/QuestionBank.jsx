import { Add as AddIcon, ArrowBack as ArrowBackIcon, Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    Paper,
    TextField,
    Typography,
    alpha,
    useTheme
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const QuestionBank = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [questions, setQuestions] = useState([]);
    const [storyNames, setStoryNames] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: ''
    });
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [selectedQuestionForPreview, setSelectedQuestionForPreview] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const theme = useTheme();

    // Check if user is admin
    if (!user || user.userRole !== 'ADMIN') {
        return (
            <Box sx={{ p: 4 }}>
                <Typography color="error">Access denied. Admin privileges required.</Typography>
            </Box>
        );
    }

    // Get access token from localStorage
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        navigate('/login');
        return null;
    }

    // Configure axios defaults
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    axios.defaults.headers.common['Content-Type'] = 'application/json';

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchStoryName = async (storyId, storyType) => {
        try {
            const endpoint = storyType === 'COMMON' 
                ? `http://localhost:8080/api/common-stories/${storyId}`
                : `http://localhost:8080/api/stories/${storyId}`;
            
            const response = await axios.get(endpoint);
            return response.data.title;
        } catch (error) {
            console.error(`Error fetching story name for ID ${storyId}:`, error);
            return 'Unknown Story';
        }
    };

    const fetchQuestions = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/question-bank');
            const questionsData = response.data;
            setQuestions(questionsData);
            
            // Fetch story names for all questions
            const storyNamesMap = {};
            for (const question of questionsData) {
                const storyName = await fetchStoryName(question.storyId, question.storyType);
                storyNamesMap[`${question.storyType}-${question.storyId}`] = storyName;
            }
            setStoryNames(storyNamesMap);
            
            setLoading(false);
            setError('');
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem('accessToken');
                navigate('/login');
            } else {
                setError('Failed to load questions. Please try again.');
            }
            setLoading(false);
        }
    };

    const handleOpenDialog = (question = null) => {
        if (question) {
            setSelectedQuestion(question);
            setFormData({
                title: question.title,
                questionText: question.questionText,
                options: JSON.parse(question.options),
                correctAnswer: question.correctAnswer
            });
        } else {
            setSelectedQuestion(null);
            setFormData({
                title: '',
                questionText: '',
                options: ['', '', '', ''],
                correctAnswer: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedQuestion(null);
    };

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        if (name === 'options') {
            const newOptions = [...formData.options];
            newOptions[index] = value;
            setFormData(prev => ({
                ...prev,
                options: newOptions
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const requestData = {
                ...formData,
                options: JSON.stringify(formData.options)
            };

            if (selectedQuestion) {
                await axios.put(
                    `http://localhost:8080/api/question-bank/${selectedQuestion.questionId}`,
                    requestData
                );
            } else {
                await axios.post(
                    'http://localhost:8080/api/question-bank',
                    requestData
                );
            }
            handleCloseDialog();
            fetchQuestions();
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem('accessToken');
                navigate('/login');
            } else {
                setError('Failed to save question. Please try again.');
            }
        }
    };

    const handleDelete = async (questionId) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            try {
                await axios.delete(`http://localhost:8080/api/question-bank/${questionId}`);
                fetchQuestions();
            } catch (error) {
                if (error.response?.status === 401) {
                    localStorage.removeItem('accessToken');
                    navigate('/login');
                } else {
                    setError('Failed to delete question. Please try again.');
                }
            }
        }
    };

    const handlePreviewQuestion = (question) => {
        setSelectedQuestionForPreview(question);
        setPreviewDialogOpen(true);
    };

    const handleAnswerSelect = (answer) => {
        setSelectedAnswer(answer);
        setShowFeedback(true);
        setIsCorrect(answer === selectedQuestionForPreview.correctAnswer);
    };

    const handleClosePreview = () => {
        setPreviewDialogOpen(false);
        setSelectedAnswer('');
        setShowFeedback(false);
        setIsCorrect(false);
    };

    const handleAddQuestion = (storyId, storyType) => {
        navigate(`/admin/story-questions/${storyId}/${storyType}`);
    };

    // Filter questions based on search query
    const filteredQuestions = questions.filter(question =>
        question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.questionText.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                            },
                            mr: 2
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4">Question Bank</Typography>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />

            <Paper sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <Box sx={{ 
                    p: 2, 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="h6">Questions List</Typography>
                    <Typography variant="subtitle1">Total Questions: {filteredQuestions.length}</Typography>
                </Box>
                <List>
                    {filteredQuestions.map((question) => (
                        <ListItem
                            key={question.questionId}
                            sx={{
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                '&:last-child': {
                                    borderBottom: 'none'
                                },
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.04)
                                },
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'stretch'
                            }}
                        >
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start',
                                width: '100%',
                                mb: 1
                            }}>
                                <Box>
                                    <Typography variant="h6" color="primary">
                                        {question.title}
                                    </Typography>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Story: {storyNames[`${question.storyType}-${question.storyId}`] || 'Loading...'} 
                                        ({question.storyType === 'COMMON' ? 'Common Story' : 'Class Story'})
                                    </Typography>
                                </Box>
                                <Box>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleAddQuestion(question.storyId, question.storyType)}
                                        sx={{ mr: 1 }}
                                        color="primary"
                                    >
                                        <AddIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handlePreviewQuestion(question)}
                                        sx={{ mr: 1 }}
                                        color="primary"
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog(question)}
                                        sx={{ mr: 1 }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(question.questionId)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                            <Box sx={{ width: '100%' }}>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    {question.questionText}
                                </Typography>
                                <Box sx={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(2, 1fr)', 
                                    gap: 1,
                                    mt: 1
                                }}>
                                    {JSON.parse(question.options).map((option, index) => (
                                        <Typography 
                                            key={index} 
                                            variant="body2" 
                                            color="textSecondary"
                                            sx={{
                                                p: 1,
                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                borderRadius: 1
                                            }}
                                        >
                                            {String.fromCharCode(65 + index)}. {option}
                                        </Typography>
                                    ))}
                                </Box>
                                <Typography 
                                    variant="body2" 
                                    color="primary" 
                                    sx={{ 
                                        mt: 1,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Correct Answer: {question.correctAnswer}
                                </Typography>
                            </Box>
                        </ListItem>
                    ))}
                </List>
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedQuestion ? 'Edit Question' : 'Add New Question'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            name="title"
                            label="Title"
                            value={formData.title}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                            required
                        />
                        <TextField
                            fullWidth
                            name="questionText"
                            label="Question Text"
                            multiline
                            rows={3}
                            value={formData.questionText}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                            required
                        />
                        {formData.options.map((option, index) => (
                            <TextField
                                key={index}
                                fullWidth
                                name="options"
                                label={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => handleInputChange(e, index)}
                                sx={{ mb: 2 }}
                                required
                            />
                        ))}
                        <TextField
                            fullWidth
                            name="correctAnswer"
                            label="Correct Answer"
                            value={formData.correctAnswer}
                            onChange={handleInputChange}
                            required
                            helperText="Enter the correct answer text"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {selectedQuestion ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog 
                open={previewDialogOpen} 
                onClose={handleClosePreview}
                maxWidth="md"
                fullWidth
            >
                {selectedQuestionForPreview && (
                    <>
                        <DialogTitle>
                            <Typography variant="h5" component="div">
                                {selectedQuestionForPreview.title}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                Story: {storyNames[`${selectedQuestionForPreview.storyType}-${selectedQuestionForPreview.storyId}`] || 'Loading...'}
                            </Typography>
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ mt: 2 }}>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: 2,
                                        color: 'primary.main',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Question:
                                </Typography>
                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        mb: 3,
                                        fontSize: '1.1rem',
                                        lineHeight: 1.6
                                    }}
                                >
                                    {selectedQuestionForPreview.questionText}
                                </Typography>

                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: 2,
                                        color: 'primary.main',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Select your answer:
                                </Typography>
                                <Box sx={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(2, 1fr)', 
                                    gap: 2,
                                    mb: 3
                                }}>
                                    {JSON.parse(selectedQuestionForPreview.options).map((option, index) => (
                                        <Paper
                                            key={index}
                                            elevation={1}
                                            onClick={() => !showFeedback && handleAnswerSelect(option)}
                                            sx={{
                                                p: 2,
                                                cursor: showFeedback ? 'default' : 'pointer',
                                                bgcolor: selectedAnswer === option 
                                                    ? (isCorrect ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1))
                                                    : alpha(theme.palette.primary.main, 0.05),
                                                border: '1px solid',
                                                borderColor: selectedAnswer === option 
                                                    ? (isCorrect ? 'success.main' : 'error.main')
                                                    : 'divider',
                                                '&:hover': {
                                                    bgcolor: !showFeedback && alpha(theme.palette.primary.main, 0.1)
                                                }
                                            }}
                                        >
                                            <Typography 
                                                variant="body1"
                                                color={selectedAnswer === option 
                                                    ? (isCorrect ? 'success.main' : 'error.main')
                                                    : 'text.primary'}
                                            >
                                                {String.fromCharCode(65 + index)}. {option}
                                            </Typography>
                                        </Paper>
                                    ))}
                                </Box>

                                {showFeedback && (
                                    <Box sx={{ mt: 2 }}>
                                        <Paper
                                            elevation={1}
                                            sx={{
                                                p: 2,
                                                bgcolor: isCorrect 
                                                    ? alpha(theme.palette.success.main, 0.1)
                                                    : alpha(theme.palette.error.main, 0.1),
                                                border: '1px solid',
                                                borderColor: isCorrect ? 'success.main' : 'error.main'
                                            }}
                                        >
                                            <Typography 
                                                variant="h6" 
                                                color={isCorrect ? 'success.main' : 'error.main'}
                                                sx={{ mb: 1 }}
                                            >
                                                {isCorrect ? 'Correct!' : 'Incorrect!'}
                                            </Typography>
                                            <Typography variant="body1">
                                                {isCorrect 
                                                    ? 'Great job! You selected the correct answer.'
                                                    : `The correct answer is: ${selectedQuestionForPreview.correctAnswer}`
                                                }
                                            </Typography>
                                        </Paper>
                                    </Box>
                                )}
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            {showFeedback && (
                                <Button 
                                    onClick={() => {
                                        setSelectedAnswer('');
                                        setShowFeedback(false);
                                        setIsCorrect(false);
                                    }}
                                >
                                    Try Again
                                </Button>
                            )}
                            <Button onClick={handleClosePreview}>
                                {showFeedback ? 'Close' : 'Cancel'}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default QuestionBank; 