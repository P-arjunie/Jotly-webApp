'use client';
import { useState, useEffect } from 'react';

interface Task {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    dueDate: string;
    dueTime?: string;
}

interface DashboardProps {
    setIsAuthenticated?: (isAuthenticated: boolean) => void;
}

export default function Dashboard(props: DashboardProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [dueDate, setDueDate] = useState<string>('');
    const [dueTime, setDueTime] = useState<string>('');
    const [showAddTask, setShowAddTask] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        fetchTasks();
    }, []);

    const fetchTasks = async (): Promise<void> => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/tasks', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Failed to fetch tasks');
            }

            const data: Task[] = await response.json();
            setTasks(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (): Promise<void> => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    completed: false,
                    dueDate,
                    dueTime: dueTime ? `${dueDate}T${dueTime}:00` : `${dueDate}T00:00:00`
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add task');
            }

            // Clear form
            setTitle('');
            setDescription('');
            setDueDate('');
            setDueTime('');
            setShowAddTask(false);

            // Refresh tasks
            fetchTasks();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleLogout = (): void => {
        localStorage.removeItem('token');
        if (props.setIsAuthenticated) {
            props.setIsAuthenticated(false);
            window.history.pushState({}, '', '/login');
        } else {
            window.location.href = '/login';
        }
    };

    const toggleTaskCompletion = async (taskId: number, currentStatus: boolean): Promise<void> => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    completed: !currentStatus
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            setTasks(tasks.map(task => 
                task.id === taskId ? { ...task, completed: !currentStatus } : task
            ));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const formatDate = (dateString: string): string => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="min-h-screen bg-yellow-50">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mr-4">
                            <span className="text-xl font-serif text-blue-700">J</span>
                        </div>
                        <h1 className="text-2xl font-bold text-blue-800">Jotty Tasks</h1>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900"
                    >
                        Logout
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-blue-800">My Tasks</h2>
                        <button 
                            onClick={() => setShowAddTask(!showAddTask)}
                            className="px-4 py-2 bg-pink-300 text-blue-800 rounded-lg hover:bg-pink-400"
                        >
                            {showAddTask ? 'Cancel' : '+ Add Task'}
                        </button>
                    </div>

                    {showAddTask && (
                        <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Task title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                />
                            </div>
                            <div className="mb-4">
                                <textarea
                                    placeholder="Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                    rows={3}
                                ></textarea>
                            </div>
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="time"
                                        value={dueTime}
                                        onChange={(e) => setDueTime(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleAddTask}
                                className="w-full py-2 bg-pink-300 text-blue-800 font-semibold rounded-lg hover:bg-pink-400"
                            >
                                Add Task
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 border-4 border-blue-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="mt-2 text-blue-800">Loading tasks...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No tasks yet. Click "Add Task" to create your first task!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tasks.map(task => (
                                <div 
                                    key={task.id} 
                                    className={`border rounded-lg p-4 ${task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start">
                                            <div className="mr-3 mt-1">
                                                <button 
                                                    onClick={() => toggleTaskCompletion(task.id, task.completed)}
                                                    className={`w-5 h-5 rounded border flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}
                                                >
                                                    {task.completed && (
                                                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                            <div>
                                                <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-blue-800'}`}>
                                                    {task.title}
                                                </h3>
                                                {task.description && (
                                                    <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs px-2 py-1 rounded ${task.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {formatDate(task.dueDate)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
