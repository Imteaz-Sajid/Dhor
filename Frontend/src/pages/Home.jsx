import React from 'react';
import Navbar from '../components/Navbar';

const Home = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content Area */}
      <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h1
            className="text-5xl font-bold text-indigo-700 mb-3"
            style={{ fontFamily: "'Irish Grover', cursive" }}
          >
            Dhor
          </h1>
          <p className="text-gray-500 italic text-sm mb-8">
            "Crime dekhlei... Dhor!"
          </p>

          <div className="bg-white rounded-2xl shadow-md p-8 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome{user.name ? `, ${user.name}` : ''}!
            </h2>
            <p className="text-gray-600 mb-6">
              Your community safety dashboard. Report incidents, stay alert, and help keep your neighbourhood safe.
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-indigo-50 rounded-xl p-4">
                <p className="text-indigo-700 font-semibold text-lg">0</p>
                <p className="text-gray-600">Reports Filed</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-green-700 font-semibold text-lg">0</p>
                <p className="text-gray-600">Resolved Cases</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4">
                <p className="text-yellow-700 font-semibold text-lg">{user.district || '—'}</p>
                <p className="text-gray-600">District</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-purple-700 font-semibold text-lg">{user.thana || '—'}</p>
                <p className="text-gray-600">Thana</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
