// admin-api.ts
export async function fetchUsers(page = 1, limit = 10) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch users');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function getUserById(userId: string) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch('/api/admin', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch('/api/admin/users/update', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, role }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update user role');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

export async function deleteUser(userId: string) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch('/api/admin/users/update', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete user');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}