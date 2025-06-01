import React, { useState, useEffect } from 'react';
import classService from '../services/classService';
import { useParams } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button,
  Box,
  CircularProgress,
  Alert,
  Avatar,
  Chip
} from '@mui/material';
import { User, CheckCircle } from 'lucide-react';

const PendingEnrollments = () => {
  const { classCode } = useParams();
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPendingEnrollments();
  }, [classCode]);

  const fetchPendingEnrollments = async () => {
    try {
      setLoading(true);
      const response = await classService.getPendingEnrollments(classCode);
      setPendingStudents(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch pending enrollments. Please try again later.');
      console.error('Error fetching pending enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptStudent = async (userId) => {
    try {
      await classService.acceptEnrollment(classCode, userId);
      setSuccessMessage('Student enrollment accepted successfully!');
      // Refresh the pending enrollments list
      fetchPendingEnrollments();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Failed to accept student. Please try again.');
      console.error('Error accepting student:', err);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" component="h1">
          Pending Enrollments
        </Typography>
        <Chip 
          label={`${pendingStudents.length} Pending`} 
          color="primary" 
          size="medium"
        />
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          icon={<CheckCircle size={20} />}
        >
          {successMessage}
        </Alert>
      )}

      {pendingStudents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
          <Typography variant="body1" color="text.secondary">
            No pending enrollment requests.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Section</TableCell>
                <TableCell>Performance History</TableCell>
                <TableCell>Enrollment Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingStudents.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {student.userProfilePictureUrl ? (
                        <Avatar 
                          src={student.userProfilePictureUrl} 
                          alt={student.studentName}
                        />
                      ) : (
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <User size={20} />
                        </Avatar>
                      )}
                      <Box>
                        <Typography variant="subtitle2">
                          {student.studentName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {student.studentEmail}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {student.section || 'Not Specified'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        Average Score: {student.averageScore ? `${student.averageScore}%` : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quizzes Taken: {student.numberOfQuizTakes || 0}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(student.enrollmentDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAcceptStudent(student.userId)}
                      startIcon={<CheckCircle size={18} />}
                      sx={{
                        bgcolor: '#0891b2',
                        '&:hover': {
                          bgcolor: '#0e7490',
                        }
                      }}
                    >
                      Accept
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default PendingEnrollments; 