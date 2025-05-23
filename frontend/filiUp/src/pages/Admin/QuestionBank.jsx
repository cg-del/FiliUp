import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    TextField,
    Typography
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const QuestionBank = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        questionText: '',
        options: '',
        correctAnswer: ''
    });

    const accessToken = localStorage.getItem('accessToken');

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/question-bank', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            setQuestions(response.data);
            setLoading(false);
            setError('');
        } catch (error) {
            setError('Failed to load questions. Please try again.');
            setLoading(false);
        }
    };

    const handleOpenDialog = (question = null) => {
        if (question) {
            setSelectedQuestion(question);
            setFormData({
                title: question.title,
                questionText: question.questionText,
                options: question.options,
                correctAnswer: question.correctAnswer
            });
        } else {
            setSelectedQuestion(null);
            setFormData({
                title: '',
                questionText: '',
                options: '',
                correctAnswer: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedQuestion(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userId = JSON.parse(localStorage.getItem('user')).userId;
            if (selectedQuestion) {
                await axios.put(
                    `http://localhost:8080/api/question-bank/${selectedQuestion.questionId}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );
            } else {
                await axios.post(
                    'http://localhost:8080/api/question-bank',
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        },
                        params: { userId }
                    }
                );
            }
            handleCloseDialog();
            fetchQuestions();
        } catch (error) {
            setError('Failed to save question. Please try again.');
        }
    };

    const handleDelete = async (questionId) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            try {
                await axios.delete(`http://localhost:8080/api/question-bank/${questionId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                fetchQuestions();
            } catch (error) {
                setError('Failed to delete question. Please try again.');
            }
        }
    };

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
                <Typography variant="h4">Question Bank</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Question
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {questions.map((question) => (
                    <Grid item xs={12} md={6} key={question.questionId}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                    <Typography variant="h6" gutterBottom>
                                        {question.title}
                                    </Typography>
                                    <Box>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDialog(question)}
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
                                <Typography variant="body1" gutterBottom>
                                    {question.questionText}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Options:
                                </Typography>
                                {question.options.split('\n').map((option, index) => (
                                    <Typography key={index} variant="body2" color="textSecondary">
                                        {String.fromCharCode(65 + index)}. {option}
                                    </Typography>
                                ))}
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                    Correct Answer: {question.correctAnswer}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedQuestion ? 'Edit Question' : 'Add New Question'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Title"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Question Text"
                                    multiline
                                    rows={3}
                                    value={formData.questionText}
                                    onChange={(e) =>
                                        setFormData({ ...formData, questionText: e.target.value })
                                    }
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Options (one per line)"
                                    multiline
                                    rows={4}
                                    value={formData.options}
                                    onChange={(e) =>
                                        setFormData({ ...formData, options: e.target.value })
                                    }
                                    required
                                    helperText="Enter each option on a new line"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Correct Answer"
                                    value={formData.correctAnswer}
                                    onChange={(e) =>
                                        setFormData({ ...formData, correctAnswer: e.target.value })
                                    }
                                    required
                                    helperText="Enter the letter of the correct answer (A, B, C, etc.)"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {selectedQuestion ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuestionBank; 