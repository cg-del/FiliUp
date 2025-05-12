import { Box, CircularProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React from 'react';

export default function ClassRecord({ students, stories, scores, studentsLoading, studentsError }) {
  return (
    <Paper sx={{ p: 4, mb: 3 }}>
      <Typography variant="h5" gutterBottom>Class Record</Typography>
      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {/* Students Enrolled */}
        <Paper sx={{ p: 2, minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ bgcolor: '#e0e7ff', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <span role="img" aria-label="students" style={{ fontSize: 22 }}>👥</span>
          </Box>
          <Typography variant="h6" fontWeight="bold">{students.length}</Typography>
          <Typography variant="body2" color="text.secondary">Students enrolled</Typography>
        </Paper>
        {/* Average Grade */}
        <Paper sx={{ p: 2, minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ bgcolor: '#e0e7ff', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <span role="img" aria-label="grade" style={{ fontSize: 22 }}>🎓</span>
          </Box>
          <Typography variant="h6" fontWeight="bold">-</Typography>
          <Typography variant="body2" color="text.secondary">Average grade</Typography>
        </Paper>
        {/* Average Topics Completed */}
        <Paper sx={{ p: 2, minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ bgcolor: '#e0e7ff', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <span role="img" aria-label="topics" style={{ fontSize: 22 }}>📖</span>
          </Box>
          <Typography variant="h6" fontWeight="bold">-</Typography>
          <Typography variant="body2" color="text.secondary">Average topics completed</Typography>
        </Paper>
      </Box>
      {studentsLoading ? (
        <Stack alignItems="center"><CircularProgress /></Stack>
      ) : studentsError ? (
        <Typography color="error">{studentsError}</Typography>
      ) : students.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Student Name</b></TableCell>
                {stories.length > 0 ? (
                  stories.map(story => (
                    <TableCell key={story.storyId} align="center">
                      <b>{story.title}</b>
                    </TableCell>
                  ))
                ) : (
                  <TableCell align="center" colSpan={1}>
                    <i>No stories available for this class.</i>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map(student => (
                <TableRow key={student.userId}>
                  <TableCell>{student.userName}</TableCell>
                  {stories.length > 0 ? (
                    stories.map(story => (
                      <TableCell key={story.storyId} align="center">
                        {scores?.[student.userId]?.[story.storyId] ?? '-'}
                      </TableCell>
                    ))
                  ) : (
                    <TableCell align="center">-</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No students available for this class.</Typography>
      )}
    </Paper>
  );
} 