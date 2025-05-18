// 'use client';

// import { useState } from 'react';
// import Image from 'next/image';

// export default function RegisterPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleRegister = async () => {
//     setLoading(true);
//     setError('');
    
//     try {
//       const response = await fetch('/api/auth/register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Registration failed');
//       }
      
//       // Redirect to login page after successful registration
//       window.location.href = '/login';
//     } catch (err) {
//       if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError('An unknown error occurred');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50">
//       <div className="w-full max-w-md p-6">
//         <div className="flex justify-center mb-6">
//           <div className="relative w-24 h-24">
//             <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4 bg-yellow-100 px-4 py-1 rounded border border-gray-300 z-10">
//               <div className="h-2"></div>
//             </div>
//             <div className="absolute inset-0 bg-pink-100 rounded-lg flex items-center justify-center">
//               <div className="text-4xl font-serif text-blue-700 mt-2">Jotty</div>
//               <div className="absolute top-4 left-4">
//                 <svg className="w-5 h-5 text-blue-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
//                 </svg>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">Create Account</h1>
        
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//             {error}
//           </div>
//         )}
        
//         <div>
//           <div className="mb-4">
//             <input
//               type="email"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
//             />
//           </div>
          
//           <div className="mb-6">
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
//             />
//           </div>
          
//           <button
//             onClick={handleRegister}
//             disabled={loading}
//             className="w-full py-3 bg-pink-300 text-blue-800 font-semibold rounded-lg hover:bg-pink-400"
//           >
//             {loading ? 'Registering...' : 'Register'}
//           </button>
//         </div>
        
//         <div className="text-center mt-6">
//           <a href="/login" className="text-blue-800 hover:underline">
//             Already have an account? Login
//           </a>
//         </div>
        
//         <div className="flex justify-center mt-12">
//           <div className="w-12 h-1 bg-yellow-300 rounded-full"></div>
//         </div>
        
//         <div className="mt-12 flex justify-center">
//           <div className="w-16 h-1 bg-black rounded-full"></div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

export default function Registration(){
    return (
        <div className = "items-center justify-center bg-yellow-100" >
            
        </div>
    )
}