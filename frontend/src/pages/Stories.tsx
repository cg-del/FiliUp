
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookOpen, Plus, Search, Filter, Eye, Edit, Trash2, HelpCircle } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { TeacherSidebar } from '../components/TeacherSidebar';
import { STORY_GENRES, getGenreByValue } from '../constants/storyGenres';
import CreateStoryForm from '../components/CreateStoryForm';
import CreateQuizForm from '../components/CreateQuizForm';

const Stories = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');

  // Mock stories data
  const [stories] = useState([
    {
      id: 1,
      title: "Ang Alamat ng Pinya",
      genre: "ALAMAT",
      difficulty: "Beginner",
      readingTime: 5,
      description: "Isang kwentong alamat tungkol sa pinagmulan ng pinya at ang aral na natutunan dito.",
      status: "Published",
      createdAt: "2024-01-15",
      views: 145,
      completions: 89
    },
    {
      id: 2,
      title: "Si Juan at ang Higanteng Tainga",
      genre: "PABULA",
      difficulty: "Intermediate",
      readingTime: 8,
      description: "Ang kwento ni Juan na natutunan ang kahalagahan ng pakikinig.",
      status: "Draft",
      createdAt: "2024-01-10",
      views: 0,
      completions: 0
    },
    {
      id: 3,
      title: "Ang Matalinong Aso",
      genre: "MAIKLING_KWENTO",
      difficulty: "Beginner",
      readingTime: 6,
      description: "Kwento tungkol sa isang asong naging bayani sa kanyang komunidad.",
      status: "Published",
      createdAt: "2024-01-08",
      views: 203,
      completions: 156
    },
    {
      id: 4,
      title: "Bugtong ni Lola",
      genre: "BUGTONG",
      difficulty: "Advanced",
      readingTime: 3,
      description: "Koleksyon ng mga tradisyonal na bugtong mula sa aming mga ninuno.",
      status: "Published",
      createdAt: "2024-01-05",
      views: 87,
      completions: 45
    }
  ]);

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || story.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-teal-100 text-teal-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TeacherSidebar />
        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-teal-100">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-teal-600" />
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      Stories Management
                    </h1>
                    <p className="text-gray-600 text-sm">Create and manage interactive Filipino stories</p>
                  </div>
                </div>
                <CreateStoryForm />
              </div>
            </header>

            <div className="p-6">
              {/* Search and Filter Section */}
              <div className="mb-8 bg-white rounded-lg p-6 shadow-sm border border-teal-100">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search stories by title or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-teal-200 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none"
                    >
                      <option value="all">All Genres</option>
                      {STORY_GENRES.map(genre => (
                        <option key={genre.value} value={genre.value}>
                          {genre.label}
                        </option>
                      ))}
                    </select>
                    <Button variant="outline" className="border-teal-200 text-teal-600 hover:bg-teal-50">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stories Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStories.map((story) => {
                  const genre = getGenreByValue(story.genre);
                  return (
                    <Card key={story.id} className="hover:shadow-lg transition-shadow border-teal-100">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2 text-gray-900">{story.title}</CardTitle>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                className="text-xs"
                                style={{ 
                                  backgroundColor: genre?.color || '#6b7280',
                                  color: 'white'
                                }}
                              >
                                {genre?.label || story.genre}
                              </Badge>
                              <Badge className={`text-xs ${getDifficultyColor(story.difficulty)}`}>
                                {story.difficulty}
                              </Badge>
                              <Badge className={`text-xs ${getStatusColor(story.status)}`}>
                                {story.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <CardDescription className="text-sm text-gray-600">
                          {story.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Story Stats */}
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-teal-50 p-3 rounded-lg">
                              <p className="text-lg font-semibold text-teal-600">{story.readingTime}</p>
                              <p className="text-xs text-gray-500">Minutes</p>
                            </div>
                            <div className="bg-cyan-50 p-3 rounded-lg">
                              <p className="text-lg font-semibold text-cyan-600">{story.views}</p>
                              <p className="text-xs text-gray-500">Views</p>
                            </div>
                            <div className="bg-teal-50 p-3 rounded-lg">
                              <p className="text-lg font-semibold text-teal-600">{story.completions}</p>
                              <p className="text-xs text-gray-500">Completed</p>
                            </div>
                          </div>

                          {/* Create Quiz Button */}
                          <div className="mb-3">
                            <CreateQuizForm triggerClassName="w-full" />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1 text-teal-600 border-teal-200 hover:bg-teal-50">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 text-cyan-600 border-cyan-200 hover:bg-cyan-50">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="text-xs text-gray-500 text-center">
                            Created: {new Date(story.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredStories.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No stories found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || selectedGenre !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'Create your first story to get started.'}
                  </p>
                  <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Story
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Stories;
